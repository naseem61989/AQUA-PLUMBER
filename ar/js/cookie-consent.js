(function(){
  "use strict";

  function euVisitor() {
    /* middleware ka server-side faisla — sab se bharosemand */
    if (typeof window._ccRequired === "boolean") return window._ccRequired;
    /* middleware na ho to timezone fallback */
    try {
      return /^Europe\//.test(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    } catch (e) { return false; }
  }

  if (!euVisitor()) return;

  function apply(granted) {
    var v = granted ? "granted" : "denied";
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      ad_storage:         v,
      ad_user_data:       v,
      ad_personalization: v,
      analytics_storage:  v
    });
  }

  var stored = null;
  try { stored = localStorage.getItem("cc_consent"); } catch (e) {}
  if (stored === "1") { apply(true);  return; }
  if (stored === "0") { apply(false); return; }

  function choose(granted) {
    try { localStorage.setItem("cc_consent", granted ? "1" : "0"); } catch (e) {}
    apply(granted);
    var el = document.getElementById("cc-banner");
    if (el) el.remove();
  }

  var b = document.createElement("div");
  b.id = "cc-banner";
  b.setAttribute("role", "dialog");
  b.setAttribute("aria-label", "Cookie consent");
  b.style = "position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;color:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;z-index:99999;font-family:Arial,sans-serif;font-size:14px;";

  var msg = document.createElement("span");
  msg.textContent = "We use cookies for analytics and advertising. ";
  var more = document.createElement("a");
  more.href = "/pages/about/";
  more.textContent = "Learn more";
  more.style.cssText = "color:#EA580C;text-decoration:underline;";
  msg.appendChild(more);

  var btns = document.createElement("div");
  btns.style.cssText = "display:flex;gap:10px;";

  var ok = document.createElement("button");
  ok.type = "button";
  ok.textContent = "Accept";
  ok.style.cssText = "background:#1E36AF;color:#fff;border:none;padding:10px 24px;border-radius:50px;cursor:pointer;font-weight:700;";
  ok.addEventListener("click", function () { choose(true); });

  var no = document.createElement("button");
  no.type = "button";
  no.textContent = "Decline";
  no.style.cssText = "background:transparent;color:#ccc;border:1px solid #ccc;padding:10px 20px;border-radius:50px;cursor:pointer;";
  no.addEventListener("click", function () { choose(false); });

  btns.appendChild(ok);
  btns.appendChild(no);
  b.appendChild(msg);
  b.appendChild(btns);
  document.body.appendChild(b);
})();