export interface Env {
  ORIGIN_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = env.ORIGIN_URL || "https://enter-biographies-gentleman-humans.trycloudflare.com";
    const originUrl = new URL(origin);
    const clientUrl = new URL(request.url);

    // Build target destination URL
    const targetUrl = new URL(clientUrl.pathname + clientUrl.search, origin);

    // Clone request headers and inject proxy metadata
    const headers = new Headers(request.headers);
    headers.set("Host", originUrl.host);
    headers.set("X-Forwarded-Host", clientUrl.host);
    headers.set("X-Forwarded-Proto", "https");

    // Fetch from origin tunnel
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: "manual",
    });

    // Copy response headers and rewrite redirect locations to client domain
    const responseHeaders = new Headers(response.headers);
    const location = responseHeaders.get("Location");
    if (location) {
      try {
        const locUrl = new URL(location, origin);
        if (locUrl.host === originUrl.host) {
          locUrl.protocol = clientUrl.protocol;
          locUrl.host = clientUrl.host;
          responseHeaders.set("Location", locUrl.toString());
        }
      } catch {
        // Leave relative location intact
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
