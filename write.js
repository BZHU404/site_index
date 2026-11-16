/* ==========================================================================
   BRIAN'S WORKSHOP — local writing desk
   --------------------------------------------------------------------------
   Saves entries to localStorage, previews them with the same Markdown
   renderer as the weblog, and exports posts.js for the publish step.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var Blog = window.BWBlog;
  if (!Blog) {
    return;
  }

  var form = document.getElementById("postForm");
  var fTitle = document.getElementById("fTitle");
  var fDate = document.getElementById("fDate");
  var fSlug = document.getElementById("fSlug");
  var fTags = document.getElementById("fTags");
  var fExcerpt = document.getElementById("fExcerpt");
  var fBody = document.getElementById("fBody");
  var btnDelete = document.getElementById("btnDelete");
  var postRows = document.getElementById("postRows");
  var preview = document.getElementById("preview");
  var storageNote = document.getElementById("storageNote");
  var importFile = document.getElementById("importFile");
  var toastEl = document.getElementById("toast");

  var editingId = null;
  var slugTouched = false;
  var toastTimer = null;
  var storageOK = true;
  var dirty = false;

  /* ------------------------------------------------------------------ *
   *  Utilities
   * ------------------------------------------------------------------ */

  function trim(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/^\s+|\s+$/g, "");
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function queryParam(name) {
    var pattern = new RegExp("[?&]" + name + "=([^&#]*)", "i");
    var match = pattern.exec(window.location.search);
    if (!match) {
      return null;
    }
    try {
      return decodeURIComponent(match[1].replace(/\+/g, " "));
    } catch (e) {
      return match[1];
    }
  }

  function setUrl(id) {
    if (!window.history || !window.history.replaceState) {
      return;
    }
    try {
      window.history.replaceState(null, "", id
        ? "write.html?p=" + encodeURIComponent(id)
        : "write.html");
    } catch (e) {
      /* file:// origins sometimes refuse replaceState — not important. */
    }
  }

  function toast(message) {
    if (!toastEl) {
      return;
    }
    toastEl.textContent = message;
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.hidden = true;
    }, 4600);
  }

  function slugify(title) {
    var slug = String(title || "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    if (!slug) {
      slug = "entry-" + todayISO().replace(/-/g, "");
    }

    return slug;
  }

  function uniqueId(base) {
    var ids = {};
    Blog.getAll().forEach(function (post) {
      ids[post.id] = true;
    });

    if (!ids[base]) {
      return base;
    }

    var n = 2;
    while (ids[base + "-" + n]) {
      n++;
    }
    return base + "-" + n;
  }

  function hasLocal(id) {
    return Blog.readLocal().some(function (post) {
      return post.id === id;
    });
  }

  function formHasContent() {
    return !!(trim(fTitle.value) || trim(fBody.value) ||
      trim(fExcerpt.value) || trim(fTags.value));
  }

  /* ------------------------------------------------------------------ *
   *  Form <-> post
   * ------------------------------------------------------------------ */

  function readForm() {
    return {
      title: trim(fTitle.value),
      date: fDate.value || todayISO(),
      slug: trim(fSlug.value).toLowerCase(),
      tags: fTags.value.split(",").map(trim).filter(Boolean).slice(0, 8),
      excerpt: trim(fExcerpt.value),
      body: fBody.value
    };
  }

  function renderPreview() {
    var data = readForm();
    var title = data.title || "无标题文章";
    var date = Blog.dateLabel(data.date || todayISO());
    var tags = data.tags;

    preview.innerHTML =
      '<div class="post-head">' +
        '<span class="post-date">' + Blog.esc(date) + "</span>" +
        '<h1 class="post-title">' + Blog.esc(title) + "</h1>" +
        '<p class="post-meta">预览' +
          (tags.length ? " · " + tags.map(function (tag) {
            return Blog.esc(tag);
          }).join(" · ") : "") +
        "</p>" +
      "</div>" +
      (trim(data.body)
        ? '<div class="post-body">' + Blog.renderMarkdown(data.body) + "</div>"
        : '<p class="muted">开始输入，文章会显示在这里。</p>');
  }

  function refreshList() {
    var posts = Blog.getAll();

    postRows.innerHTML = posts.length ? posts.map(function (post) {
      return '<div class="post-row' + (post.id === editingId ? " current" : "") + '">' +
        '<a href="#" data-id="' + Blog.esc(post.id) + '">' + Blog.esc(post.title) + "</a>" +
        (Blog.isDraft(post) ? ' <span class="draft-badge">本地</span>' : "") +
        '<span class="row-date">' + Blog.esc(Blog.dateLabel(post.date)) + "</span>" +
      "</div>";
    }).join("") : '<p class="tiny">还没有文章。写第一篇。</p>';
  }

  function loadPost(id) {
    var post = Blog.getPost(id);
    if (!post) {
      toast("找不到这篇文章。");
      return;
    }

    editingId = post.id;
    fTitle.value = post.title;
    fDate.value = post.date;
    fSlug.value = post.id;
    fSlug.disabled = true;
    fTags.value = post.tags.join(", ");
    fExcerpt.value = post.excerpt;
    fBody.value = post.body;
    btnDelete.disabled = !hasLocal(post.id);

    dirty = false;
    refreshList();
    renderPreview();
    setUrl(post.id);

    if (fTitle.scrollIntoView) {
      fTitle.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function newEntry(focus) {
    form.reset();
    editingId = null;
    slugTouched = false;
    fDate.value = todayISO();
    fSlug.value = "";
    fSlug.disabled = false;
    btnDelete.disabled = true;
    dirty = false;
    refreshList();
    renderPreview();
    setUrl(null);

    if (focus) {
      fTitle.focus();
    }
  }

  function savePost(event, silent) {
    if (event) {
      event.preventDefault();
    }

    var data = readForm();

    if (!data.title) {
      toast("请先给文章起一个标题。");
      fTitle.focus();
      return false;
    }

    if (!trim(data.body)) {
      toast("正文是空的。");
      fBody.focus();
      return false;
    }

    var id = editingId;

    if (!id) {
      var base = data.slug || slugify(data.title);
      base = base.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
      if (!base) {
        base = slugify(data.title);
      }
      id = uniqueId(base);
    }

    var post = {
      id: id,
      title: data.title,
      date: data.date,
      tags: data.tags,
      excerpt: data.excerpt || Blog.makeExcerpt(data.body),
      body: data.body
    };

    var saved = Blog.upsertLocal(post);

    editingId = id;
    fSlug.value = id;
    fSlug.disabled = true;
    btnDelete.disabled = !hasLocal(id);

    refreshList();
    renderPreview();
    setUrl(id);

    if (!saved) {
      toast("浏览器存储被禁用。关闭页面前，先把文字复制到安全的地方。");
      return false;
    }

    dirty = false;

    if (!silent) {
      toast(hasLocal(id) ? "已保存到本机。导出 posts.js 才算发布。" : "已保存。");
    }

    return true;
  }

  /* ------------------------------------------------------------------ *
   *  Export / copy / import
   * ------------------------------------------------------------------ */

  function download(filename, text) {
    try {
      var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1500);
      return true;
    } catch (e) {
      return false;
    }
  }

  function exportPosts() {
    if (formHasContent()) {
      if (!savePost(null, true)) {
        return;
      }
    }

    var text = Blog.serialize(Blog.getAll());

    if (!download("posts.js", text)) {
      toast("下载失败——请改用“复制 posts.js”。");
      return;
    }

    Blog.markPublished(Blog.readLocal().map(function (post) {
      return post.id;
    }));

    refreshList();
    renderPreview();
    toast("posts.js 已下载。替换站点文件夹里的文件才算发布。");
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      try {
        if (document.execCommand("copy")) {
          resolve();
        } else {
          reject(new Error("copy"));
        }
      } catch (e) {
        reject(e);
      } finally {
        area.remove();
      }
    });
  }

  function copyPosts() {
    if (formHasContent()) {
      if (!savePost(null, true)) {
        return;
      }
    }

    copyText(Blog.serialize(Blog.getAll())).then(function () {
      toast("已复制。粘贴覆盖 posts.js 的内容。");
    }).catch(function () {
      toast("复制失败——请手动从 posts.js 选择文本。");
    });
  }

  function parseImported(text) {
    var list = null;

    try {
      list = JSON.parse(text);
    } catch (e) {
      /* probably a posts.js file, not bare JSON */
    }

    if (!Array.isArray(list)) {
      var start = text.indexOf("[");
      var end = text.lastIndexOf("]");
      if (start !== -1 && end > start) {
        try {
          list = JSON.parse(text.slice(start, end + 1));
        } catch (e2) {
          list = null;
        }
      }
    }

    return Array.isArray(list) ? list : null;
  }

  /* ------------------------------------------------------------------ *
   *  Events
   * ------------------------------------------------------------------ */

  form.addEventListener("submit", function (event) {
    savePost(event, false);
  });

  document.getElementById("btnNew").addEventListener("click", function () {
    if (dirty && !window.confirm("放弃当前草稿，开始新文章？")) {
      return;
    }
    newEntry(true);
  });

  btnDelete.addEventListener("click", function () {
    if (!editingId) {
      return;
    }

    if (!hasLocal(editingId)) {
      toast("这是内置文章。请从 posts.js 里删除。");
      return;
    }

    if (!window.confirm("从本机删除这篇文章？如果存在内置版本，它会回来。")) {
      return;
    }

    Blog.removeLocal(editingId);
    var id = editingId;
    editingId = null;
    newEntry(false);
    toast(Blog.getPost(id) ? "本地副本已删除，内置版本已恢复。" : "已从本机删除这篇文章。");
  });

  document.getElementById("btnExport").addEventListener("click", exportPosts);
  document.getElementById("btnCopy").addEventListener("click", copyPosts);

  importFile.addEventListener("change", function () {
    var file = importFile.files && importFile.files[0];
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      var list = parseImported(String(reader.result || ""));

      if (!list) {
        toast("这个文件看起来不像 posts.js。");
        return;
      }

      var imported = 0;
      list.forEach(function (raw) {
        var post = Blog.normalize(raw);
        if (post) {
          post._local = true;
          if (Blog.upsertLocal(post)) {
            imported++;
          }
        }
      });

      refreshList();
      toast("已导入 " + imported + " 篇文章到本机。");
      importFile.value = "";
    };
    reader.readAsText(file);
  });

  postRows.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("a[data-id]") : null;
    if (!link) {
      return;
    }
    event.preventDefault();
    if (dirty && !window.confirm("放弃当前草稿，打开那篇文章？")) {
      return;
    }
    loadPost(link.getAttribute("data-id"));
  });

  fTitle.addEventListener("input", function () {
    dirty = true;
    if (!editingId && !slugTouched) {
      fSlug.value = slugify(fTitle.value);
      if (!trim(fTitle.value)) {
        fSlug.value = "";
      }
    }
    renderPreview();
  });

  fSlug.addEventListener("input", function () {
    dirty = true;
    slugTouched = true;
    fSlug.value = fSlug.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    renderPreview();
  });

  [fDate, fTags, fExcerpt, fBody].forEach(function (field) {
    field.addEventListener("input", function () {
      dirty = true;
      renderPreview();
    });
    field.addEventListener("change", function () {
      dirty = true;
      renderPreview();
    });
  });

  window.addEventListener("beforeunload", function (event) {
    if (!dirty) {
      return;
    }
    event.preventDefault();
    event.returnValue = "";
  });

  document.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === "s") {
      event.preventDefault();
      savePost(null, false);
    }
  });

  /* ------------------------------------------------------------------ *
   *  Boot
   * ------------------------------------------------------------------ */

  try {
    window.localStorage.setItem("bw_storage_test", "1");
    window.localStorage.removeItem("bw_storage_test");
  } catch (e) {
    storageOK = false;
  }

  if (storageNote) {
    storageNote.textContent = storageOK
      ? "存储：本机浏览器（localStorage）。不会上传。"
      : "浏览器存储被禁用。刷新后不会保留，请立即导出。";
  }

  fDate.value = todayISO();

  var startId = queryParam("p");
  if (startId) {
    loadPost(startId);
  } else {
    newEntry(false);
  }

  refreshList();
  renderPreview();
})(window, document);
