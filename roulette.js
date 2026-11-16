/* ==========================================================================
   BRIAN'S WORKSHOP — Devil's Roulette
   Ported from the old personal homepage. Player vs system, three lives each.
   Text game only. Do not try this at home.

   Language: EN / 中文. The choice is saved in localStorage and only affects
   this game page (the site chrome stays as it is).
   ========================================================================== */

(function (window, document) {
  "use strict";

  var HP_MAX = 3;
  var state;
  var timer = null;
  var systemStreak = 0;
  var sixActive = false;
  var sixTimer = null;
  var audioCtx = null;
  var lang = "en";
  var messageKey = "newGame";
  var messageParams = {};
  var messageColor = "#d8ffd8";

  var TEXT = {
    en: {
      pageTitle: "Brian's Workshop — Devil's Roulette",
      title: "Devil's Roulette",
      titleSub: "恶魔轮盘赌",
      crumb: "GAME",
      subtitle: "Three lives each. One live round in six. The system is not your friend.",
      fictionTitle: "FICTION ONLY / 纯属虚构",
      fictionNote: "This is a text game. Do not try it in real life.",
      you: "You / 你",
      system: "System / 系统",
      score: "Score",
      cylinder: "CYLINDER",
      chambersLeft: "Chambers left",
      chambersUnit: "",
      rulesTitle: "· RULES ·",
      rule1: "Three lives each. First to zero loses.",
      rule2: "On your turn, choose: shoot yourself or the system.",
      rule3: "Yourself: blank +10 and keep the gun; live -1 life and pass it. At the system: the gun goes to the system either way. Live rounds reload.",
      houseTitle: "· HOUSE RULES ·",
      house1: "Points are for bragging rights; lives decide the game.",
      house2: "The system is not your friend.",
      luck: "Luck is not a strategy.",
      warning: "A fictional text game. Do not try this at home.",
      shootSelf: "Shoot yourself",
      shootAI: "Shoot the system",
      fireAgain: "Fire again",
      passGun: "Pass the gun",
      newRound: "New round",
      roundOver: "Round over",
      turnPlayer: "● Your turn",
      turnAI: "● System's turn",
      turnBusy: "● The system is moving…",
      turnOver: "● Round over",
      newGame: "New round. Cylinder loaded. Your turn.",
      liveSelfPlayer: "BANG! You shoot yourself. -1 life. Cylinder reloaded. The gun goes to the system.",
      liveSelfAI: "BANG! The system shoots itself. It loses 1 life. Cylinder reloaded. The gun goes to you.",
      liveOppPlayer: "BANG! You hit the system. It loses 1 life. Cylinder reloaded. The gun goes to the system.",
      liveOppAI: "BANG! The system hits you. You lose 1 life. Cylinder reloaded. The gun goes to you.",
      blankSelfPlayer: "Click… blank. +10 points. Your turn continues — shoot again, or pass.",
      blankSelfAI: "The system shoots itself: click… blank. System +10. It keeps the gun.",
      blankOppPlayer: "Click… blank. +10 points. The gun goes to the system.",
      blankOppAI: "The system shoots at you: click… blank. System +10. The gun goes to you.",
      pass: "You slide the gun across: “Your turn.”",
      aiShootSelf: "The system raises the gun to its own head…",
      aiShootPlayer: "The system aims at you…",
      aiPass: "The system slides the gun back: “Your turn.”",
      aiAgain: "The system keeps the gun and chooses again.",
      sixWake: "WAKE UP",
      endWin: "BANG! The system is down. You win! ({ps} : {as})",
      endLose: "BANG! You are down. The system wins. ({ps} : {as})"
    },
    zh: {
      pageTitle: "Brian's Workshop — 恶魔轮盘赌",
      title: "恶魔轮盘赌",
      titleSub: "Devil's Roulette",
      crumb: "游戏",
      subtitle: "每人 3 条命，6 个弹巢里 1 发实弹。系统不是你的朋友。",
      fictionTitle: "纯属虚构 / FICTION ONLY",
      fictionNote: "这是一个文字游戏，现实中请勿模仿。",
      you: "你 / You",
      system: "系统 / System",
      score: "得分",
      cylinder: "弹巢",
      chambersLeft: "弹巢剩余",
      chambersUnit: "格",
      rulesTitle: "· 规则 ·",
      rule1: "双方各 3 点生命，先归零者输。",
      rule2: "轮到谁，谁选择：打自己，还是打对面。",
      rule3: "打自己：空枪 +10 继续；实弹 -1，把枪交给对方。打对面：无论中不中，下一枪交给对方；实弹后重新装填。",
      houseTitle: "· 房规 ·",
      house1: "得分只作记录，生命归零即分胜负。",
      house2: "系统不是你的朋友。",
      luck: "运气不是策略。",
      warning: "纯属虚构的文字游戏，现实中请勿模仿。",
      shootSelf: "对自己扣扳机",
      shootAI: "冲系统开枪",
      fireAgain: "再开一枪",
      passGun: "把枪交给系统",
      newRound: "重新开始",
      roundOver: "本局结束",
      turnPlayer: "● 轮到你了",
      turnAI: "● 系统回合",
      turnBusy: "● 系统正在行动……",
      turnOver: "● 本局结束",
      newGame: "新的一局，弹巢已装填。轮到你了。",
      liveSelfPlayer: "砰！！你对自己扣到实弹，生命 -1。弹巢重新装填，枪交给系统。",
      liveSelfAI: "砰！！系统对自己扣到实弹，生命 -1。弹巢重新装填，枪交给你。",
      liveOppPlayer: "砰！！你打中了系统，系统生命 -1。弹巢重新装填，下一枪仍是系统。",
      liveOppAI: "砰！！系统打中了你，你生命 -1。弹巢重新装填，下一枪轮到你。",
      blankSelfPlayer: "咔哒……空枪，+10 分。还是你的回合，可以继续，也可以交枪。",
      blankSelfAI: "系统对自己扣动扳机：咔哒……空枪，系统 +10 分，枪还在系统手里。",
      blankOppPlayer: "咔哒……空枪，+10 分。下一枪交给系统。",
      blankOppAI: "系统冲你扣动扳机：咔哒……空枪，系统 +10 分。下一枪轮到你。",
      pass: "你把枪推给系统：“该你了。”",
      aiShootSelf: "系统把枪口对准自己……",
      aiShootPlayer: "系统把枪口对准你……",
      aiPass: "系统把枪推了回来：“轮到你了。”",
      aiAgain: "系统继续握着枪，重新选择目标。",
      sixWake: "醒来",
      endWin: "砰！！系统倒下了。你赢了！　（{ps} : {as}）",
      endLose: "砰！！你倒下了。系统获胜。　（{ps} : {as}）"
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function t(key, params) {
    var table = TEXT[lang] || TEXT.en;
    var value = table[key] || TEXT.en[key] || key;

    if (params) {
      Object.keys(params).forEach(function (name) {
        value = value.replace(new RegExp("\\{" + name + "\\}", "g"), String(params[name]));
      });
    }

    return value;
  }

  function applyStatic() {
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }

    document.title = t("pageTitle");
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    var buttons = document.querySelectorAll(".lang-switch button");
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].setAttribute(
        "aria-pressed",
        buttons[j].getAttribute("data-lang") === lang ? "true" : "false"
      );
    }
  }

  function setMsg(key, color, params) {
    messageKey = key;
    messageParams = params || {};
    messageColor = color || "#d8ffd8";
    renderMessage();
  }

  function renderMessage() {
    var message = $("msg");
    if (!message) {
      return;
    }
    message.textContent = t(messageKey, messageParams);
    message.style.color = messageColor;
  }

  function schedule(fn, ms) {
    if (timer) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(function () {
      timer = null;
      fn();
    }, ms);
  }

  function newCylinder() {
    var chambers = ["live", "blank", "blank", "blank", "blank", "blank"];
    for (var i = chambers.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = chambers[i];
      chambers[i] = chambers[j];
      chambers[j] = temp;
    }
    state.chambers = chambers;
  }

  function hearts(hp) {
    var out = "";
    for (var i = 0; i < HP_MAX; i++) {
      out += '<span class="heart ' + (i < hp ? "on" : "off") + '">♥</span>';
    }
    return out;
  }

  function renderCylinder() {
    var dots = document.querySelectorAll("#cylinder .chamber");
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle("spent", i >= state.chambers.length);
    }
  }

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

  function sixSting() {
    if (!audioCtx) {
      return;
    }
    try {
      var t = audioCtx.currentTime;
      var len = Math.floor(audioCtx.sampleRate * 0.5);
      var buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }
      var noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      var filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(180, t + 0.5);
      var gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.55);

      var osc = audioCtx.createOscillator();
      var lowGain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(64, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.6);
      lowGain.gain.setValueAtTime(0.001, t);
      lowGain.gain.linearRampToValueAtTime(0.14, t + 0.02);
      lowGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
      osc.connect(lowGain);
      lowGain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.68);
    } catch (e) {
      /* visual event still works */
    }
  }

  function triggerSix() {
    if (sixActive) {
      return;
    }
    sixActive = true;
    sixTimer = null;
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
    if (state) {
      state.busy = true;
      render();
    }

    var ev = $("sixEvent");
    if (!ev) {
      return;
    }
    ev.classList.add("is-active");
    ev.setAttribute("aria-hidden", "false");
    document.body.classList.add("six-open");
    sixSting();

    window.setTimeout(function () {
      ev.classList.add("show-panel");
      var wake = $("sixWake");
      if (wake) {
        wake.focus();
      }
    }, 900);
  }

  function wakeSix() {
    sixActive = false;
    if (sixTimer) {
      window.clearTimeout(sixTimer);
      sixTimer = null;
    }
    var ev = $("sixEvent");
    if (ev) {
      ev.classList.remove("is-active", "show-panel");
      ev.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("six-open");
    systemStreak = 0;
    newGame();
  }

  function render() {
    $("php").innerHTML = hearts(state.php);
    $("ahp").innerHTML = hearts(state.ahp);
    $("pscore").textContent = state.ps;
    $("ascore").textContent = state.as;
    $("left").textContent = state.chambers.length;
    renderCylinder();

    var shootBtn = $("btnShoot");
    var shootAIBtn = $("btnShootAI");
    var passBtn = $("btnPass");

    if (sixActive) {
      shootBtn.disabled = true;
      if (shootAIBtn) {
        shootAIBtn.disabled = true;
      }
      passBtn.disabled = true;
      return;
    }

    if (state.over) {
      $("turn").textContent = t("turnOver");
      shootBtn.textContent = t("roundOver");
      shootBtn.disabled = true;
      if (shootAIBtn) {
        shootAIBtn.textContent = t("roundOver");
        shootAIBtn.disabled = true;
      }
      passBtn.disabled = true;
      return;
    }

    if (state.turn === "player" && !state.busy) {
      $("turn").textContent = t("turnPlayer");
      shootBtn.disabled = false;
      shootBtn.textContent = t("shootSelf");
      if (shootAIBtn) {
        shootAIBtn.disabled = false;
        shootAIBtn.textContent = t("shootAI");
      }
      passBtn.disabled = state.phase !== "decide";
    } else {
      $("turn").textContent = t(state.busy ? "turnBusy" : "turnAI");
      shootBtn.disabled = true;
      shootBtn.textContent = t("shootSelf");
      if (shootAIBtn) {
        shootAIBtn.disabled = true;
        shootAIBtn.textContent = t("shootAI");
      }
      passBtn.disabled = true;
    }
  }

  function newGame() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
    if (sixTimer) {
      window.clearTimeout(sixTimer);
      sixTimer = null;
    }
    systemStreak = 0;
    sixActive = false;

    state = {
      php: HP_MAX,
      ahp: HP_MAX,
      ps: 0,
      as: 0,
      chambers: [],
      turn: "player",
      phase: "ready",
      busy: false,
      over: false
    };

    newCylinder();
    setMsg("newGame", "#d8ffd8");
    render();
  }

  function endGame(winner) {
    state.over = true;
    state.phase = "over";
    state.busy = false;

    if (winner === "player") {
      setMsg("endWin", "#00ff66", { ps: state.ps, as: state.as });
    } else {
      setMsg("endLose", "#ff5555", { ps: state.ps, as: state.as });
    }

    render();
  }

  function shoot(who, target) {
    var other = who === "player" ? "ai" : "player";
    var victim = target === "other" ? other : who;
    var round = state.chambers.pop();

    if (round === "live") {
      if (victim === "player") {
        state.php--;
      } else {
        state.ahp--;
      }

      var hpLeft = victim === "player" ? state.php : state.ahp;
      if (hpLeft <= 0) {
        endGame(victim === "player" ? "ai" : "player");
        return;
      }

      newCylinder();
      state.turn = other;
      state.phase = "ready";

      if (who === "player") {
        setMsg(target === "other" ? "liveOppPlayer" : "liveSelfPlayer", "#ff5555");
      } else {
        setMsg(target === "other" ? "liveOppAI" : "liveSelfAI", "#ff5555");
      }
    } else {
      if (who === "player") {
        state.ps += 10;
      } else {
        state.as += 10;
      }

      if (target === "other") {
        state.turn = other;
        state.phase = "ready";
        setMsg(who === "player" ? "blankOppPlayer" : "blankOppAI", "#ffcc00");
      } else {
        state.turn = who;
        state.phase = "decide";
        setMsg(who === "player" ? "blankSelfPlayer" : "blankSelfAI", "#ffcc00");
      }
    }

    state.busy = false;
    render();

    if (state.turn === "ai") {
      schedule(state.phase === "decide" ? aiDecide : aiShoot, 800);
    }
  }

  function playerShoot(target) {
    if (!state || state.over || state.busy || sixActive || state.turn !== "player") {
      return;
    }
    if (state.phase !== "ready" && state.phase !== "decide") {
      return;
    }

    var at = target === "other" ? "other" : "self";
    ensureAudio();

    if (at === "other") {
      systemStreak++;
      if (systemStreak >= 6) {
        if (sixTimer) {
          window.clearTimeout(sixTimer);
        }
        sixTimer = window.setTimeout(triggerSix, 650);
      }
    } else {
      systemStreak = 0;
    }

    shoot("player", at);
  }

  function playerPass() {
    if (!state || state.over || state.busy || sixActive || state.turn !== "player" || state.phase !== "decide") {
      return;
    }
    systemStreak = 0;
    state.turn = "ai";
    state.phase = "ready";
    setMsg("pass", "#d8ffd8");
    render();
    schedule(aiShoot, 700);
  }

  function aiPickTarget() {
    if (state.ahp <= 1) {
      return "other";
    }
    if (state.chambers.length <= 2) {
      return Math.random() < 0.55 ? "other" : "self";
    }
    return Math.random() < 0.3 ? "other" : "self";
  }

  function aiShoot(target) {
    if (!state || state.over || sixActive || state.turn !== "ai") {
      return;
    }

    var at = target === "self" || target === "other" ? target : aiPickTarget();
    state.busy = true;
    setMsg(at === "other" ? "aiShootPlayer" : "aiShootSelf", "#d8ffd8");
    render();
    schedule(function () {
      state.busy = false;
      shoot("ai", at);
    }, 900);
  }

  function aiDecide() {
    if (!state || state.over || sixActive || state.turn !== "ai") {
      return;
    }

    var left = state.chambers.length;
    var pass = false;

    if (left <= 1) {
      pass = true;
    } else if (state.ahp === 1 && left <= 3) {
      pass = true;
    } else if (left <= 2) {
      pass = true;
    } else if (Math.random() < 0.12) {
      pass = true;
    }

    if (pass) {
      state.turn = "player";
      state.phase = "ready";
      setMsg("aiPass", "#d8ffd8");
      render();
    } else {
      setMsg("aiAgain", "#d8ffd8");
      aiShoot();
    }
  }

  function setLang(next) {
    lang = next === "zh" ? "zh" : "en";

    try {
      window.localStorage.setItem("bw_lang", lang);
    } catch (e) {
      /* private mode */
    }

    applyStatic();
    renderMessage();
    if (state) {
      render();
    }
  }

  var savedLang = "en";
  try {
    savedLang = window.localStorage.getItem("bw_lang") || "en";
  } catch (e) {
    savedLang = "en";
  }
  lang = savedLang === "zh" ? "zh" : "en";

  applyStatic();

  var languageButtons = document.querySelectorAll(".lang-switch button");
  for (var k = 0; k < languageButtons.length; k++) {
    languageButtons[k].addEventListener("click", function () {
      setLang(this.getAttribute("data-lang"));
    });
  }

  var shootButton = $("btnShoot");
  var shootAIButton = $("btnShootAI");
  var passButton = $("btnPass");
  var resetButton = $("btnReset");

  if (shootButton) {
    shootButton.addEventListener("click", function () {
      playerShoot("self");
    });
  }
  if (shootAIButton) {
    shootAIButton.addEventListener("click", function () {
      playerShoot("other");
    });
  }
  if (passButton) {
    passButton.addEventListener("click", playerPass);
  }
  if (resetButton) {
    resetButton.addEventListener("click", newGame);
  }

  var sixWake = $("sixWake");
  if (sixWake) {
    sixWake.addEventListener("click", wakeSix);
  }

  newGame();
})(window, document);
