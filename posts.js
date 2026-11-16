/* ==========================================================================
   BRIAN'S WORKSHOP — weblog posts
   --------------------------------------------------------------------------
   Edit this file by hand, or use write.html to compose an entry and export a
   fresh copy of this file.

   Each post:
     id      unique link name (a-z, 0-9, hyphens)
     title   entry title
     date    YYYY-MM-DD
     tags    array of short tags
     excerpt one or two lines for the index page
     body    simple Markdown (see write.html for the cheat sheet)

   The three entries below are examples — rewrite or delete them.
   ========================================================================== */

window.BLOG_POSTS = [
  {
    id: "welcome-to-the-workshop",
    title: "欢迎来到这个工作台",
    date: "2026-11-12",
    tags: ["站点", "杂项"],
    excerpt: "一个新的（其实很旧的）样子，以及一个放短笔记的地方。",
    body: "网站换了一层新漆——更准确地说，是一层旧漆。灰色网格、海军蓝边框、Times New Roman，还有一个多半在说谎的访客计数器。我想让它像 1997 年某个 GeoCities 街区里能翻到的个人主页，而不是又一个带汉堡菜单的干净作品集。\n\n原来的四个页面还在：Home、About、Project、Help。文字和图片都没变，只是家具挪了位置。\n\n新的部分是这篇博客。它用来放那些不值得单独开一页的笔记：一次差点成功的维修、一个被我弄坏的轴、一张反复播放的唱片、一杯调得很糟的酒。短篇、有日期、没有算法。\n\n一切仍然是手写的 HTML 和 CSS。如果你正在用 Netscape Navigator 3.0 读到这里，你好。这个网站就是为你做的。"
  },
  {
    id: "cherry-mx90-scorecard",
    title: "Cherry Mx9.0：哪些成了，哪些没成",
    date: "2026-10-27",
    tags: ["键盘", "维修"],
    excerpt: "这把键盘只差一个零件就能工作。那个零件不存在。",
    body: "Cherry Mx9.0 送来时是坏的，离开工作台时还是坏的——但坏得更有意思了。下面是一份诚实的成绩单。\n\n## 成了的\n\n- **重喷外壳。** 紫色不是原厂色，但现在是我的了。\n- **换轴。** 这是让键盘重新有“新键盘感”的关键。\n- **换子板。** 零件装上了，排线坐稳了，螺丝也回去了。\n\n## 没成的\n\n子板还是不工作，而且没有可替换的零件。整件事一句话就能说完：这把键盘只差一个零件，而那个零件不存在。\n\n## 下次会怎么做\n\n我会在喷漆之前先测子板。把一个坏东西弄好看很容易；让它真正工作更难。下次先拿万用表。\n\n完整的前后对比在 About 页的小软盘后面。"
  },
  {
    id: "why-the-floppy",
    title: "为什么是软盘？",
    date: "2026-09-30",
    tags: ["设计", "怀旧"],
    excerpt: "小、慢、容易丢，却仍然可读：软盘为什么留了下来。",
    body: "首页右侧的第一样东西是一张 1.44 MB 的软盘。它不是下载按钮，也不存任何东西。它通向 About 页。\n\n我留着它，是因为它能做 logo 做不到的事：在你读一个字之前，就告诉你这是什么网站——小、手工、有点过时，而且对此很高兴。\n\n软盘也是个人主页最诚实的图标。它很小，很慢，很容易丢；但如果你好好保管，它仍然能读出来。\n\n标签上写着 Simon Workshop。那是 About 页上的三个名字之一。点一下软盘，你就会到那里。"
  }
];
