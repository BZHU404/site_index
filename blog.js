/* ==========================================================================
   BRIAN'S WORKSHOP — weblog engine
   --------------------------------------------------------------------------
   Reads posts.js (window.BLOG_POSTS), merges local drafts saved by write.html,
   and renders the homepage teaser, the weblog index, single entries, and the
   archive / tag rails.

   Includes a tiny Markdown renderer. No libraries, no build step, no tracking.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var STORE_KEY = "bw_posts_v1";
  var SEED = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS.slice(0) : [];

  /* ------------------------------------------------------------------ *
   *  Small helpers
   * ------------------------------------------------------------------ */

  function esc(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function trim(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/^\s+|\s+$/g, "");
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function dateLabel(iso) {
    return String(iso || "").replace(/-/g, ".");
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

  function plainText(markdown) {
    return String(markdown || "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]*>/g, " ")
      .replace(/[#>*_`~-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "");
  }

  function makeExcerpt(body, limit) {
    limit = limit || 180;
    var text = plainText(body);
    if (text.length <= limit) {
      return text;
    }
    return text.slice(0, limit).replace(/\s+\S*$/, "") + "…";
  }

  function readingTime(body) {
    var text = plainText(body);
    var cjk = (text.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g) || []).length;
    var words = text.replace(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, " ")
      .split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil((words / 200) + (cjk / 300)));
  }

  /* ------------------------------------------------------------------ *
   *  Data: seeds + local drafts
   * ------------------------------------------------------------------ */

  function normalize(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    var id = trim(raw.id).toLowerCase();
    var title = trim(raw.title);
    var date = trim(raw.date);

    if (!id || !title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return null;
    }

    var tags = [];
    if (Array.isArray(raw.tags)) {
      tags = raw.tags.map(function (tag) { return trim(tag); }).filter(Boolean);
    } else if (typeof raw.tags === "string") {
      tags = raw.tags.split(",").map(function (tag) { return trim(tag); }).filter(Boolean);
    }

    var body = String(raw.body || "");

    return {
      id: id,
      title: title,
      date: date,
      tags: tags,
      excerpt: trim(raw.excerpt) || makeExcerpt(body),
      body: body,
      _local: raw._local === true
    };
  }

  function readLocal() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) {
        return [];
      }
      var list = JSON.parse(raw);
      if (!Array.isArray(list)) {
        return [];
      }
      return list.map(normalize).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function writeLocal(posts) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(posts || []));
      return true;
    } catch (e) {
      return false;
    }
  }

  function sortPosts(a, b) {
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1;
    }
    if (a.title !== b.title) {
      return a.title < b.title ? -1 : 1;
    }
    return 0;
  }

  function getAll() {
    var map = {};

    SEED.forEach(function (raw) {
      var post = normalize(raw);
      if (post) {
        map[post.id] = post;
      }
    });

    readLocal().forEach(function (post) {
      map[post.id] = post;
    });

    return Object.keys(map).map(function (id) {
      return map[id];
    }).sort(sortPosts);
  }

  function getPost(id) {
    id = trim(id).toLowerCase();
    if (!id) {
      return null;
    }
    var posts = getAll();
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) {
        return posts[i];
      }
    }
    return null;
  }

  function isDraft(post) {
    return !!post && post._local === true;
  }

  function postUrl(id) {
    return "post.html?p=" + encodeURIComponent(id);
  }

  function tagUrl(tag) {
    return "blog.html?tag=" + encodeURIComponent(tag);
  }

  function monthUrl(month) {
    return "blog.html?month=" + encodeURIComponent(month);
  }

  /* ------------------------------------------------------------------ *
   *  Tiny Markdown renderer
   * ------------------------------------------------------------------ */

  function safeUrl(url) {
    var decoded = String(url || "").replace(/&amp;/g, "&");
    if (/^[a-z][a-z0-9+.-]*:/i.test(decoded)) {
      if (!/^(https?|mailto):/i.test(decoded)) {
        return "#";
      }
    }
    return url;
  }

  function inline(raw) {
    var text = esc(raw);
    var codes = [];

    text = text.replace(/`([^`]+)`/g, function (match, code) {
      codes.push(code);
      return "\u0000" + (codes.length - 1) + "\u0000";
    });

    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (match, alt, url) {
      return '<img src="' + safeUrl(url) + '" alt="' + alt + '" loading="lazy">';
    });

    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (match, label, url) {
      var href = safeUrl(url);
      var external = /^https?:/i.test(href.replace(/&amp;/g, "&"));
      return '<a href="' + href + '"' +
        (external ? ' target="_blank" rel="noopener"' : "") + ">" + label + "</a>";
    });

    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

    text = text.replace(/\u0000(\d+)\u0000/g, function (match, index) {
      return "<code>" + codes[Number(index)] + "</code>";
    });

    return text;
  }

  function isBlockStart(line) {
    return /^\s*(#{1,4}\s|```|>\s?|[-*]\s+|\d+\.\s+|(-{3,}|\*{3,}|_{3,})\s*$)/.test(line);
  }

  function renderMarkdown(source) {
    var lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
    var out = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      var text = trim(line);

      if (!text) {
        i++;
        continue;
      }

      if (/^```/.test(text)) {
        var language = trim(text.slice(3));
        var codeLines = [];
        i++;
        while (i < lines.length && !/^```/.test(trim(lines[i]))) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          i++;
        }
        out.push(
          "<pre><code" +
          (language ? ' class="language-' + esc(language) + '"' : "") +
          ">" + esc(codeLines.join("\n")) + "</code></pre>"
        );
        continue;
      }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(text)) {
        out.push("<hr>");
        i++;
        continue;
      }

      var heading = /^(#{1,4})\s+(.*)$/.exec(text);
      if (heading) {
        var level = heading[1].length >= 4 ? 4 : (heading[1].length === 3 ? 3 : 2);
        out.push("<h" + level + ">" + inline(heading[2]) + "</h" + level + ">");
        i++;
        continue;
      }

      if (/^>/.test(text)) {
        var quoted = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) {
          quoted.push(trim(lines[i]).replace(/^>\s?/, ""));
          i++;
        }
        out.push("<blockquote><p>" + inline(quoted.join(" ")) + "</p></blockquote>");
        continue;
      }

      if (/^[-*]\s+/.test(text)) {
        var items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items.push(inline(trim(lines[i]).replace(/^[-*]\s+/, "")));
          i++;
        }
        out.push("<ul>" + items.map(function (item) {
          return "<li>" + item + "</li>";
        }).join("") + "</ul>");
        continue;
      }

      if (/^\d+\.\s+/.test(text)) {
        var ordered = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          ordered.push(inline(trim(lines[i]).replace(/^\d+\.\s+/, "")));
          i++;
        }
        out.push("<ol>" + ordered.map(function (item) {
          return "<li>" + item + "</li>";
        }).join("") + "</ol>");
        continue;
      }

      var paragraph = [inline(text)];
      i++;
      while (i < lines.length && trim(lines[i]) && !isBlockStart(lines[i])) {
        paragraph.push(inline(trim(lines[i])));
        i++;
      }
      out.push("<p>" + paragraph.join("<br>") + "</p>");
    }

    return out.join("\n");
  }

  /* ------------------------------------------------------------------ *
   *  Writing / publishing helpers (used by write.html)
   * ------------------------------------------------------------------ */

  function upsertLocal(post) {
    var clean = normalize(post);
    if (!clean) {
      return false;
    }

    clean._local = true;

    var posts = readLocal();
    var found = false;

    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === clean.id) {
        posts[i] = clean;
        found = true;
        break;
      }
    }

    if (!found) {
      posts.push(clean);
    }

    return writeLocal(posts);
  }

  function removeLocal(id) {
    id = trim(id).toLowerCase();
    var posts = readLocal().filter(function (post) {
      return post.id !== id;
    });
    return writeLocal(posts);
  }

  function markPublished(ids) {
    var selected = {};
    (ids || []).forEach(function (id) {
      selected[trim(id).toLowerCase()] = true;
    });

    var posts = readLocal().map(function (post) {
      if (selected[post.id]) {
        post._local = false;
      }
      return post;
    });

    return writeLocal(posts);
  }

  function cleanPost(post) {
    return {
      id: post.id,
      title: post.title,
      date: post.date,
      tags: post.tags,
      excerpt: post.excerpt,
      body: post.body
    };
  }

  function serialize(posts) {
    var data = (posts || getAll()).map(cleanPost);
    var stamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    return "/* Brian's Workshop — weblog posts.\n" +
      "   Generated " + stamp + " UTC by write.html.\n" +
      "   Replace this file on the site to publish. */\n" +
      "window.BLOG_POSTS = " + JSON.stringify(data, null, 2) + ";\n";
  }

  function archive() {
    var counts = {};

    getAll().forEach(function (post) {
      var month = post.date.slice(0, 7);
      counts[month] = (counts[month] || 0) + 1;
    });

    return Object.keys(counts).sort().reverse().map(function (month) {
      return { month: month, count: counts[month] };
    });
  }

  function tagCounts() {
    var counts = {};

    getAll().forEach(function (post) {
      post.tags.forEach(function (tag) {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.keys(counts).sort(function (a, b) {
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    }).map(function (tag) {
      return { tag: tag, count: counts[tag] };
    });
  }

  /* ------------------------------------------------------------------ *
   *  Rendering
   * ------------------------------------------------------------------ */

  function tagLinks(tags) {
    return tags.map(function (tag) {
      return '<a class="tag" href="' + tagUrl(tag) + '">' + esc(tag) + "</a>";
    }).join(" ");
  }

  function renderLatest() {
    var box = document.getElementById("latestPosts");
    if (!box) {
      return;
    }

    var posts = getAll().slice(0, 3);

    if (!posts.length) {
      box.innerHTML = '<p class="latest-excerpt">暂无文章。<a href="write.html">写第一篇 »</a></p>';
      return;
    }

    box.innerHTML = posts.map(function (post) {
      return '<div class="latest-item">' +
        '<div class="latest-date">' + esc(dateLabel(post.date)) + "</div>" +
        "<div>" +
          '<p class="latest-title"><a href="' + postUrl(post.id) + '">' +
            esc(post.title) + "</a>" +
            (isDraft(post) ? ' <span class="draft-badge">本地</span>' : "") +
          "</p>" +
          '<p class="latest-excerpt">' + esc(post.excerpt) + "</p>" +
        "</div>" +
      "</div>";
    }).join("");
  }

  function renderBlog() {
    var list = document.getElementById("blogList");
    if (!list) {
      return;
    }

    var empty = document.getElementById("blogEmpty");
    if (empty) {
      empty.hidden = true;
    }

    var tag = queryParam("tag");
    var month = queryParam("month");
    var posts = getAll();

    if (tag) {
      posts = posts.filter(function (post) {
        return post.tags.indexOf(tag) !== -1;
      });
    }

    if (month) {
      posts = posts.filter(function (post) {
        return post.date.slice(0, 7) === month;
      });
    }

    var count = document.getElementById("blogCount");
    if (count) {
      count.textContent = posts.length + " 篇";
    }

    var note = document.getElementById("filterNote");
    if (note) {
      if (tag || month) {
        note.innerHTML = ' · 筛选：<b>' + esc(tag ? "#" + tag : month) +
          '</b> · <a href="blog.html">清除</a>';
      } else {
        note.innerHTML = "";
      }
    }

    if (!posts.length) {
      list.innerHTML = "";
      if (empty) {
        empty.hidden = false;
      }
      return;
    }

    list.innerHTML = posts.map(function (post) {
      return '<article class="entry">' +
        '<div class="entry-head">' +
          '<span class="entry-date">' + esc(dateLabel(post.date)) + "</span>" +
          '<h2 class="entry-title"><a href="' + postUrl(post.id) + '">' +
            esc(post.title) + "</a></h2>" +
          (isDraft(post) ? '<span class="draft-badge">本地</span>' : "") +
        "</div>" +
        '<p class="entry-meta">作者：Brian · 约 ' + readingTime(post.body) + " 分钟" +
          (post.tags.length ? " · 标签：" + tagLinks(post.tags) : "") + "</p>" +
        '<p class="entry-excerpt">' + esc(post.excerpt) + "</p>" +
        '<a class="entry-more" href="' + postUrl(post.id) + '">阅读全文 »</a>' +
      "</article>";
    }).join("");
  }

  function renderPost() {
    var container = document.getElementById("postContent");
    if (!container) {
      return;
    }

    var id = queryParam("p");
    if (!id && window.location.hash) {
      id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    }

    var post = getPost(id);

    if (!post) {
      container.innerHTML = '<div class="empty-note">文章不存在。' +
        '<a href="blog.html">返回博客 »</a></div>';
      var emptyNav = document.getElementById("postNav");
      if (emptyNav) {
        emptyNav.innerHTML = "";
      }
      return;
    }

    document.title = post.title + " — Brian's Workshop";

    var crumb = document.getElementById("postCrumb");
    if (crumb) {
      crumb.textContent = dateLabel(post.date);
    }

    container.innerHTML =
      '<div class="post-head">' +
        '<span class="post-date">' + esc(dateLabel(post.date)) + "</span>" +
        (isDraft(post) ? ' <span class="draft-badge">本地</span>' : "") +
        '<h1 class="post-title">' + esc(post.title) + "</h1>" +
        '<p class="post-meta">作者：Brian · 约 ' + readingTime(post.body) + " 分钟" +
          (post.tags.length ? " · 标签：" + tagLinks(post.tags) : "") +
        "</p>" +
      "</div>" +
      '<div class="post-body">' + renderMarkdown(post.body) + "</div>";

    var edit = document.getElementById("editLink");
    if (edit) {
      edit.href = "write.html?p=" + encodeURIComponent(post.id);
    }

    var nav = document.getElementById("postNav");
    if (nav) {
      var all = getAll();
      var index = -1;

      for (var i = 0; i < all.length; i++) {
        if (all[i].id === post.id) {
          index = i;
          break;
        }
      }

      var newer = index > 0 ? all[index - 1] : null;
      var older = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
      var html = "";

      if (newer) {
        html += '<a href="' + postUrl(newer.id) + '">« 更新：' + esc(newer.title) + "</a>";
      } else {
        html += '<a href="blog.html">« 返回博客</a>';
      }

      html += '<span class="spacer"></span>';

      if (older) {
        html += '<a href="' + postUrl(older.id) + '">更早：' + esc(older.title) + " »</a>";
      }

      nav.innerHTML = html;
    }
  }

  function renderRails() {
    var archiveBox = document.getElementById("archiveList");
    if (archiveBox) {
      var months = archive();
      archiveBox.innerHTML = months.length ? months.map(function (item) {
        return '<li><a href="' + monthUrl(item.month) + '">' +
          esc(item.month.replace("-", ".")) + '</a><span class="count">' +
          item.count + "</span></li>";
      }).join("") : '<li class="muted">暂无文章。</li>';
    }

    var cloud = document.getElementById("tagCloud");
    if (cloud) {
      var tags = tagCounts();
      cloud.innerHTML = tags.length ? tags.map(function (item) {
        return '<a class="tag" href="' + tagUrl(item.tag) + '">' +
          esc(item.tag) + " (" + item.count + ")</a>";
      }).join(" ") : '<span class="muted">暂无标签。</span>';
    }
  }

  /* ------------------------------------------------------------------ *
   *  Boot
   * ------------------------------------------------------------------ */

  window.BWBlog = {
    getAll: getAll,
    getPost: getPost,
    readLocal: readLocal,
    writeLocal: writeLocal,
    upsertLocal: upsertLocal,
    removeLocal: removeLocal,
    markPublished: markPublished,
    serialize: serialize,
    cleanPost: cleanPost,
    renderMarkdown: renderMarkdown,
    normalize: normalize,
    dateLabel: dateLabel,
    readingTime: readingTime,
    makeExcerpt: makeExcerpt,
    plainText: plainText,
    esc: esc,
    postUrl: postUrl,
    tagUrl: tagUrl,
    monthUrl: monthUrl,
    isDraft: isDraft,
    archive: archive,
    tagCounts: tagCounts
  };

  function boot() {
    renderLatest();
    renderBlog();
    renderPost();
    renderRails();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window, document);
