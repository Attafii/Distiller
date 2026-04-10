type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

export const DISTILLER_USER_AGENT = "Distiller/1.0";

export async function fetchWithTimeout(
  input: FetchInput,
  init: FetchInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const externalSignal = init?.signal;
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", DISTILLER_USER_AGENT);
  }

  const requestInit = { ...init, headers, signal: controller.signal };
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const abortFromExternalSignal = () => {
    controller.abort(externalSignal?.reason);
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", abortFromExternalSignal, { once: true });
    }
  }

  timeoutHandle = setTimeout(() => controller.abort(new Error("Request timed out")), timeoutMs);

  try {
    return await fetch(input, requestInit);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }

    if (externalSignal) {
      externalSignal.removeEventListener("abort", abortFromExternalSignal);
    }
  }
}
