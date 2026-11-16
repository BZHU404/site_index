/* ==========================================================================
   DEVIL'S RAVENSTONE — the hidden truth layer on the homepage.
   One tiny trigger. No navigation. No way back except "forget".
   ========================================================================== */

(function (window, document) {
  "use strict";

  var trigger = document.getElementById("truthTrigger");
  var truth = document.getElementById("truthPage");
  if (!trigger || !truth) {
    return;
  }

  var page = document.querySelector(".page");
  var clock = document.getElementById("truthClock");
  var log = document.getElementById("truthLog");
  var clockTimer = null;

  function tick() {
    if (!clock) {
      return;
    }
    var d = new Date();
    var hh = d.getHours();
    var mm = d.getMinutes();
    var ss = d.getSeconds();
    clock.textContent =
      (hh < 10 ? "0" : "") + hh + ":" +
      (mm < 10 ? "0" : "") + mm + ":" +
      (ss < 10 ? "0" : "") + ss;
  }

  function open() {
    if (!truth.hidden) {
      return;
    }

    document.documentElement.classList.add("truth-on");
    document.body.classList.add("truth-on");

    if (page) {
      page.hidden = true;
      page.setAttribute("aria-hidden", "true");
    }

    truth.hidden = false;
    truth.setAttribute("aria-hidden", "false");
    document.title = "Devil's Ravenstone";
    window.scrollTo(0, 0);

    var title = document.getElementById("truthTitle");
    if (title) {
      title.focus();
    }

    tick();
    if (clockTimer) {
      window.clearInterval(clockTimer);
    }
    clockTimer = window.setInterval(tick, 1000);
  }

  function say(message) {
    if (!log) {
      return;
    }
    log.textContent = message;
    log.classList.remove("is-hit");
    void log.offsetWidth;
    log.classList.add("is-hit");
  }

  trigger.addEventListener("click", open);

  var forget = document.getElementById("truthForget");
  if (forget) {
    forget.addEventListener("click", function () {
      window.location.reload();
    });
  }

  var locked = truth.querySelectorAll("[data-truth-lock]");
  for (var i = 0; i < locked.length; i++) {
    locked[i].addEventListener("click", function (event) {
      event.preventDefault();
      say(this.getAttribute("data-truth-say") || "NO EXIT.");
    });
  }

  /* The truth page contains no real hyperlinks. If one ever appears, it dies. */
  truth.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("a") : null;
    if (!link) {
      return;
    }
    event.preventDefault();
    say("THE LINK IS DEAD. THERE IS NO EXIT.");
  });
})(window, document);
