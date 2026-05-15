import { NextResponse } from "next/server";

import { fetchWithTimeout } from "@/lib/http";
import { normalizeEnvString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const contentApiKey = normalizeEnvString(process.env.NEWSAPI_KEY);
  const aiServiceKey = normalizeEnvString(process.env.NVIDIA_BUILD_API_KEY);
  const contentBaseUrl = normalizeEnvString(process.env.NEWSAPI_BASE_URL, "https://newsapi.org/v2").replace(/\/$/, "");
  const aiServiceBaseUrl = normalizeEnvString(process.env.NVIDIA_BUILD_BASE_URL, "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");

  const fastModel = normalizeEnvString(process.env.NVIDIA_BUILD_MODEL_FAST, "nvidia/llama-3.1-nemotron-nano-8b-v1");
  const balancedModel = normalizeEnvString(process.env.NVIDIA_BUILD_MODEL_BALANCED, "nvidia/llama-3.3-nemotron-super-49b-v1");
  const embedModel = normalizeEnvString(process.env.NVIDIA_BUILD_EMBED_MODEL, "nvidia/nv-embedqa-e5-v5");

  const contentApiResult = await (async () => {
    if (!contentApiKey) {
      return { configured: false, status: null, body: { message: "missing key" } };
    }

    try {
      const url = new URL(`${contentBaseUrl}/top-headlines`);
      url.searchParams.set("country", "us");
      url.searchParams.set("category", "technology");
      url.searchParams.set("language", "en");
      url.searchParams.set("pageSize", "1");
      url.searchParams.set("apiKey", contentApiKey);

      const response = await fetchWithTimeout(url, { cache: "no-store" }, 6000);

      return {
        configured: true,
        status: response.status,
        body: { message: response.status === 200 ? "operational" : "error" }
      };
    } catch {
      return { configured: true, status: null, body: { message: "connection failed" } };
    }
  })();

  const chatResult = await (async () => {
    if (!aiServiceKey) {
      return { configured: false, status: null, body: { message: "missing key" } };
    }

    try {
      const response = await fetchWithTimeout(`${aiServiceBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiServiceKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: balancedModel,
          messages: [
            { role: "system", content: 'Return JSON only: {"answer":"ok"}' },
            { role: "user", content: "Say ok" }
          ],
          temperature: 0.1,
          max_tokens: 20,
          response_format: { type: "json_object" }
        }),
        cache: "no-store"
      }, 6000);

      return {
        configured: true,
        status: response.status,
        body: { message: response.status === 200 ? "operational" : "error" }
      };
    } catch {
      return { configured: true, status: null, body: { message: "connection failed" } };
    }
  })();

  const embedResult = await (async () => {
    if (!aiServiceKey) {
      return { configured: false, status: null, body: { message: "missing key" } };
    }

    try {
      const response = await fetchWithTimeout(`${aiServiceBaseUrl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiServiceKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: embedModel,
          input: "health check"
        }),
        cache: "no-store"
      }, 6000);

      return {
        configured: true,
        status: response.status,
        body: { message: response.status === 200 ? "operational" : "error" }
      };
    } catch {
      return { configured: true, status: null, body: { message: "connection failed" } };
    }
  })();

  const allOperational = contentApiResult.status === 200 && chatResult.status === 200 && embedResult.status === 200;
  const anyConfigured = contentApiKey || aiServiceKey;

  return NextResponse.json(
    {
      status: allOperational ? "healthy" : anyConfigured ? "degraded" : "unconfigured",
      timestamp: new Date().toISOString(),
      services: {
        newsApi: contentApiResult,
        aiChat: chatResult,
        aiEmbeddings: embedResult
      }
    },
    { status: 200 }
  );
}