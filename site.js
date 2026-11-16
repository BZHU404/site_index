/* ==========================================================================
   BRIAN'S WORKSHOP — small shared scripts
   Visitor counter, days-online, and the tiny bits that cannot be static.
   The counter talks to abacus when served over HTTP; opening the files
   directly (file://) falls back to a local, honest "this browser" count.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var COUNTER_API = "https://abacus.jasoncameron.dev/hit/bzhu404-brian-workshop";
  var ONLINE_SINCE = new Date(2026, 10, 2); /* 2 November 2026 */
  var HIT_KEY = "bw_hit_total";
  var DAY_KEY = "bw_hit_day_";

  var hitEl = document.getElementById("hitCount");
  var todayEl = document.getElementById("todayCount");
  var daysEl = document.getElementById("daysOnline");

  function pad(n, width) {
    var value = String(n);
    while (value.length < width) {
      value = "0" + value;
    }
    return value;
  }

  function setHit(value) {
    if (hitEl) {
      hitEl.textContent = pad(value, 6);
    }
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1, 2) + "-" + pad(d.getDate(), 2);
  }

  function setDays() {
    if (!daysEl) {
      return;
    }
    var now = new Date();
    var start = Date.UTC(ONLINE_SINCE.getFullYear(), ONLINE_SINCE.getMonth(), ONLINE_SINCE.getDate());
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.floor((today - start) / 86400000) + 1;
    daysEl.textContent = days > 0 ? String(days) : "1";
  }

  /* Local fallback: one number per browser per day. */
  function localCounters() {
    var total = 1;
    var today = 1;
    var key = DAY_KEY + todayKey();

    try {
      total = (parseInt(window.localStorage.getItem(HIT_KEY), 10) || 0) + 1;
      window.localStorage.setItem(HIT_KEY, String(total));

      today = (parseInt(window.localStorage.getItem(key), 10) || 0) + 1;
      window.localStorage.setItem(key, String(today));
    } catch (e) {
      /* private mode / blocked storage — the counter is decorative anyway */
    }

    setHit(total);
    if (todayEl) {
      todayEl.textContent = String(today);
    }
    if (hitEl) {
      hitEl.title = "Local visitor counter (offline)";
    }
  }

  function getJSON(url) {
    if (!window.fetch) {
      return Promise.reject(new Error("no fetch"));
    }

    var options = { cache: "no-store" };
    var controller = null;

    if (window.AbortController) {
      controller = new AbortController();
      options.signal = controller.signal;
      window.setTimeout(function () {
        controller.abort();
      }, 5000);
    }

    return window.fetch(url, options).then(function (response) {
      if (!response.ok) {
        throw new Error("counter request failed");
      }
      return response.json();
    });
  }

  function remoteCounters() {
    getJSON(COUNTER_API + "/visits").then(function (data) {
      if (!data || typeof data.value !== "number") {
        throw new Error("bad counter response");
      }
      setHit(data.value);
      if (hitEl) {
        hitEl.title = "Visitor counter";
      }
    }).catch(function () {
      localCounters();
    });

    getJSON(COUNTER_API + "/day-" + todayKey()).then(function (data) {
      if (!data || typeof data.value !== "number") {
        throw new Error("bad counter response");
      }
      if (todayEl) {
        todayEl.textContent = String(data.value);
      }
    }).catch(function () {
      if (todayEl) {
        todayEl.textContent = "—";
      }
    });
  }

  /* Text size: 100% / 115% / 130%, kept in localStorage. */
  (function initTextSize() {
    var boxes = document.querySelectorAll(".textsize");
    if (!boxes.length) {
      return;
    }

    var LEVELS = [100, 115, 130];
    var KEY = "bw_textsize";
    var level = 0;

    try {
      level = parseInt(window.localStorage.getItem(KEY), 10) || 0;
    } catch (e) {
      level = 0;
    }

    if (level < 0 || level > 2) {
      level = 0;
    }

    function apply() {
      document.documentElement.classList.toggle("textsize-1", level === 1);
      document.documentElement.classList.toggle("textsize-2", level === 2);

      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        var value = box.querySelector(".textsize-value");
        var minus = box.querySelector('[data-textsize="-1"]');
        var plus = box.querySelector('[data-textsize="1"]');

        if (value) {
          value.textContent = LEVELS[level] + "%";
        }
        if (minus) {
          minus.disabled = level === 0;
        }
        if (plus) {
          plus.disabled = level === 2;
        }
      }
    }

    for (var i = 0; i < boxes.length; i++) {
      boxes[i].addEventListener("click", function (event) {
        var button = event.target.closest ? event.target.closest("button[data-textsize]") : null;
        if (!button) {
          return;
        }

        level = Math.max(0, Math.min(2, level + parseInt(button.getAttribute("data-textsize"), 10)));

        try {
          window.localStorage.setItem(KEY, String(level));
        } catch (e) {
          /* private mode — the setting will not persist */
        }

        apply();
      });
    }

    apply();
  })();

  /* "YOUR SYSTEM" box on the home page. */
  (function initSystemBox() {
    var nodes = document.querySelectorAll("[data-sys]");
    if (!nodes.length) {
      return;
    }

    function set(name, value) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].getAttribute("data-sys") === name) {
          nodes[i].textContent = value;
        }
      }
    }

    var ua = navigator.userAgent;
    var match;
    var browser = "Unknown";

    if ((match = ua.match(/Edg\/([\d.]+)/))) {
      browser = "Edge " + match[1].split(".")[0];
    } else if ((match = ua.match(/OPR\/([\d.]+)/))) {
      browser = "Opera " + match[1].split(".")[0];
    } else if ((match = ua.match(/Chrome\/([\d.]+)/))) {
      browser = "Chrome " + match[1].split(".")[0];
    } else if ((match = ua.match(/Firefox\/([\d.]+)/))) {
      browser = "Firefox " + match[1].split(".")[0];
    } else if ((match = ua.match(/Version\/([\d.]+).*Safari/))) {
      browser = "Safari " + match[1].split(".")[0];
    } else if (/Netscape/i.test(ua)) {
      browser = "Netscape 3.0 (sure)";
    }

    set("browser", browser);
    if (window.screen) {
      set("screen", screen.width + "×" + screen.height);
      set("colors", screen.colorDepth + "-bit");
    }

    function clock() {
      var d = new Date();
      var hh = d.getHours();
      var mm = d.getMinutes();
      var ss = d.getSeconds();
      set("time", (hh < 10 ? "0" : "") + hh + ":" +
        (mm < 10 ? "0" : "") + mm + ":" +
        (ss < 10 ? "0" : "") + ss);
    }

    clock();
    window.setInterval(clock, 1000);
  })();

  /* Webring: point "random" at a different map on every click. */
  var randomSite = document.getElementById("randomSite");

  if (randomSite) {
    var RING = [
      "https://BZHU404.github.io/wood_map",
      "https://BZHU404.github.io/chinamed_map",
      "https://BZHU404.github.io/Poison_map",
      "https://BZHU404.github.io/alcohol_map",
      "https://BZHU404.github.io/lux_map",
      "https://BZHU404.github.io/Flower_map",
      "https://BZHU404.github.io/perfume_map/"
    ];

    randomSite.addEventListener("click", function () {
      randomSite.href = RING[Math.floor(Math.random() * RING.length)];
    });
  }

  /* Devil Site badge: first press locks the page and turns the badge into
     an animated eye. Each further press corrupts the page; the sixth opens
     the same event as the roulette's hidden six-shot trigger. */
  (function initDevilBadge() {
    var badges = document.querySelectorAll(".devil-badge");
    if (!badges.length) {
      return;
    }

    var count = 0;
    var locked = false;
    var listening = false;
    var eventEl = null;
    var wakeBtn = null;
    var eventTimer = null;
    var audioCtx = null;
    var eyeDock = null;
    var savedLinks = [];
    var savedControls = [];
    var root = document.documentElement;

    function ensureAudio() {
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) {
          return;
        }
        if (!audioCtx) {
          audioCtx = new Ctx();
        }
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
      } catch (e) {
        /* optional */
      }
    }

    function sting() {
      if (!audioCtx) {
        return;
      }
      try {
        var t = audioCtx.currentTime;
        var len = Math.floor(audioCtx.sampleRate * 0.45);
        var buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        }
        var noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.exponentialRampToValueAtTime(140, t + 0.45);
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start(t);
        noise.stop(t + 0.5);

        var osc = audioCtx.createOscillator();
        var low = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.exponentialRampToValueAtTime(26, t + 0.55);
        low.gain.setValueAtTime(0.001, t);
        low.gain.linearRampToValueAtTime(0.13, t + 0.02);
        low.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc.connect(low);
        low.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.62);
      } catch (e) {
        /* visual only */
      }
    }

    function applyStage(n) {
      var stage = Math.min(12, n * 2);
      root.style.setProperty("--corrupt", String(stage));
      root.classList.toggle("corrupt-high", n >= 3);
      root.classList.toggle("corrupt-critical", n >= 5);
    }

    function ensureLayers() {
      if (!document.querySelector(".corruption-layer")) {
        var layer = document.createElement("div");
        layer.className = "corruption-layer";
        layer.setAttribute("data-devil-injected", "1");
        layer.setAttribute("aria-hidden", "true");
        document.body.appendChild(layer);
      }
      if (!document.querySelector(".blood-layer")) {
        var blood = document.createElement("div");
        blood.className = "blood-layer";
        blood.setAttribute("data-devil-injected", "1");
        blood.setAttribute("aria-hidden", "true");
        document.body.appendChild(blood);
      }
    }

    function clearLayers() {
      var injected = document.querySelectorAll('[data-devil-injected="1"]');
      for (var i = 0; i < injected.length; i++) {
        injected[i].parentNode.removeChild(injected[i]);
      }
      root.style.setProperty("--corrupt", "0");
      root.classList.remove("corrupt-high", "corrupt-critical");
    }

    function blockClick(event) {
      if (!locked) {
        return;
      }
      var target = event.target;
      if (!target || !target.closest) {
        return;
      }
      if (target.closest(".devil-badge") || target.closest("#devilEvent")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    }

    function lockPage() {
      if (locked) {
        return;
      }
      locked = true;

      savedLinks = [];
      var links = document.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.classList.contains("devil-badge")) {
          continue;
        }
        savedLinks.push({ el: link, href: link.getAttribute("href") });
        if (link.hasAttribute("href")) {
          link.removeAttribute("href");
        }
        link.classList.add("is-locked");
        link.setAttribute("aria-disabled", "true");
      }

      savedControls = [];
      var controls = document.querySelectorAll("button, input, select, textarea");
      for (var j = 0; j < controls.length; j++) {
        var control = controls[j];
        if (control.classList.contains("devil-badge")) {
          continue;
        }
        savedControls.push({ el: control, disabled: control.disabled });
        control.disabled = true;
      }

      ensureLayers();

      if (!listening) {
        document.addEventListener("click", blockClick, true);
        listening = true;
      }
    }

    function unlockPage() {
      if (!locked) {
        return;
      }
      locked = false;
      count = 0;

      for (var i = 0; i < savedLinks.length; i++) {
        var saved = savedLinks[i];
        if (saved.href !== null) {
          saved.el.setAttribute("href", saved.href);
        }
        saved.el.classList.remove("is-locked");
        saved.el.removeAttribute("aria-disabled");
      }
      savedLinks = [];

      for (var j = 0; j < savedControls.length; j++) {
        savedControls[j].el.disabled = savedControls[j].disabled;
      }
      savedControls = [];

      if (eyeDock) {
        eyeDock.parentNode.removeChild(eyeDock);
        eyeDock = null;
      }
      for (var k = 0; k < badges.length; k++) {
        badges[k].hidden = false;
      }

      clearLayers();
    }

    function makeEyeDock() {
      if (eyeDock) {
        return;
      }
      for (var i = 0; i < badges.length; i++) {
        badges[i].hidden = true;
      }
      eyeDock = document.createElement("button");
      eyeDock.type = "button";
      eyeDock.className = "devil-eye-dock devil-badge";
      eyeDock.setAttribute("aria-label", "Devil Site");
      eyeDock.innerHTML = '<img src="assets/TheCreepyEye.gif" alt="">';
      eyeDock.addEventListener("click", poke);
      document.body.appendChild(eyeDock);
    }

    function buildEvent() {
      if (eventEl) {
        return;
      }
      eventEl = document.createElement("section");
      eventEl.className = "six-event devil-event";
      eventEl.id = "devilEvent";
      eventEl.setAttribute("role", "alertdialog");
      eventEl.setAttribute("aria-modal", "true");
      eventEl.setAttribute("aria-label", "Devil Site");
      eventEl.setAttribute("aria-hidden", "true");
      eventEl.innerHTML =
        '<div class="six-flash" aria-hidden="true"><img src="assets/goth-eye.gif" alt=""></div>' +
        '<div class="six-panel">' +
          '<img class="six-eye" src="assets/the-creepy-eye-cutout.png" alt="">' +
          '<p class="six-text">YOU SHOULDN\'T HAVE DONE THAT.</p>' +
          '<p class="six-sub">It was never your turn.</p>' +
          '<p class="six-coda">you dance with the devil</p>' +
          '<p class="six-coda">you never dance again</p>' +
          '<button class="six-wake" type="button" data-devil-wake>WAKE UP</button>' +
        '</div>';
      document.body.appendChild(eventEl);
      wakeBtn = eventEl.querySelector("[data-devil-wake]");
      if (wakeBtn) {
        wakeBtn.addEventListener("click", closeEvent);
      }
    }

    function showEvent() {
      buildEvent();
      if (!eventEl) {
        return;
      }
      if (eventTimer) {
        window.clearTimeout(eventTimer);
      }
      eventEl.classList.remove("is-active", "show-panel");
      void eventEl.offsetWidth;
      eventEl.classList.add("is-active");
      eventEl.setAttribute("aria-hidden", "false");
      document.body.classList.add("six-open");
      ensureAudio();
      sting();
      eventTimer = window.setTimeout(function () {
        eventEl.classList.add("show-panel");
        if (wakeBtn) {
          wakeBtn.focus();
        }
      }, 700);
    }

    function closeEvent() {
      if (eventTimer) {
        window.clearTimeout(eventTimer);
        eventTimer = null;
      }
      if (eventEl) {
        eventEl.classList.remove("is-active", "show-panel");
        eventEl.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("six-open");
      unlockPage();
      if (badges[0]) {
        badges[0].focus();
      }
    }

    function poke(event) {
      event.preventDefault();
      if (eventEl && eventEl.classList.contains("is-active")) {
        return;
      }
      if (!locked) {
        lockPage();
        makeEyeDock();
      }
      count++;
      applyStage(count);
      if (count >= 6) {
        showEvent();
      }
    }

    for (var i = 0; i < badges.length; i++) {
      badges[i].addEventListener("click", poke);
    }
  })();

  setDays();

  if (window.location.protocol === "file:") {
    localCounters();
  } else {
    remoteCounters();
  }
})(window, document);
