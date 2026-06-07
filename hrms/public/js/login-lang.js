document.addEventListener('DOMContentLoaded', function () {
  try {
    // show in header top-right for all pages; still useful on login
    var header = document.querySelector('header') || document.querySelector('.navbar') || document.querySelector('.topbar') || document.body;
    var wrapper = document.createElement('div');
      wrapper.className = 'hrms-login-lang-header';
      wrapper.innerHTML = '\n      <label class="hrms-lang-label">Ngôn ngữ</label>\n      <select id="hrms-lang-select">\n        <option value="en">English</option>\n        <option value="vi">Tiếng Việt</option>\n      </select>\n      <button id="hrms-theme-toggle" class="hrms-theme-btn" title="Chuyển giao diện"> </button>\n    ';
    // append to header (will appear top-right due to CSS)
    if (header && header.appendChild) header.appendChild(wrapper);
    else document.body.appendChild(wrapper);

    var sel = document.getElementById('hrms-lang-select');
    var params = new URLSearchParams(window.location.search);
    var current = params.get('lang') || document.documentElement.lang || 'en';
    sel.value = current;
    sel.addEventListener('change', function () {
      params.set('lang', sel.value);
      window.location.search = params.toString();
    });
      function setCookie(name, value, days) {
        var d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        document.cookie = name + '=' + encodeURIComponent(value) + ';path=/;expires=' + d.toUTCString();
      }
      function getCookie(name) {
        var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? decodeURIComponent(v[2]) : null;
      }

      // apply theme from cookie
      var savedTheme = getCookie('hrms_theme') || 'light';
      if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

      // theme toggle
      var themeBtn = document.getElementById('hrms-theme-toggle');
      function updateThemeUI() {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
          themeBtn.textContent = '☀️';
          themeBtn.setAttribute('aria-pressed', 'true');
        } else {
          themeBtn.textContent = '🌙';
          themeBtn.setAttribute('aria-pressed', 'false');
        }
      }
      themeBtn.addEventListener('click', function () {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
          document.documentElement.removeAttribute('data-theme');
          setCookie('hrms_theme', 'light', 365);
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          setCookie('hrms_theme', 'dark', 365);
        }
        updateThemeUI();
      });
      updateThemeUI();
  } catch (e) { console.error(e); }
});
