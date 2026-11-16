/* ==========================================================================
   PSYCHOLOGICAL LAYER — additive script.
   Session line, return memory, one About mismatch, a 404 internal strip,
   and the hidden access log. It does not touch any existing event code.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var VISITS_KEY = "bw_psych_visits";
  var ABOUT_KEY = "bw_psych_about";

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function stamp(d) {
    return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate()) +
      " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }

  function readVisits() {
    try {
      return parseInt(window.localStorage.getItem(VISITS_KEY), 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function writeVisits(n) {
    try {
      window.localStorage.setItem(VISITS_KEY, String(n));
    } catch (e) {
      /* local only; no tracking if storage is blocked */
    }
  }

  /* HOME — session timer, tab title, second-visit memory. */
  function initHome() {
    if (!document.getElementById("psychHome")) {
      return;
    }

    var footer = document.querySelector(".sitefooter");
    var meta = null;

    if (footer) {
      meta = document.createElement("p");
      meta.className = "psych-footer";
      meta.innerHTML = '<span id="psychSession">SESSION 00:00:00</span> <span class="psych-dot">·</span> <span>INDEX: NORMAL</span>';
      footer.appendChild(meta);

      var seconds = 0;
      window.setInterval(function () {
        seconds++;
        var hh = Math.floor(seconds / 3600);
        var mm = Math.floor((seconds % 3600) / 60);
        var ss = seconds % 60;
        var line = document.getElementById("psychSession");
        if (line) {
          line.textContent = "SESSION " + pad(hh) + ":" + pad(mm) + ":" + pad(ss);
        }
      }, 1000);

      var visits = readVisits();
      writeVisits(visits + 1);
      if (visits > 0) {
        var back = document.createElement("p");
        back.className = "psych-return";
        back.textContent = "上次访问未完成。";
        footer.insertBefore(back, meta);
      }
    }

    var normalTitle = document.title;
    document.addEventListener("visibilitychange", function () {
      if (document.body.classList.contains("truth-on")) {
        return;
      }
      if (document.hidden) {
        document.title = "仍在访问";
        return;
      }
      document.title = "你还在。";
      window.setTimeout(function () {
        if (!document.body.classList.contains("truth-on")) {
          document.title = normalTitle;
        }
      }, 2000);
    });
  }

  /* ABOUT — one extra line, not a replacement. Appears once per session. */
  function initAbout() {
    var brands = document.querySelector(".brands");
    if (!brands) {
      return;
    }

    var note = document.createElement("p");
    note.className = "psych-about-note";
    note.hidden = true;
    note.textContent = "This paragraph does not match the previous record.";
    brands.parentNode.insertBefore(note, brands);

    var seen = false;
    try {
      seen = window.sessionStorage.getItem(ABOUT_KEY) === "1";
    } catch (e) {
      seen = false;
    }
    if (seen) {
      return;
    }

    function check() {
      if (seen) {
        return;
      }
      var rect = brands.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.65) {
        seen = true;
        try {
          window.sessionStorage.setItem(ABOUT_KEY, "1");
        } catch (e) {
          /* session only */
        }
        note.hidden = false;
        window.setTimeout(function () {
          note.hidden = true;
        }, 2400);
        window.removeEventListener("scroll", check);
      }
    }

    window.addEventListener("scroll", check, { passive: true });
    check();
  }

  /* 404 — a tiny internal strip above the existing page. Existing log stays. */
  function initNotFound() {
    if (!document.querySelector(".notfound-code")) {
      return;
    }
    var main = document.querySelector(".content");
    if (!main) {
      return;
    }

    var strip = document.createElement("div");
    strip.className = "psych-404-strip";
    strip.setAttribute("role", "note");
    strip.innerHTML =
      '<span class="psych-404-label">INTERNAL LOG</span>' +
      '<span>RECORD CREATED</span>' +
      '<span>VISITOR: UNVERIFIED</span>' +
      '<span id="psych404Time">—</span>' +
      '<a href="logs.html">logs</a>';

    var crumb = main.querySelector(".crumb");
    if (crumb && crumb.parentNode === main) {
      main.insertBefore(strip, crumb.nextSibling);
    } else {
      main.insertBefore(strip, main.firstChild);
    }

    var time = document.getElementById("psych404Time");
    if (time) {
      time.textContent = stamp(new Date());
    }
  }

  /* LOGS — the hidden page's last row gets the real local clock. */
  function initLogs() {
    if (!document.querySelector(".psych-logpage")) {
      return;
    }
    var now = document.querySelectorAll("[data-psych-now]");
    var value = stamp(new Date());
    for (var i = 0; i < now.length; i++) {
      now[i].textContent = value;
    }
  }

  initHome();
  initAbout();
  initNotFound();
  initLogs();
})(window, document);
