// ============================================================
// GA4 ko Ads se LINK rehne dein, lekin GA4 events Ads me IMPORT mat
// karein — warna har lead do baar ginegi.
// ============================================================
const TRACKING_EVENTS = `<script>
(function () {
  function initTracking() {
    var AW_ID = "AW-16740553814";
    var LBL = { phone: "RumHCI2v1OUcENaowq4-", whatsapp: "beXMCJCv1OUcENaowq4-", form: "gN3TCJOv1OUcENaowq4-" };
    var SITE_KEY = "CF-AQUA-2026-m4p8q2";
    var LEAD_URL = "https://clickadsprotector.com/api/lead";
    function safe_gtag() {
      if (typeof gtag === 'function') {
        gtag.apply(null, arguments);
      }
    }

    var P = new URLSearchParams(window.location.search);
    var gclid = P.get('gclid') || P.get('wbraid') || P.get('gbraid') || '';
    try {
      if (gclid) {
        localStorage.setItem('cap_gclid', JSON.stringify({ v: gclid, t: Date.now() }));
      } else {
        var st = JSON.parse(localStorage.getItem('cap_gclid') || 'null');
        if (st && st.v && (Date.now() - st.t) < 7776000000) { gclid = st.v; }
      }
    } catch (e) {}

    // The client's own form posts somewhere we never see - their CRM,
    // their inbox - so it needs the click id carried on the form itself.
    // Called again on submit, because a popup or an AJAX plugin can add
    // a form long after this first pass.
    function stampForm(f) {
      if (!gclid || !f) return;
      try {
        if (f.querySelector('input[name="gclid"]')) return;
        var h = document.createElement('input');
        h.type = 'hidden'; h.name = 'gclid'; h.value = gclid;
        f.appendChild(h);
      } catch (e) {}
    }

    var _forms = document.querySelectorAll('form');
    for (var _i = 0; _i < _forms.length; _i++) { stampForm(_forms[_i]); }

    function readLead(scope) {
      var val = function(sel) {
        var el = scope.querySelector(sel);
        return el && el.value ? String(el.value).trim() : '';
      };
      var pick = function(names) {
        for (var i = 0; i < names.length; i++) {
          var v = val('[name="' + names[i] + '"]') || val('#' + names[i]);
          if (v) return v;
        }
        return '';
      };
      return {
        name:    pick(['name','fullname','your-name','firstname']),
        phone:   pick(['phone','tel','mobile','number']),
        email:   pick(['email','your-email']),
        service: pick(['svc','service','subject','message']),
        gclid:   pick(['gclid'])
      };
    }

    // LEAD CAPTURE - the lead and the click that produced it.
    // Every way a visitor can make contact goes through here, not just the
    // form: on these sites a call or a WhatsApp tap IS the lead, and a job
    // that started with a tap would otherwise be invisible to offline
    // conversion upload.
    function sendLead(kind, form, botFill) {
      try {
        // No click id means nothing could ever be uploaded to Google. For a
        // bare tap that leaves nothing worth storing; a form still has a name
        // and number the office can use.
        if (kind !== 'form' && !gclid) return;
        // A tap carries no fields of its own, but the visitor may have typed
        // into the form before deciding to call instead.
        var d = readLead(form || document);
        // An empty form is not a lead. It is the page's own validation
        // refusing the submit, and sending it would put a blank row in front
        // of whoever taps through the list.
        if (kind === 'form' && !d.name && !d.phone && !d.email) return;
        navigator.sendBeacon(LEAD_URL, new Blob([JSON.stringify({
          client_token: SITE_KEY,
          kind: kind,
          name:    d.name,
          phone:   d.phone,
          email:   d.email,
          service: d.service,
          page_url: window.location.href,
          gclid: gclid || d.gclid,
          bot_suspected: botFill ? 1 : 0
        })], { type: 'text/plain' }));
      } catch (e) {}
    }

    function track(ga4Name, lbl, params) {
      safe_gtag('event', ga4Name, params);
      if (AW_ID && lbl) {
        safe_gtag('event', 'conversion', {
          send_to: AW_ID + '/' + lbl,
          transport_type: 'beacon'
        });
      }
    }

    // Delegated on document rather than bound per element: themes and plugins
    // add the popup form, the AJAX form and the sticky call bar AFTER load,
    // and a listener bound at startup never sees any of them. Capture phase,
    // so a page handler that stops propagation cannot hide a click either.
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var tel = t.closest('a[href^="tel:"]');
      if (tel) {
        track('phone_call_click', LBL.phone, {
          phone_number: tel.getAttribute('href'),
          page_location: window.location.href
        });
        sendLead('call', null, false);
        return;
      }
      var wa = t.closest('a[href*="wa.me"], a[href*="whatsapp"]');
      if (wa) {
        track('whatsapp_click', LBL.whatsapp, {
          page_location: window.location.href
        });
        sendLead('whatsapp', null, false);
      }
    }, true);

    // Capture matters twice over here. The page's own submit handler ends with
    // form.reset() and it runs at the form, so reading the fields any later
    // means reading a form that has already been cleared - the lead used to
    // leave with an empty name and phone while WhatsApp still opened and every
    // conversion still fired, so nothing looked broken anywhere.
    document.addEventListener('submit', function (ev) {
      var form = ev.target;
      if (!form || form.tagName !== 'FORM') return;
      // Capture runs before the page's handler and before the form is
      // serialised, so a form that appeared after load still leaves
      // carrying the click id.
      stampForm(form);
      var hp = form.querySelector('.ftv11-hp');
      var botFill = !!(hp && hp.value !== '');
      track('form_submit', botFill ? '' : LBL.form, {
        form_id: form.id || form.className || 'contact_form',
        page_location: window.location.href,
        bot_suspected: botFill ? 1 : 0
      });
      sendLead('form', form, botFill);
    }, true);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracking);
  } else {
    initTracking();
  }
})();
</script>`;

const EU_COUNTRIES = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH"];

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // ============================================================
  // CANONICAL URL   <-- PER-CLIENT: sirf CANONICAL_HOST change karo
  // ============================================================
  const CANONICAL_HOST = "https://plumbers-dubai.com";
  const url = new URL(context.request.url);
  const canonicalUrl = CANONICAL_HOST + url.pathname;
  const CANONICAL = `<link rel="canonical" href="${canonicalUrl}">`;

  // ============================================================
  // EDGE IP — Cloudflare set karta hai, fake nahi ho sakta
  // ============================================================
  const clientIP  = String(context.request.headers.get("CF-Connecting-IP") || "Unknown").replace(/[^A-Za-z0-9_.:\-]/g, "");
  const ipCountry = String(context.request.headers.get("CF-IPCountry") || "").replace(/[^A-Za-z0-9_.:\-]/g, "");

  // ============================================================
  // CONSENT MODE v2 — sirf EEA/UK/CH. Har tag se PEHLE jana zaroori hai.
  // ============================================================
  const needsConsent = EU_COUNTRIES.indexOf(ipCountry) !== -1;
  const CONSENT = needsConsent
    ? `<script>window._ccRequired=true;window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});</script>`
    : `<script>window._ccRequired=false;</script>`;

  // ============================================================
  // GA4 TRACKING   <-- PER-CLIENT: agar GA4 ID alag hai to badlo
  // ============================================================
  const GA4 = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-SR0827W9HM"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SR0827W9HM');</script>`;

  // ============================================================
  // GOOGLE ADS — gtag.js GA4 block se load hoti hai, yahan sirf config
  // ============================================================
  const ADS = `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('config','AW-16740553814');</script>`;

  // ============================================================
  // CLICK FRAUD TRACKER — _ft* variables tracker se PEHLE set hone chahiyen
  //   <-- PER-CLIENT: sirf _ftSite aur _ftKey change karo
  // ============================================================
  const TRACKER = `<script>window._ftSite="aqua plumber";window._ftKey="CF-AQUA-2026-m4p8q2";window._ftIP="${clientIP}";window._ftCountry="${ipCountry}";</script><script src="https://cdn.jsdelivr.net/gh/clickadsprotector/fraud-tracker@main/tracker.js"></script>`;

  return new HTMLRewriter()
    .on("link[rel='canonical']", {
      element(el) {
        el.remove();
      },
    })
    .on("head", {
      element(el) {
        el.append(CANONICAL, { html: true });
        el.append(CONSENT, { html: true });
        el.append(GA4, { html: true });
        if (ADS) el.append(ADS, { html: true });
        el.append(TRACKER, { html: true });
      },
    })
    .on("body", {
      element(el) {
        el.append(TRACKING_EVENTS, { html: true });
      },
    })
    .transform(response);
}
