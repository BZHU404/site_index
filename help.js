/* HELP — the friendly little help box.
   It only wants one click. Then another. Then another. */

(function (window, document) {
  "use strict";

  var MAX = 13;
  var stage = 0;
  var root = document.documentElement;
  var button = document.getElementById("corruptButton");
  var dnp = document.getElementById("dnp");
  var kicker = document.getElementById("dnpKicker");
  var prompt = document.getElementById("dnpPrompt");
  var warning = document.getElementById("dnpWarning");
  var finalScene = document.getElementById("finalScene");
  var reset = document.getElementById("corruptReset");
  var jumpscare = document.getElementById("jumpscare");
  var jumpscareEye = document.getElementById("jumpscareEye");
  var jumpscareText = document.getElementById("jumpscareText");
  var originalTitle = document.title;
  var jumpTimer = null;
  var audioCtx = null;
  var leaveScareShown = false;
  var linksLocked = false;

  if (!button || !dnp || !kicker || !prompt || !warning || !finalScene || !reset || !jumpscare) {
    return;
  }

  var jumpMap = {
    4: "eye",
    6: "hello",
    8: "eye",
    10: "both",
    12: "text"
  };

  var jumpEyeSrc = {
    eye: "assets/TheCreepyEye.gif",
    hello: "assets/goth-eye.gif",
    both: "assets/TheCreepyEye.gif",
    leave: "assets/TheCreepyEye.gif",
    text: "assets/TheCreepyEye.gif"
  };

  var jumpText = {
    text: "HELP ME",
    both: "HELP ME",
    leave: "Don't Leave Me"
  };

  var copy = [
    { k: "NEED A HAND?", p: "Stuck on something? I can help.", b: "CLICK FOR HELP", w: "No forms. No waiting. Just click." },
    { k: "THANK YOU", p: "That was easy, wasn't it?", b: "CLICK AGAIN", w: "It only takes a second." },
    { k: "YOU'RE STILL HERE", p: "There's more to see.", b: "ONE MORE", w: "You're doing great." },
    { k: "KEEP GOING", p: "It gets better.", b: "CONTINUE", w: "Don't stop now." },
    { k: "ALMOST THERE", p: "You're so close.", b: "KEEP CLICKING", w: "It likes the attention." },
    { k: "DON'T STOP", p: "Why are you still here?", b: "ONE MORE", w: "It's listening." },
    { k: "IT SEES YOU", p: "The page is changing.", b: "CONTINUE", w: "Don't look away." },
    { k: "STAY", p: "You can't leave now.", b: "CLICK AGAIN", w: "It's almost awake." },
    { k: "HELP", p: "Something is wrong.", b: "HELP", w: "Keep clicking." },
    { k: "HELP ME", p: "Please.", b: "HELP ME", w: "One more." },
    { k: "HELP ME", p: "It hurts.", b: "HELP ME", w: "Don't stop." },
    { k: "HELP ME", p: "Why did you do this?", b: "HELP ME", w: "Keep going." },
    { k: "HELP ME", p: "Almost.", b: "HELP ME", w: "One last time." },
    { k: "", p: "", b: "", w: "" }
  ];

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
      /* audio is optional */
    }
  }

  function playSting() {
    if (!audioCtx) {
      return;
    }
    try {
      var t = audioCtx.currentTime;
      var len = Math.floor(audioCtx.sampleRate * 0.26);
      var buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }

      var noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      var band = audioCtx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 760;
      band.Q.value = 0.8;
      var noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.linearRampToValueAtTime(0.1, t + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      noise.connect(band);
      band.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.3);

      var osc = audioCtx.createOscillator();
      var lowGain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(92, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.28);
      lowGain.gain.setValueAtTime(0.001, t);
      lowGain.gain.linearRampToValueAtTime(0.12, t + 0.01);
      lowGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(lowGain);
      lowGain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch (e) {
      /* keep the visual jump even if audio fails */
    }
  }

  function lockLinks() {
    linksLocked = true;
    var links = document.querySelectorAll(".page a");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.getAttribute("href")) {
        link.setAttribute("data-locked-href", link.getAttribute("href"));
        link.removeAttribute("href");
      }
      link.classList.add("is-locked");
      link.setAttribute("aria-disabled", "true");
    }
  }

  function unlockLinks() {
    linksLocked = false;
    var links = document.querySelectorAll(".page a");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute("data-locked-href");
      if (href) {
        link.setAttribute("href", href);
        link.removeAttribute("data-locked-href");
      }
      link.classList.remove("is-locked");
      link.removeAttribute("aria-disabled");
    }
  }

  document.addEventListener("click", function (event) {
    if (!linksLocked) {
      return;
    }
    var target = event.target;
    var link = target && target.closest ? target.closest(".page a") : null;
    if (!link) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    jump("leave");
  }, true);

  function jump(kind) {
    if (!jumpscare || stage >= MAX) {
      return;
    }
    if (jumpTimer) {
      window.clearTimeout(jumpTimer);
    }

    jumpscare.classList.remove("is-active");
    if (jumpscareEye) {
      jumpscareEye.src = jumpEyeSrc[kind] || "assets/the-creepy-eye.webp";
      jumpscareEye.hidden = kind === "text";
    }
    if (jumpscareText) {
      jumpscareText.textContent = jumpText[kind] || "HELP ME";
      jumpscareText.hidden = !jumpText[kind];
    }
    void jumpscare.offsetWidth;
    jumpscare.classList.add("is-active");
    root.classList.add("jumpscare-hit");
    document.title = kind === "leave" ? "Don't Leave Me" : (kind === "hello" ? "HELLO?" : "HELP ME");
    playSting();

    jumpTimer = window.setTimeout(function () {
      jumpscare.classList.remove("is-active");
      root.classList.remove("jumpscare-hit");
      document.title = originalTitle;
      jumpTimer = null;
    }, 420);
  }

  function apply(next) {
    stage = next;
    root.style.setProperty("--corrupt", String(next));
    for (var i = 1; i <= MAX; i++) {
      root.classList.remove("corrupt-" + i);
    }
    root.classList.toggle("corrupt-high", next >= 5);
    root.classList.toggle("corrupt-critical", next >= 9);
    if (next > 0) {
      root.classList.add("corrupt-" + next);
    }

    dnp.classList.toggle("is-tainted", next >= 1);
    dnp.classList.toggle("is-bloody", next >= 5);
    dnp.classList.toggle("is-critical", next >= 9);

    var line = copy[next] || copy[copy.length - 1];
    kicker.textContent = line.k;
    prompt.textContent = line.p;
    warning.textContent = line.w;
    button.textContent = line.b;
    button.setAttribute("aria-label", line.b + ". " + line.p);

    if (jumpMap[next]) {
      window.setTimeout(function () {
        if (stage === next) {
          jump(jumpMap[next]);
        }
      }, 90);
    }
  }

  function showFinal() {
    if (jumpTimer) {
      window.clearTimeout(jumpTimer);
      jumpTimer = null;
    }
    jumpscare.classList.remove("is-active");
    root.classList.remove("jumpscare-hit");
    document.title = originalTitle;
    finalScene.classList.add("is-visible");
    finalScene.setAttribute("aria-hidden", "false");
    dnp.hidden = true;
    document.body.classList.add("is-final");
    window.setTimeout(function () {
      reset.focus();
    }, 80);
  }

  function resetPage() {
    if (jumpTimer) {
      window.clearTimeout(jumpTimer);
      jumpTimer = null;
    }
    jumpscare.classList.remove("is-active");
    root.classList.remove("jumpscare-hit");
    document.title = originalTitle;
    leaveScareShown = false;
    unlockLinks();
    apply(0);
    finalScene.classList.remove("is-visible");
    finalScene.setAttribute("aria-hidden", "true");
    dnp.hidden = false;
    document.body.classList.remove("is-final");
    button.focus();
  }

  button.addEventListener("click", function () {
    if (stage >= MAX) {
      return;
    }

    ensureAudio();

    if (stage === 1 && !leaveScareShown) {
      leaveScareShown = true;
      jump("leave");
      return;
    }

    apply(stage + 1);

    if (stage === 1) {
      lockLinks();
    }

    button.classList.remove("is-hit");
    void button.offsetWidth;
    button.classList.add("is-hit");

    if (stage >= MAX) {
      showFinal();
    }
  });

  reset.addEventListener("click", resetPage);

  apply(0);
})(window, document);
