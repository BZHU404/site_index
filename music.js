/* ==========================================================================
   BRIAN'S WORKSHOP — music box
   All ten tracks from the playlist. Audio and lyrics live in music/.
   The lyrics are shown as a rolling three-line subtitle bar inside the
   player; each .lrc also has an inline fallback for file:// viewing.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var TRACKS = [
    { id: "catch", n: 1, title: "Catch the Rainbow", artist: "Rainbow", year: "1975", src: "music/catch-the-rainbow.mp3", lrc: "music/catch-the-rainbow.lrc", fallback: "lrc-catch", duration: 396.5, durationLabel: "6:36" },
    { id: "just", n: 2, title: "Just the Two of Us", artist: "Grover Washington Jr., Bill Withers", year: "", src: "music/just-the-two-of-us.mp3", lrc: "music/just-the-two-of-us.lrc", fallback: "lrc-just", duration: 240.1, durationLabel: "4:00" },
    { id: "despacito", n: 3, title: "Despacito", artist: "Luis Fonsi, Daddy Yankee", year: "", src: "music/despacito.mp3", lrc: "music/despacito.lrc", fallback: "lrc-despacito", duration: 230.5, durationLabel: "3:50" },
    { id: "killer", n: 4, title: "Killer Queen", artist: "Queen", year: "", src: "music/killer-queen.mp3", lrc: "music/killer-queen.lrc", fallback: "lrc-killer", duration: 180.9, durationLabel: "3:01" },
    { id: "back", n: 5, title: "Back in Black", artist: "AC/DC", year: "", src: "music/back-in-black.mp3", lrc: "music/back-in-black.lrc", fallback: "lrc-back", duration: 255.3, durationLabel: "4:15" },
    { id: "johnny", n: 6, title: "Johnny B. Goode", artist: "Chuck Berry", year: "", src: "music/johnny-b-goode.mp3", lrc: "music/johnny-b-goode.lrc", fallback: "lrc-johnny", duration: 158.6, durationLabel: "2:39" },
    { id: "guns", n: 7, title: "21 Guns", artist: "Green Day", year: "", src: "music/21-guns.mp3", lrc: "music/21-guns.lrc", fallback: "lrc-guns", duration: 321.0, durationLabel: "5:21" },
    { id: "freebird", n: 8, title: "Free Bird", artist: "Lynyrd Skynyrd", year: "", src: "music/free-bird.mp3", lrc: "music/free-bird.lrc", fallback: "lrc-freebird", duration: 550.1, durationLabel: "9:10" },
    { id: "come", n: 9, title: "Come as You Are", artist: "Nirvana", year: "", src: "music/come-as-you-are.mp3", lrc: "music/come-as-you-are.lrc", fallback: "lrc-come", duration: 219.0, durationLabel: "3:39" },
    { id: "letitbe", n: 10, title: "Let It Be", artist: "The Beatles", year: "", src: "music/let-it-be.mp3", lrc: "music/let-it-be.lrc", fallback: "lrc-letitbe", duration: 230.5, durationLabel: "3:50" }
  ];

  var LINE_HEIGHT = 20;
  var bgm = document.getElementById("bgm");
  if (!bgm) {
    return;
  }

  var btnPlay = document.getElementById("btnMusic");
  var btnStop = document.getElementById("btnStop");
  var btnVol = document.getElementById("btnVol");
  var seek = document.getElementById("seek");
  var timeEl = document.getElementById("musicTime");
  var stateEl = document.getElementById("playState");
  var vizEl = document.getElementById("viz");
  var record = document.getElementById("record");
  var lyricsTrack = document.getElementById("lyricsTrack");
  var trackKicker = document.getElementById("trackKicker");
  var trackTitle = document.getElementById("trackTitle");
  var trackArtist = document.getElementById("trackArtist");

  var trackButtons = document.querySelectorAll(".track-play");
  var trackRows = document.querySelectorAll(".track[data-track]");

  var VOLUME_LABELS = ["LOW", "MED", "HIGH"];
  var VOLUME_VALUES = [0.4, 0.7, 1];
  var volumeIndex = 1;

  var current = TRACKS[0];
  var lyricLines = [];
  var lastActiveIndex = -1;
  var vizTimer = null;
  var lyricToken = 0;

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function fmt(seconds) {
    if (!isFinite(seconds) || seconds < 0) {
      seconds = 0;
    }
    return pad2(Math.floor(seconds / 60)) + ":" + pad2(Math.floor(seconds % 60));
  }

  function setState(text) {
    if (stateEl) {
      stateEl.textContent = text;
    }
  }

  function setButtons(playing) {
    if (btnPlay) {
      btnPlay.textContent = playing ? "❚❚ PAUSE" : "▶ PLAY";
    }

    for (var i = 0; i < trackButtons.length; i++) {
      var isCurrent = trackButtons[i].getAttribute("data-track") === current.id;
      trackButtons[i].textContent = isCurrent && playing ? "PAUSE" : "PLAY";
    }
  }

  function updateTrackRows() {
    for (var i = 0; i < trackRows.length; i++) {
      trackRows[i].classList.toggle("is-current", trackRows[i].getAttribute("data-track") === current.id);
    }
  }

  function setTrackUI(track) {
    if (trackKicker) {
      trackKicker.textContent = "NOW PLAYING · TRACK " + pad2(track.n) + " / " + pad2(TRACKS.length);
    }
    if (trackTitle) {
      trackTitle.textContent = track.title;
    }
    if (trackArtist) {
      trackArtist.textContent = track.artist + (track.year ? " · " + track.year : "");
    }
    if (timeEl) {
      timeEl.textContent = "00:00 / " + track.durationLabel;
    }
    if (seek) {
      seek.value = "0";
    }
    updateTrackRows();
  }

  function updateTime() {
    var total = isFinite(bgm.duration) && bgm.duration > 0 ? bgm.duration : current.duration;
    var now = isFinite(bgm.currentTime) ? bgm.currentTime : 0;

    if (timeEl) {
      timeEl.textContent = fmt(now) + " / " + fmt(total);
    }
    if (seek && total > 0) {
      seek.value = String((now / total) * 100);
    }
  }

  function togglePlay() {
    if (bgm.paused) {
      var promise = bgm.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          setState("× PLAYBACK BLOCKED");
          setButtons(false);
        });
      }
    } else {
      bgm.pause();
    }
  }

  function stopPlayback() {
    bgm.pause();
    bgm.currentTime = 0;
    updateTime();
    updateLyrics(0, true);
    setState("■ STOPPED");
    setButtons(false);
    if (record) {
      record.classList.remove("is-playing");
    }
    stopViz();
  }

  function cycleVolume() {
    volumeIndex = (volumeIndex + 1) % VOLUME_VALUES.length;
    bgm.volume = VOLUME_VALUES[volumeIndex];
    if (btnVol) {
      btnVol.textContent = "VOL: " + VOLUME_LABELS[volumeIndex];
    }
  }

  function updateViz() {
    var chars = "▁▂▃▄▅▆▇";
    var out = "";
    for (var i = 0; i < 10; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (vizEl) {
      vizEl.textContent = out;
    }
  }

  function startViz() {
    if (vizTimer) {
      return;
    }
    updateViz();
    vizTimer = window.setInterval(updateViz, 140);
  }

  function stopViz() {
    if (vizTimer) {
      window.clearInterval(vizTimer);
      vizTimer = null;
    }
    if (vizEl) {
      vizEl.textContent = "▁▁▁▁▁▁▁▁▁▁";
    }
  }

  /* ------------------------------------------------------------------ *
   *  LRC lyrics — rolling subtitle bar
   * ------------------------------------------------------------------ */

  function parseLRC(text) {
    var lines = String(text || "").split(/\r?\n/);
    var out = [];
    var offset = 0;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/^\s+|\s+$/g, "");
      if (!line) {
        continue;
      }

      var offsetMatch = line.match(/^\[offset:([+-]?\d+)\]/i);
      if (offsetMatch) {
        offset = parseInt(offsetMatch[1], 10) / 1000;
        continue;
      }

      var stamps = line.match(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g);
      if (!stamps) {
        continue;
      }

      var body = line.replace(/\[[^\]]*\]/g, "").replace(/^\s+|\s+$/g, "");
      if (!body) {
        continue;
      }

      for (var j = 0; j < stamps.length; j++) {
        var parts = stamps[j].match(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/);
        var seconds = parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
        if (parts[3]) {
          seconds += parseInt((parts[3] + "00").slice(0, 3), 10) / 1000;
        }
        seconds -= offset;
        if (seconds < 0) {
          seconds = 0;
        }
        out.push({ t: seconds, text: body });
      }
    }

    out.sort(function (a, b) {
      return a.t - b.t;
    });
    return out;
  }

  function initLyrics(text) {
    if (!lyricsTrack) {
      return;
    }

    var data = parseLRC(text);
    lyricsTrack.innerHTML = "";
    lyricLines = [];
    lastActiveIndex = -1;

    if (!data.length) {
      var empty = document.createElement("div");
      empty.className = "player-lyrics-line";
      empty.textContent = "No lyrics for this track.";
      lyricsTrack.appendChild(empty);
      lyricsTrack.style.transform = "translateY(" + LINE_HEIGHT + "px)";
      return;
    }

    for (var i = 0; i < data.length; i++) {
      var line = document.createElement("div");
      line.className = "player-lyrics-line";
      line.textContent = data[i].text;
      lyricsTrack.appendChild(line);
      lyricLines.push({ t: data[i].t, el: line });
    }

    updateLyrics(0, true);
  }

  function updateLyrics(seconds, force) {
    if (!lyricLines.length || !lyricsTrack) {
      return;
    }

    var index = -1;
    for (var i = 0; i < lyricLines.length; i++) {
      if (lyricLines[i].t <= seconds + 0.2) {
        index = i;
      } else {
        break;
      }
    }

    if (index === lastActiveIndex && !force) {
      return;
    }

    if (lastActiveIndex >= 0 && lyricLines[lastActiveIndex]) {
      lyricLines[lastActiveIndex].el.classList.remove("on");
    }

    lastActiveIndex = index;

    if (index >= 0) {
      lyricLines[index].el.classList.add("on");
      lyricsTrack.style.transform = "translateY(" + (LINE_HEIGHT - index * LINE_HEIGHT) + "px)";
    }
  }

  function loadLyrics(track) {
    if (!lyricsTrack) {
      return;
    }

    var token = ++lyricToken;
    var fallback = document.getElementById(track.fallback);
    var fallbackText = fallback ? fallback.textContent : "";

    lyricsTrack.innerHTML = '<div class="player-lyrics-line">Loading lyrics…</div>';
    lyricsTrack.style.transform = "translateY(" + LINE_HEIGHT + "px)";
    lastActiveIndex = -1;

    if (!window.fetch || window.location.protocol === "file:") {
      initLyrics(fallbackText);
      return;
    }

    window.fetch(track.lrc, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("lrc");
        }
        return response.text();
      })
      .then(function (text) {
        if (token === lyricToken) {
          initLyrics(text);
        }
      })
      .catch(function () {
        if (token === lyricToken) {
          initLyrics(fallbackText);
        }
      });
  }

  /* ------------------------------------------------------------------ *
   *  Track switching
   * ------------------------------------------------------------------ */

  function loadTrack(track, autoplay) {
    bgm.pause();
    current = track;
    bgm.src = track.src;
    bgm.load();
    bgm.currentTime = 0;

    setTrackUI(track);
    loadLyrics(track);
    updateTime();
    setState("■ STOPPED");
    setButtons(false);
    if (record) {
      record.classList.remove("is-playing");
    }
    stopViz();

    if (autoplay) {
      var promise = bgm.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          setState("× PLAYBACK BLOCKED");
          setButtons(false);
        });
      }
    }
  }

  /* ------------------------------------------------------------------ *
   *  Player events
   * ------------------------------------------------------------------ */

  if (seek) {
    seek.addEventListener("input", function () {
      var total = isFinite(bgm.duration) && bgm.duration > 0 ? bgm.duration : current.duration;
      var ratio = parseFloat(seek.value) / 100;
      if (isFinite(ratio)) {
        bgm.currentTime = ratio * total;
        updateTime();
        updateLyrics(bgm.currentTime, true);
      }
    });
  }

  if (btnPlay) {
    btnPlay.addEventListener("click", togglePlay);
  }
  if (btnStop) {
    btnStop.addEventListener("click", stopPlayback);
  }
  if (btnVol) {
    btnVol.addEventListener("click", cycleVolume);
  }

  for (var b = 0; b < trackButtons.length; b++) {
    trackButtons[b].addEventListener("click", function () {
      var id = this.getAttribute("data-track");
      var track = null;

      for (var i = 0; i < TRACKS.length; i++) {
        if (TRACKS[i].id === id) {
          track = TRACKS[i];
          break;
        }
      }

      if (!track) {
        return;
      }

      if (current.id === track.id) {
        togglePlay();
      } else {
        loadTrack(track, true);
      }
    });
  }

  bgm.addEventListener("loadedmetadata", updateTime);

  bgm.addEventListener("timeupdate", function () {
    updateTime();
    updateLyrics(bgm.currentTime);
  });

  bgm.addEventListener("play", function () {
    setState("▶ PLAYING");
    setButtons(true);
    updateTrackRows();
    if (record) {
      record.classList.add("is-playing");
    }
    startViz();
  });

  bgm.addEventListener("pause", function () {
    if (!bgm.ended) {
      setState("❚❚ PAUSED");
      setButtons(false);
    }
    if (record) {
      record.classList.remove("is-playing");
    }
    stopViz();
  });

  bgm.addEventListener("ended", function () {
    setState("■ END OF TAPE");
    setButtons(false);
    if (record) {
      record.classList.remove("is-playing");
    }
    stopViz();
  });

  bgm.addEventListener("error", function () {
    setState("× AUDIO NOT FOUND");
    setButtons(false);
    if (record) {
      record.classList.remove("is-playing");
    }
    stopViz();
  });

  /* ------------------------------------------------------------------ *
   *  Boot
   * ------------------------------------------------------------------ */

  bgm.volume = VOLUME_VALUES[volumeIndex];
  if (btnVol) {
    btnVol.textContent = "VOL: " + VOLUME_LABELS[volumeIndex];
  }

  current = TRACKS[0];
  bgm.src = current.src;
  setTrackUI(current);
  loadLyrics(current);
  updateTime();
  updateTrackRows();
  setButtons(false);
})(window, document);
