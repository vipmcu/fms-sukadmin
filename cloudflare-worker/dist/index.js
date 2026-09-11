// src/index.ts
var index_default = {
  async fetch(request, env) {
    const origin = env.ORIGIN_URL || "https://enter-biographies-gentleman-humans.trycloudflare.com";
    const originUrl = new URL(origin);
    const clientUrl = new URL(request.url);
    const targetUrl = new URL(clientUrl.pathname + clientUrl.search, origin);
    const headers = new Headers(request.headers);
    headers.set("Host", originUrl.host);
    headers.set("X-Forwarded-Host", clientUrl.host);
    headers.set("X-Forwarded-Proto", "https");
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual"
    });
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
      }
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
