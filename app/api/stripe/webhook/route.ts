import Stripe from "stripe";
import { getDb } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook secret is not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // @ts-expect-error Stripe SDK types are outdated; this API version is valid at runtime
    apiVersion: "2025-04-30.basil"
  });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "pro" | "team" | undefined;

        if (!userId || !plan) {
          console.error("Missing metadata in checkout.session.completed");
          break;
        }

        // Fetch the actual subscription to get the real current_period_end
        // (session.expires_at is the checkout session expiry, not the subscription period end)
        let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const subscriptionId = session.subscription as string;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const sub = subscription as unknown as { current_period_end?: number };
          if (sub.current_period_end) {
            currentPeriodEnd = new Date(sub.current_period_end * 1000);
          }
        }

        const existingSubscription = await getDb().query.subscriptions.findFirst({
          where: eq(subscriptions.userId, userId)
        });

        if (existingSubscription) {
          await getDb().update(subscriptions)
            .set({
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string | null,
              plan,
              status: "active",
              currentPeriodEnd,
              updatedAt: new Date()
            })
            .where(eq(subscriptions.id, existingSubscription.id));
        } else {
          await getDb().insert(subscriptions).values({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string | null,
            plan,
            status: "active",
            currentPeriodEnd
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as unknown as { subscription?: string };
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;
          await getDb()
            .update(subscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingRecord = await getDb().query.subscriptions.findFirst({
          where: eq(subscriptions.stripeCustomerId, customerId)
        });

        if (existingRecord) {
          const status = subscription.status === "active" ? "active" : subscription.status;
          await getDb().update(subscriptions)
            .set({
              stripeSubscriptionId: subscription.id,
              plan: (subscription.metadata?.plan as "pro" | "team") ?? existingRecord.plan,
              status,
              currentPeriodEnd: new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000),
              updatedAt: new Date()
            })
            .where(eq(subscriptions.id, existingRecord.id));
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingRecord = await getDb().query.subscriptions.findFirst({
          where: eq(subscriptions.stripeCustomerId, customerId)
        });

        if (existingRecord) {
          await getDb().update(subscriptions)
            .set({
              stripeSubscriptionId: null,
              plan: "free",
              status: "canceled",
              updatedAt: new Date()
            })
            .where(eq(subscriptions.id, existingRecord.id));
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.userId;
        const plan = (subscription.metadata?.plan as "pro" | "team") ?? "pro";

        const sub = subscription as unknown as { current_period_end?: number };
        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        if (userId) {
          const existingRecord = await getDb().query.subscriptions.findFirst({
            where: eq(subscriptions.userId, userId)
          });

          if (existingRecord) {
            await getDb().update(subscriptions)
              .set({
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscription.id,
                plan,
                status: subscription.status === "active" ? "active" : subscription.status,
                currentPeriodEnd,
                updatedAt: new Date()
              })
              .where(eq(subscriptions.id, existingRecord.id));
          } else {
            await getDb().insert(subscriptions).values({
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              plan,
              status: subscription.status === "active" ? "active" : subscription.status,
              currentPeriodEnd
            });
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}