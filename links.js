/* Brian's Workshop — Links page: copy the "link to me" snippet. */
(function (window, document) {
  "use strict";

  var button = document.getElementById("copyLink");
  var code = document.getElementById("linkCode");
  if (!button || !code) {
    return;
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try {
      if (!document.execCommand("copy")) {
        throw new Error("copy");
      }
    } finally {
      area.remove();
    }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        fallbackCopy(text);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  button.addEventListener("click", function () {
    var old = button.textContent;
    copyText(code.textContent).then(function () {
      button.textContent = "COPIED!";
      window.setTimeout(function () {
        button.textContent = old;
      }, 1800);
    }).catch(function () {
      button.textContent = "COPY FAILED";
      window.setTimeout(function () {
        button.textContent = old;
      }, 1800);
    });
  });
})(window, document);
