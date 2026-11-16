/* Tape 00 — locked side.
   Argon2id (64 MiB, 3 passes, 1 lane) + AES-GCM-256.
   This file intentionally contains ciphertext only: no password, no hash,
   and no plaintext copy of the message. The page that holds the tape is
   public; the contents are not. */

(function (window, document) {
  "use strict";

  var PAYLOAD = {
    v: 2,
    kdf: {
      name: "argon2id",
      salt: "v/mSk9QewmIBspLY2GzMYQ==",
      time: 3,
      mem: 65536,
      parallelism: 1,
      hashLen: 32
    },
    iv: "hXVwVDWOdlI11KfD",
    data: "sw1nQMMgEY5glCrn77T+qHnzFo6OBDcXJu8EDfiQT83cs1pbFY0WMmKTUOFEPvE0HkkT48rr58bGxGWa9ap/C2qsp1Cd"
  };

  var form = document.getElementById("tapeForm");
  var input = document.getElementById("tapeCode");
  var submit = document.getElementById("tapeSubmit");
  var lock = document.getElementById("tapeLock");
  var error = document.getElementById("tapeError");
  var status = document.getElementById("tapeStatus");
  var message = document.getElementById("tapeMessage");
  var love = document.getElementById("tapeLove");
  var card = document.getElementById("tapeCard");
  var counter = document.getElementById("tapeCounter");

  if (!form || !input || !submit || !message || !love || !card) {
    return;
  }

  var busy = false;
  var decoder = new TextDecoder();

  function fromBase64(value) {
    var binary = window.atob(value);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function setBusy(value) {
    busy = value;
    submit.disabled = value;
    input.disabled = value;
  }

  function deny(messageText) {
    error.textContent = messageText || "ACCESS DENIED";
    status.textContent = "INSERT ACCESS CODE";
    window.setTimeout(function () {
      setBusy(false);
      input.value = "";
      input.focus();
    }, 1200);
  }

  async function decryptTape(code) {
    var derived = await window.argon2.hash({
      pass: code,
      salt: fromBase64(PAYLOAD.kdf.salt),
      time: PAYLOAD.kdf.time,
      mem: PAYLOAD.kdf.mem,
      parallelism: PAYLOAD.kdf.parallelism,
      hashLen: PAYLOAD.kdf.hashLen,
      type: window.argon2.ArgonType.Argon2id
    });

    var key = await window.crypto.subtle.importKey(
      "raw",
      derived.hash,
      "AES-GCM",
      false,
      ["decrypt"]
    );

    var plain = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(PAYLOAD.iv), tagLength: 128 },
      key,
      fromBase64(PAYLOAD.data)
    );

    return JSON.parse(decoder.decode(plain));
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (busy) {
      return;
    }

    var code = input.value;
    error.textContent = "";

    if (!code) {
      deny("ACCESS DENIED");
      return;
    }

    if (!window.argon2 || typeof window.argon2.hash !== "function") {
      error.textContent = "TAPE DECK OFFLINE";
      return;
    }

    if (!window.crypto || !window.crypto.subtle) {
      error.textContent = "OPEN THIS TAPE OVER HTTP(S)";
      return;
    }

    setBusy(true);
    status.textContent = "READING TAPE…";

    decryptTape(code).then(function (data) {
      if (!data || typeof data.message !== "string" || !data.message) {
        throw new Error("empty");
      }

      love.textContent = data.message;
      form.hidden = true;
      message.hidden = false;
      error.textContent = "";
      status.textContent = "SIDE A · PLAYING";
      card.classList.add("is-open");
      if (counter) {
        counter.textContent = "0001";
      }
      setBusy(false);
      message.focus();
    }).catch(function () {
      deny("ACCESS DENIED");
    });
  });

  if (lock) {
    lock.addEventListener("click", function () {
      message.hidden = true;
      form.hidden = false;
      love.textContent = "";
      error.textContent = "";
      status.textContent = "INSERT ACCESS CODE";
      card.classList.remove("is-open");
      if (counter) {
        counter.textContent = "0000";
      }
      input.value = "";
      setBusy(false);
      input.focus();
    });
  }
})(window, document);
