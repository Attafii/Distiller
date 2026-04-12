import { NextResponse } from "next/server";

import { fetchWithTimeout } from "@/lib/http";
import { normalizeEnvString } from "@/lib/utils";

export const dynamic = "force-dynamic";

function readJsonSummary(text: string) {
  try {
    const json = JSON.parse(text) as {
      status?: string;
      code?: string;
      message?: string;
      totalResults?: number;
      articles?: unknown[];
    };

    return {
      status: json.status ?? null,
      code: json.code ?? null,
      message: json.message ?? null,
      totalResults: typeof json.totalResults === "number" ? json.totalResults : null,
      articleCount: Array.isArray(json.articles) ? json.articles.length : null
    };
  } catch {
    return {
      raw: text.slice(0, 500)
    };
  }
}

export async function GET() {
  const contentApiKey = normalizeEnvString(process.env.NEWSAPI_KEY);
  const aiServiceKey = normalizeEnvString(process.env.NVIDIA_BUILD_API_KEY);
  const contentBaseUrl = normalizeEnvString(process.env.NEWSAPI_BASE_URL, "https://newsapi.org/v2").replace(/\/$/, "");
  const aiServiceBaseUrl = normalizeEnvString(process.env.NVIDIA_BUILD_BASE_URL, "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
  const aiServiceModel = normalizeEnvString(process.env.NVIDIA_BUILD_MODEL_FAST, "nvidia/llama-3.1-nemotron-nano-8b-v1");

  const contentApiResult = await (async () => {
    if (!contentApiKey) {
      return { keyPresent: false, status: null, body: { message: "missing key" } };
    }

    const url = new URL(`${contentBaseUrl}/top-headlines`);
    url.searchParams.set("country", "us");
    url.searchParams.set("category", "technology");
    url.searchParams.set("language", "en");
    url.searchParams.set("pageSize", "1");
    url.searchParams.set("apiKey", contentApiKey);

    const response = await fetchWithTimeout(url, {
      cache: "no-store"
    }, 6000);

    return {
      keyPresent: true,
      status: response.status,
      body: readJsonSummary(await response.text())
    };
  })();

  const aiServiceResult = await (async () => {
    if (!aiServiceKey) {
      return { keyPresent: false, status: null, body: { message: "missing key" } };
    }

    const response = await fetchWithTimeout(`${aiServiceBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiServiceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiServiceModel,
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
      keyPresent: true,
      status: response.status,
      body: readJsonSummary(await response.text())
    };
  })();

  return NextResponse.json(
    {
      env: {
        contentApiKeyPresent: Boolean(contentApiKey),
        aiServiceKeyPresent: Boolean(aiServiceKey),
        contentBaseUrl,
        aiServiceBaseUrl,
        aiServiceModel
      },
      contentApi: contentApiResult,
      aiService: aiServiceResult
    },
    { status: 200 }
  );
}