(function(){
  if(localStorage.getItem('cc_accepted')) return;
  var b=document.createElement('div');
  b.id='cc-banner';
  b.style='position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;color:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;z-index:99999;font-family:Arial,sans-serif;font-size:14px;';
  b.innerHTML='<span>We use cookies to improve your experience. <a href="/pages/about/" style="color:#EA580C;text-decoration:underline;">Learn more</a></span>'
    +'<div style="display:flex;gap:10px;">'
    +'<button onclick="document.getElementById(\'cc-banner\').remove();localStorage.setItem(\'cc_accepted\',\'1\')" style="background:#1E50AF;color:#fff;border:none;padding:10px 24px;border-radius:50px;cursor:pointer;font-weight:700;">Accept</button>'
    +'<button onclick="document.getElementById(\'cc-banner\').remove();localStorage.setItem(\'cc_accepted\',\'0\')" style="background:transparent;color:#ccc;border:1px solid #ccc;padding:10px 20px;border-radius:50px;cursor:pointer;">Decline</button>'
    +'</div>';
  document.body.appendChild(b);
})();