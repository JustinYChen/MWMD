# "慢"问"慢"答 · Slow Ask Slow Answer · 情侣问题抽卡

一款面向情侣的塔罗牌阵式 3D 问题抽卡网站,莫兰迪裸色简约甜蜜美学。悬停、翻牌、揭示,让每一次提问都成为靠近彼此的仪式。

**在线访问**:https://justinychen.github.io/MWMD/

## 特性

### 核心体验
- **塔罗牌阵式 3D 抽卡**:基于 react-three-fiber,牌面朝下铺开,悬停抬起,点击翻牌揭示问题,翻开后再次点击可查看详情弹窗
- **多模式牌阵**:单抽 / 三张叙事(过去-现在-未来)/ 五张十字阵
- **中英双语题库**:默认 147 题,3 深度(破冰/升温/灵魂)× 6 类别(回忆/未来/浪漫/价值观/成长/趣味),中文为主英文辅助
- **抽前筛选**:按深度、类别、亲密度上限过滤牌堆
- **防重复 + 手动重置**:抽过的进历史默认不重复,可手动重置牌堆

### 数据持久化
- **收藏夹 + 历史记录**:localStorage 永久保存(除非手动清空),历史按日期分组并支持分页
- **情侣名字 + 纪念日**:个性化问候,纪念日/里程碑天数(100/520/1314)彩蛋
- **题库编辑**:可在网页内管理题库(新增/删除),默认题库不可删除;新增问题自动翻译、分级、分类

### 视觉与交互
- **深浅主题切换**:莫兰迪裸色 + 玫红/金点缀
- **自定义组件**:CustomSelect(替代原生 select)、DatePicker(替代原生 date input),风格统一
- **自定义光标**:始终悬浮于所有元素之上(z-index: 9999)
- **程序化音效**:Web Audio API 合成翻牌、悬停、揭示、收藏音效(无外部音频文件依赖)
- **丰富动效**:Framer Motion(路由转场、stagger、hover)+ GSAP(英雄区入场、useGSAP)+ Lenis 平滑滚动
- **抽卡动效**:粒子星河(hover 触发)、金粉洒落(翻牌)、光芒绽放(揭示页)、文字逐字浮现、收藏爆炸心形
- **响应式 + 可访问性**:移动端适配、键盘导航、prefers-reduced-motion 降级

## 技术栈

- **框架**:React 18 + Vite 6 + TypeScript
- **样式**:Tailwind CSS 3.4(莫兰迪色板 + CSS 变量主题)+ glassmorphism 毛玻璃
- **动画**:Framer Motion + GSAP + @gsap/react + Lenis(平滑滚动)
- **3D**:@react-three/fiber + @react-three/drei + three(3D 牌阵与翻牌)
- **状态**:zustand + persist(localStorage 持久化,含迁移函数)
- **路由**:react-router-dom 6(hash 路由,兼容 GitHub Pages)
- **其他**:lucide-react(图标)、dayjs(纪念日计算)、clsx + tailwind-merge(类名合并)

## 本地开发

```bash
cd couple-cards
npm install
npm run dev
```

打开 http://localhost:5173/

## 构建

```bash
npm run build      # 产物在 dist/
npm run preview    # 本地预览构建产物
```

## 项目结构

```
couple-cards/
├── .github/workflows/deploy.yml   # GitHub Actions 自动部署配置
├── public/
│   ├── audio/                     # 背景音乐(playlist.json 列出曲目,flac 已 gitignore)
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── scene3d/               # 3D 场景
│   │   │   ├── TarotCanvas.tsx    #   Canvas 容器,串联 onReveal/onDetail
│   │   │   ├── TarotCard.tsx      #   单张 3D 卡片:翻牌 + 查看详情回调
│   │   │   ├── CardSpread.tsx     #   牌阵布局(单抽/三张/十字)
│   │   │   ├── CameraRig.tsx      #   相机运镜
│   │   │   ├── SceneLighting.tsx  #   场景灯光
│   │   │   └── FloatingParticles.tsx  # 漂浮粒子背景
│   │   ├── draw/                  # 抽卡流程
│   │   │   ├── DrawModeSelector.tsx   # 模式选择
│   │   │   ├── FilterPanel.tsx        # 筛选器(深度/类别/亲密度)
│   │   │   ├── DrawButton.tsx         # 抽牌按钮(含粒子星河动效)
│   │   │   ├── DeckResetButton.tsx    # 重置牌堆
│   │   │   ├── CardRevealOverlay.tsx  # 揭示层(含光芒绽放/逐字/心形爆炸动效)
│   │   │   ├── CardDetailModal.tsx    # 单卡详情弹窗(3D 卡片二次点击触发)
│   │   │   └── SparkleFall.tsx        # 金粉洒落动效
│   │   ├── card/                  # 2D 卡片
│   │   │   ├── QuestionCard2D.tsx
│   │   │   └── CardTag.tsx        #   深度/类别标签
│   │   ├── bank/                  # 题库管理
│   │   │   └── QuestionEditorModal.tsx  # 问题新增/编辑弹窗(含自动翻译/分级)
│   │   ├── profile/               # 个性化
│   │   │   ├── CoupleSetupModal.tsx    # 情侣信息设置(名字/纪念日)
│   │   │   ├── GreetingHeader.tsx      # 问候 + 在一起天数
│   │   │   └── AnniversaryEasterEgg.tsx # 纪念日彩蛋
│   │   ├── layout/                # 布局
│   │   │   ├── Navbar.tsx             # 顶部导航(glassmorphism)
│   │   │   ├── Footer.tsx
│   │   │   ├── TopControls.tsx        # 主题/音乐/情侣设置
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── PageTransition.tsx     # 路由转场(柔光叠化)
│   │   │   └── TransitionVeil.tsx
│   │   ├── audio/
│   │   │   └── AudioToggle.tsx        # 背景音乐开关
│   │   └── ui/                    # 通用组件
│   │       ├── CustomSelect.tsx       # 自定义下拉框(替代原生 select)
│   │       ├── DatePicker.tsx         # 自定义日期选择器(替代原生 date)
│   │       ├── CustomCursor.tsx       # 自定义光标(z-index: 9999)
│   │       ├── Modal.tsx
│   │       ├── MagneticButton.tsx     # 磁吸按钮
│   │       ├── SmoothScroll.tsx       # Lenis 封装
│   │       ├── StaggerReveal.tsx      # 错峰入场
│   │       └── ErrorBoundary.tsx      # 3D 错误降级
│   ├── pages/                     # 6 个页面
│   │   ├── HomePage.tsx           #   首页(英雄区 + 入口)
│   │   ├── DrawPage.tsx           #   抽卡页(3D 舞台 + 控制面板 + 揭示层)
│   │   ├── FavoritesPage.tsx      #   收藏夹
│   │   ├── HistoryPage.tsx        #   历史记录(按日期分组 + 分页)
│   │   ├── QuestionBankPage.tsx   #   题库管理(分页 + 编辑)
│   │   └── SettingsPage.tsx       #   设置(情侣信息/主题/声音)
│   ├── store/                     # 6 个 zustand store(均 persist 到 localStorage)
│   │   ├── useDrawEngine.ts       #   (hook) 抽牌引擎
│   │   ├── useSettingsStore.ts    #   主题/语言/声音
│   │   ├── useProfileStore.ts     #   情侣名字/纪念日
│   │   ├── useDeckStore.ts        #   牌堆(已抽 id 集合)
│   │   ├── useFavoritesStore.ts   #   收藏夹
│   │   ├── useHistoryStore.ts     #   历史记录
│   │   └── useQuestionBankStore.ts #  自定义题库
│   ├── three/                     # 3D 工具
│   │   ├── textures.ts            #   CanvasTexture 程序化生成牌面/牌背
│   │   ├── layouts.ts             #   牌阵坐标 + SPREAD_LABELS 位置标签
│   │   └── animations.ts          #   翻牌/悬停动画插值
│   ├── data/
│   │   ├── questions.json         #   默认题库(147 题)
│   │   ├── levels.ts              #   深度定义(破冰/升温/灵魂 + 颜色)
│   │   ├── categories.ts          #   类别定义(6 类)
│   │   └── quotes.ts              #   首页引言
│   ├── hooks/
│   │   ├── useDrawEngine.ts       #   抽牌状态机(idle/spreading/flipping/revealed)
│   │   └── useAnniversary.ts      #   纪念日/里程碑计算
│   ├── lib/
│   │   ├── audioEngine.ts         #   Web Audio 程序化音效合成
│   │   ├── shuffle.ts             #   洗牌 + ALL_QUESTIONS 导出
│   │   ├── date.ts                #   在一起天数/纪念日计算
│   │   ├── i18n.ts                #   问候语多语言
│   │   ├── questionClassifier.ts  #   问题自动分级/分类(题库编辑用)
│   │   ├── translator.ts          #   问题自动翻译(题库编辑用)
│   │   └── utils.ts               #   cn() 类名合并
│   ├── styles/
│   │   ├── themes.css             #   莫兰迪色板 + CSS 变量(深/浅主题)
│   │   └── animations.css         #   全局动画关键帧
│   ├── types/                     # TypeScript 类型(deck/profile/question)
│   ├── router/index.tsx           # 路由配置(hash 路由)
│   ├── App.tsx                    # 根组件(路由 + 转场 + 全局组件)
│   ├── main.tsx                   # 入口
│   └── index.css                  # Tailwind + 全局样式(含 date input 样式修正)
├── vite.config.ts                 # base 路径 '/MWMD/' + 手动分包(three/motion)
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 部署到 GitHub Pages

本项目通过 GitHub Actions 自动部署到 `https://justinychen.github.io/MWMD/`。

### 配置说明

- **仓库**:`JustinYChen/MWMD`
- **Workflow**:仓库根目录 `.github/workflows/deploy.yml`(注意:GitHub Actions 只识别仓库根目录的 workflow)
- **base 路径**:`couple-cards/vite.config.ts` 中 `base: command === 'build' ? '/MWMD/' : '/'`
- **Pages 设置**:Settings → Pages → Source 选择 **GitHub Actions**

### 更新部署

代码改动后,推送到 MWMD 仓库 main 分支即自动构建部署:

```bash
# 本地 main 分支为完整历史(含大文件),MWMD 用独立 orphan 分支(无大文件)
git checkout mwmd-deploy
# 同步最新改动到该分支(注意排除 .flac 等大文件)
git add -A && git commit -m "update"
git push mwmd mwmd-deploy:main
```

### 大文件说明

`public/audio/` 下的 flac 文件超过 GitHub 100MB 限制,已加入 `.gitignore`。部署版本不含背景音乐,但程序化音效正常工作,且 `playlist.json` 为空时会降级为 ambient pad 氛围音。如需恢复 BGM,建议压缩为 mp3 或用外部链接托管。

## 背景音乐(随机播放你的浪漫 jazz)

音效为程序化合成,无需任何音频文件。背景音乐支持放入自己的音乐并随机连播:

1. 把音乐文件放进 `public/audio/`(支持 mp3 / flac / wav / aac / m4a / ogg / opus 等浏览器可解码格式)
2. 编辑 `public/audio/playlist.json`,在 `tracks` 数组里列出文件名:
   ```json
   {
     "tracks": ["track01.mp3", "track02.flac", "track03.wav"]
   }
   ```
3. 在页面右上角点击音乐图标开启,随机播放 + 自动连播,可点「下一首」跳曲

**无曲目时**:若 `playlist.json` 为空或加载失败,会降级为程序化合成的 ambient pad 氛围音,不会报错。

## 工程约定

- 所有用户数据(抽过的牌、收藏、历史)持久化到 localStorage,不主动重置
- 自定义光标 `z-index: 9999`,始终悬浮于所有元素之上
- 页面转场使用单一「柔光叠化」动画,避免双重渲染
- Modal/overlay 退出动画期间设 `pointer-events: none`,避免透明区域拦截 3D 卡片点击
- 3D 卡片交互(翻牌、查看详情)优先级高于 UI 元素
- 缺失资源(如 bgm.mp3)需优雅降级,不可报错
- `.glass` 毛玻璃组件会创建新的堆叠上下文,内部 z-index 不跨组件生效

## 许可

代码 MIT,题库原创。
