export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const CANONICAL_HOST = "https://plumbers-dubai.com";
  const url = new URL(context.request.url);
  const canonicalUrl = CANONICAL_HOST + url.pathname;

  const GA4 = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-SR0827W9HM"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SR0827W9HM');</script>`;

  const TRACKER = `<script>window._ftSite="Aqua Plumber";window._ftKey="CF-AQUA-2026-m4p8q2";</script><script src="https://cdn.jsdelivr.net/gh/clickadsprotector/fraud-tracker@36dab8a30779d9dd31270f56c65f6fbd1523023a/tracker.js"></script>`;

  const CANONICAL = `<link rel="canonical" href="${canonicalUrl}">`;

  return new HTMLRewriter()
    .on("head", {
      element(el) {
        el.append(CANONICAL, { html: true });
        el.append(GA4, { html: true });
        el.append(TRACKER, { html: true });
      },
    })
    .transform(response);
}
