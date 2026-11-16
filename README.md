# Brian's Workshop — 1997 风格个人主页

这是一次只改“板式”的改版：`home / about / project / help` 四个页面的**文字和图片全部保留**（包括图片的 `alt` 和原来的链接），只重写了布局、配色、导航和页脚。新增了 90 年代风格的 **Weblog（博客）**、不用服务器就能写文章并导出 `posts.js` 的**写作台**，以及一个“正在开发中”的 **Music Box（音乐盒）**。

## 文件结构

```
brians-workshop/
├── index.html          # 部署到 GitHub Pages 时的入口，自动跳转到 home.html
├── home.html           # 首页
├── 404.html            # 自定义 404：软盘丢了
├── about.html          # 关于 + 记忆翻牌 + Links/徽章墙
├── project.html        # Cherry Mx9.0 修复项目（只从 About 的软盘进入）
├── help.html           # 我能帮什么忙 + EXPERIMENT 13
├── help.js             # HELP 页 13 级引诱点击 / 血迹崩坏 / 最终黑屏
├── blog.html           # 博客列表（支持 ?tag= / ?month= 过滤）
├── post.html           # 单篇文章，用 ?p=文章id 打开
├── write.html          # 本机写作台（写文章 / 预览 / 导出）
├── music.html          # 音乐盒 / 我的歌单
├── music.js            # 播放器 + LRC 歌词
├── music/              # 10 首 mp3 + 对应 lrc
├── roulette.html       # 恶魔轮盘赌（单页小游戏）
├── roulette.js         # 轮盘赌逻辑（从 Brian index 搬来并适配）
├── links.js            # About 页 “Link to me” 复制按钮
├── tape-00.html        # TAPE 00 密码页（轮盘赌侧栏隐藏入口）
├── tape-00.css         # TAPE 00 的卡带样式
├── tape-00.js          # Argon2id + AES-GCM 密文/解密（无明文、无密码）
├── argon2-bundled.min.js       # argon2-browser（MIT），自包含 Argon2id WASM
├── argon2-browser.LICENSE.txt  # 上面这个库的许可证
├── style.css           # 全部样式（手写，无框架、无外链字体）
├── posts.js            # 博客文章数据（可手改，也可以由写作台导出）
├── blog.js             # 博客渲染 + 简易 Markdown
├── write.js            # 写作台逻辑
├── site.js             # 计数器 / 开站天数 / 随机网站 / 字号
└── assets/             # 原图 + floppy-trim + 咖啡素材 + wine/perfume logo + badge + 眼睛/HELP ME/血迹彩蛋图
```

- 博客列表、单篇文章和写作台的主体界面已中文化，示例文章也翻成中文；全站共用的导航和页脚仍保留英文。

两个小改动：

- 首页软盘改用 `assets/floppy-trim.png`：从原 `floppy.png` 裁掉四周白边，原图仍在。文字、alt 和链接未变。
- 字号控制：侧栏 `TEXT SIZE` 的 A−/A+，首页桌面版在软盘右侧的竖条里；100% / 115% / 130%，选择会记在本机。
- 酒谱 logo：`assets/wine-logo.svg`；香谱 logo：`assets/perfume-logo.webp`。两个都用于左侧 “MY OTHER SITES” 图标、About 的 Links 卡片和 Blackstar tilewall，外面加了配套的金色细框。

广告和捐款区都在每个页面里：

- 页底 468×60 的 “THE MAP ROOM” 是站内广告，改 `ad-468` 的链接和文字即可。
- 左侧 “YOUR AD HERE / CHEAP!” 是 120×60 的招租广告。
- `SUPPORT THIS SITE` 里的二维码和咖啡杯来自 `assets/coffee-qr.png`、`assets/coffee-cup.png`，直接换图就能换成你的收款码。
- 侧栏的 “BUY ME A COFFEE”、页脚的赞助行和 `SUPPORT` 链接会跳到 `#support`。
- “THE TINKERER'S WEBRING” 的 random 会在几个地图站之间随机跳转。

原始文件备份在上一级目录的 `_backup-original/` 里，随时可以对照或回滚。

## 怎么查看

- 直接双击 `home.html` 就能看。记忆翻牌、博客、写作台都能用；计数器在 `file://` 下会变成“本机访问次数”，这是正常降级。
- 想让计数器走线上服务、也方便测试本地存储，可以在该目录运行：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/`。

## 怎么发一篇博客

1. 打开 `blog.html`，点 **WRITE AN ENTRY**，或直接打开 `write.html`。
2. 写标题、日期、标签、摘要和正文。正文支持很简单的 Markdown：
   `**加粗**`、`*斜体*`、`` `代码` ``、`## 小标题`、`- 列表`、`[链接](url)`、`> 引用`。
3. 点 **Save to this browser**。这时文章只存在这台电脑的浏览器里，列表里会有红色 `LOCAL` 徽标。
4. 点 **Export posts.js**，下载新的 `posts.js`。
5. 用它替换网站文件夹里的 `posts.js`，再把整个文件夹上传到你的托管（GitHub Pages 等）。这一步才是真正的“发布”。

> 注意：导出会覆盖 `posts.js` 里所有文章。第一次操作前建议把原文件复制一份。导出的文件里已经包含原有的示例文章和你的新文章。

## 音乐盒 / Music Box

- 入口是 `music.html`，导航、侧栏和页脚都已加入口。
- 歌单 **10 首全部接入**：Catch the Rainbow、Just the Two of Us、Despacito、Killer Queen、Back in Black、Johnny B. Goode、21 Guns、Free Bird、Come as You Are、Let It Be。音频和歌词都在 `music/`。
- 播放器支持在歌单里直接切歌。歌词现在在播放器内部做三行滚动字幕，右侧单独的歌词栏已经去掉；歌词同时内嵌在 `music.html` 里作为 `file://` 回退，用本地服务器打开时会优先读取对应的 `.lrc`。
- 加新歌：把 mp3/lrc 放进 `music/`，在 `music.html` 的歌单行加 `data-track` 和 PLAY 按钮，再在 `music.js` 的 `TRACKS` 数组里加一项。

## 友情链接、徽章墙、YOUR SYSTEM

- 原来的 Links 页已合并进 `about.html#links`：7 个站点卡片、8 个 88×31 按钮、可复制的 “Link to me” 代码都在 About 页里；单独的 `links.html` 已删除，About 页顶部有 **Links** 按钮直接跳过去。
- 按钮墙里的本站徽章是 `assets/badge-brian.svg`；复制代码里的 URL 默认写成 `BZHU404.github.io/brians-workshop/`，部署到别处时改掉即可。复制按钮逻辑在 `links.js`。
- 首页侧栏的 `YOUR SYSTEM` 盒子会显示浏览器、屏幕尺寸、色深和本机时钟；纯前端，不上传。
- 首页侧栏有 4 个迷你徽章，About 页的按钮墙是完整一排；`COOL SITE OF THE DAY` 是纯装饰。
- `project.html` 现在只保留 About 的 Simon Workshop 樱桃软盘入口；导航、侧栏、页脚、首页按钮、Help/Blog 里的 project 链接都已移除。

## TAPE 00 / 私密页

- 轮盘赌右侧那句 **“Luck is not a strategy.”** 是隐藏入口：颜色、字体和旁边一致，只加粗、无下划线；链接到 `tape-00.html`。中文切换后同一位置仍是链接。
- 没有单独的示爱 HTML。`tape-00.html` 只是密码界面；`tape-00.js` 里只有 AES-GCM 密文，没有明文、密码或 SHA256 哈希。输对密码后在同一页展开内容，不会跳到另一个能被直接打开的页面。
- 密码不存储；用 **Argon2id（64 MiB / 3 passes / 1 lane，随机盐）** 派生 256-bit 密钥，再用 **AES-GCM-256** 解密。Argon2id 走本地 `argon2-bundled.min.js`（argon2-browser，MIT，WASM 内嵌，不需要 CDN）。输错统一显示 `ACCESS DENIED`，并做 1.2 秒冷却；页面 `noindex, nofollow, noarchive`，入口 `rel="nofollow"`，没有导航。
- 必须说实话：纯静态站的密文可以被下载，理论上仍然能离线爆破；Argon2id 的 64 MiB 内存成本让每次猜测都很贵，但不能保证“绝对无法破解”。要绝对防护只能用服务端/Cloudflare Access，或不要把内容放在公开仓库。
- 改密码或那句话需要重新加密，不要直接改 `tape-00.js` 里的密文。

## HELP / EXPERIMENT 13

- `help.html` 右下角是一个看起来正常的帮助小盒子：**NEED A HAND? / CLICK FOR HELP**。点第一次后它会变成 `THANK YOU / CLICK AGAIN`，之后继续用 `CONTINUE`、`ONE MORE`、`KEEP CLICKING` 引诱点击。
- 前两级只是发暗、按钮变红和轻微失真；从第 3 级开始，血溅和血滴从页面边缘渗进来。越往后血越多、标题变红、各区块开始错位旋转；到第 9 级左右整个 `layout` 断成单列，侧栏、内容、页脚像坏掉一样堆在一起。
- **第一次按下就把页面内所有超链接锁死**（保留文字，移除 `href`）。之后点击任意锁住的链接，或再按一次那个按钮，只会触发 `Don't Leave Me` jumpscare，不推进、也不计入 13 级。
- 第 **4 / 6 / 8 / 10 / 12** 次会触发短促 jumpscare：第 4/8 次是 `TheCreepyEye`，第 6 次是 `goth-eye` 的 `HELLO?`，第 10 次两者叠加 `HELP ME`，第 12 次是 `HELP ME` 文字；都伴随页面猛抖、浏览器标题短暂改写，以及一小段 Web Audio 噪声/低频冲击。
- 最终画面下方有 `REBOOT` 可以恢复，刷新页面也会重置；崩坏状态只存在当前页面内存里，不写 localStorage。
- 图片使用 `assets/blood-cluster-cutout.png`（血溅）、`assets/blood-drips.png`（血滴）、`assets/the-creepy-eye.webp`、`assets/goth-eye.webp`；最终眼睛仍是 `assets/eyes-cutout.png`，`HELP ME` 是 `assets/help-me-cutout.png`。原图也保留在 `assets/`。

## 404 / 软盘丢了

- `404.html` 是 GitHub Pages 的自定义 404；不放进导航，带 `noindex`。
- 页面是一张空白软盘 + “This page is not on the disk.”；显示请求路径，列出 Home / About / Weblog / Music / Game / Help 的找回入口。
- GitHub Pages 会把 404 内容显示在缺失路径下，所以页面用一个小 `<base>` 把相对资源和链接钉在 `/brians-workshop/404.html`，避免从子目录访问时 CSS/图片全部 404；`file://` 下不启用 base，直接打开仍然正常。
- 下面保留常规广告和支持区块；没有新增其他入口。

## 恶魔轮盘赌 / Devil's Roulette

- 单页入口 `roulette.html`，导航、侧栏、页脚都加了 **Game**。
- 逻辑从 `Brian index/index.html` 搬过来：双方 3 点生命，轮流拿枪，可选择打自己或打对面。打自己空枪 +10 并继续，实弹 -1 并交给对方；打对面无论中不中，下一枪交给对方；实弹后重新装填。空枪后仍保留“继续/交枪”的房规。系统 AI 使用同一套目标规则。
- 隐藏计数器：连续 **6 次**由玩家选择“冲系统开枪”（空枪/实弹都算）会触发 `SIX` 事件；中间打自己或交枪会清零。事件不显示计数，触发后先闪 `goth-eye` 的 `HELLO?`，再进入血溅 + 眼睛 + `YOU SHOULDN'T HAVE DONE THAT.` / `It was never your turn.` / `you dance with the devil` / `you never dance again` 的全屏画面（不再有巨大的 `SIX` 字样），`WAKE UP` 重开一局。
- 系统 AI 已恢复原来的策略：按弹巢剩余和自身血量决定是否交枪，偶尔继续开或打玩家。
- 纯文字游戏，页面里保留“纯属虚构，现实勿模仿”的警告。
- 视觉上改成黑底绿字的小赌桌，带生命红心、弹巢灯和系统 AI 回合。
- 页面右上角有 **EN / 中文** 切换：按钮、规则、警告和所有游戏消息都会跟着换；选择存在 `bw_lang`，下次打开还是上次的语言。目前只作用于轮盘赌页，其他页面保持原样。

## PSYCHOLOGICAL LAYER（纯新增）

- 新增 `psych.css`、`psych.js`、`logs.html`，没有删改任何已有 CSS / JS / 事件；只在 home / about / 404 追加了 `link`、`script`，首页追加了一个隐藏 marker。
- 首页页脚新增 `SESSION 00:00:00 · INDEX: NORMAL`；切到别的标签时标题短暂变成 `仍在访问`，回来后 `你还在。` 两秒恢复。
- 第二次访问首页时页脚多一行 `上次访问未完成。`；只用了 localStorage 的访问次数，没有接第三方追踪，也没有真的存 IP。
- About 页滚动到 workshops 前会出现一行额外的小字 `This paragraph does not match the previous record.`，2.4 秒后消失；是新增行，不替换原文。每个 session 只出现一次。
- 404 顶部新增一条很小的 internal log：`RECORD CREATED / VISITOR: UNVERIFIED / 当前时间 / logs`；原来的 404 内容和错误记录表全部保留。
- `logs.html` 不在导航里，只能从 404 的 `logs` 进入；里面是本地伪造的访问记录，最后一条使用当前本地时间。页面上写明 `ADDRESS: NOT STORED`，不伪造真实 IP，也不泄漏任何网络信息。

## SEE THE TRUTH

- 首页页脚 `BEST VIEWED` 那一行末尾有一个很小的 **See the truth** 按钮。
- 点开后整页被隐藏，换成 **DEVIL'S RAVENSTONE**：浏览器标题、页面大标题、简介、导航、内容卡片和配色全部替换；眼睛使用 `TheCreepyEye.gif` 动图。
- 暗网版没有真正的超链接：五个导航项全部是锁死的按钮，点了只会在下面的状态栏回一句 `NO EXIT` 之类的话；唯一能离开的是页脚右下角很小的 **forget**（重新载入正常首页）。
- 不做 localStorage 持久化；刷新或点 `forget` 就回到正常主页。

## DEVIL SITE 徽章

- 侧栏 `THIS SITE` 和 About 按钮墙里的 **NO FRAMES** 已改成灰色的 **DEVIL SITE** 按钮。
- 第一次按下就会锁死整页：所有链接移除 `href`，按钮/输入框禁用，页面点击被拦截；原徽章隐藏，底部出现一只浮动的 **TheCreepyEye.gif** 动图眼睛。
- 之后每按一次眼睛，整页崩坏一级（`--corrupt` 2 → 4 → 6 → 8 → 10 → 12，第 5 次左右布局断成单列）；计数不显示。
- 第 6 次触发同款 jumpscare：`goth-eye.gif` 闪一下，接着血溅、眼睛和那四行字；`WAKE UP` 会完整恢复链接、按钮、徽章和页面状态。
- 触发逻辑在 `site.js`，首页、About、Help、404 等带这个徽章的页面都能触发；动图使用 `assets/TheCreepyEye.gif` / `assets/goth-eye.gif`。

## 直接手改文章

`posts.js` 的结构很直白：

```js
window.BLOG_POSTS = [
  {
    id: "my-entry",              // 链接名，只能用小写字母、数字、连字符
    title: "标题",
    date: "2026-11-12",          // YYYY-MM-DD
    tags: ["keyboard", "repair"],
    excerpt: "列表页显示的一两句话。",
    body: "正文。\n\n空行分段，简单 Markdown 即可。"
  }
];
```

改完保存、刷新 `blog.html` 就能看到。首页的 “Latest from the weblog” 会自动取最新三篇。

## 说明

- 字体全部使用系统自带的 Times New Roman / Courier New，无外部字体请求；页面离线也能正常显示。
- 计数器在线时使用 abacus.jasoncameron.dev（和 `Brian index` 同一个服务），离线或 `file://` 时自动降级为本机计数。
- 写作台没有后端：文章不会自动上传，也不会“发送”到别人的屏幕。要真正发布，必须替换并上传 `posts.js`。
- 如果以后想要在手机上直接点“发布”就上线，需要接一个后端或 GitHub API（需要 token），那是另一套方案。
