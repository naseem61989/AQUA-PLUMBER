// ============================================================
// CONVERSION TRACKING EVENTS
// Phone, WhatsApp, Form — GA4 events fire honge
// ============================================================
const CONVERSION_EVENTS = `<script>
document.addEventListener('DOMContentLoaded', function() {
  function safe_gtag() {
    if (typeof gtag === 'function') {
      gtag.apply(null, arguments);
    }
  }
  // 1. PHONE CLICK
  document.querySelectorAll('a[href^="tel:"]').forEach(function(el) {
    el.addEventListener('click', function() {
      safe_gtag('event', 'phone_call_click', {
        phone_number: el.getAttribute('href'),
        page_location: window.location.href
      });
    });
  });
  // 2. WHATSAPP CLICK
  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(function(el) {
    el.addEventListener('click', function() {
      safe_gtag('event', 'whatsapp_click', {
        page_location: window.location.href
      });
    });
  });
  // 3. FORM SUBMIT
  document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('submit', function() {
      safe_gtag('event', 'form_submit', {
        form_id: form.id || form.className || 'contact_form',
        page_location: window.location.href
      });
    });
  });
});
<\/script>`;

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }
  const CANONICAL_HOST = "https://plumbers-dubai.com";
  const url = new URL(context.request.url);
  const canonicalUrl = CANONICAL_HOST + url.pathname;
  const CANONICAL = `<link rel="canonical" href="${canonicalUrl}">`;

  // ── EDGE IP CAPTURE (Unknown IP ka fix) — ye 2 lines har site pe SAME ──
  const clientIP  = String(context.request.headers.get("CF-Connecting-IP") || "Unknown").replace(/[^A-Za-z0-9_.:\-]/g, "");
  const ipCountry = String(context.request.headers.get("CF-IPCountry") || "").replace(/[^A-Za-z0-9_.:\-]/g, "");

  const GA4 = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-SR0827W9HM"><\/script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SR0827W9HM');<\/script>`;
  const TRACKER = `<script>window._ftSite="Aqua Plumber";window._ftKey="CF-AQUA-2026-m4p8q2";window._ftIP="${clientIP}";window._ftCountry="${ipCountry}";<\/script><script src="https://cdn.jsdelivr.net/gh/clickadsprotector/fraud-tracker@main/tracker.js"><\/script>`;

  return new HTMLRewriter()
    .on("link[rel='canonical']", {
      element(el) {
        el.remove();
      },
    })
    .on("head", {
      element(el) {
        el.append(CANONICAL, { html: true });
        el.append(GA4, { html: true });
        el.append(TRACKER, { html: true });
      },
    })
    .on("body", {
      element(el) {
        el.append(CONVERSION_EVENTS, { html: true });
      },
    })
    .transform(response);
}
