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
  const newsApiKey = normalizeEnvString(process.env.NEWSAPI_KEY);
  const nvidiaApiKey = normalizeEnvString(process.env.NVIDIA_BUILD_API_KEY);
  const newsBaseUrl = normalizeEnvString(process.env.NEWSAPI_BASE_URL, "https://newsapi.org/v2").replace(/\/$/, "");
  const nvidiaBaseUrl = normalizeEnvString(process.env.NVIDIA_BUILD_BASE_URL, "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
  const nvidiaModel = normalizeEnvString(process.env.NVIDIA_BUILD_MODEL_FAST, "nvidia/llama-3.1-nemotron-nano-8b-v1");

  const newsApiResult = await (async () => {
    if (!newsApiKey) {
      return { keyPresent: false, status: null, body: { message: "missing key" } };
    }

    const url = new URL(`${newsBaseUrl}/top-headlines`);
    url.searchParams.set("country", "us");
    url.searchParams.set("category", "technology");
    url.searchParams.set("language", "en");
    url.searchParams.set("pageSize", "1");
    url.searchParams.set("apiKey", newsApiKey);

    const response = await fetchWithTimeout(url, {
      cache: "no-store"
    }, 6000);

    return {
      keyPresent: true,
      status: response.status,
      body: readJsonSummary(await response.text())
    };
  })();

  const nvidiaResult = await (async () => {
    if (!nvidiaApiKey) {
      return { keyPresent: false, status: null, body: { message: "missing key" } };
    }

    const response = await fetchWithTimeout(`${nvidiaBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${nvidiaApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: nvidiaModel,
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
        newsApiKeyPresent: Boolean(newsApiKey),
        nvidiaApiKeyPresent: Boolean(nvidiaApiKey),
        newsBaseUrl,
        nvidiaBaseUrl,
        nvidiaModel
      },
      newsApi: newsApiResult,
      nvidia: nvidiaResult
    },
    { status: 200 }
  );
}