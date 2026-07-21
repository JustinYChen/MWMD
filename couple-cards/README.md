# 两心 · Two Hearts · 情侣问题抽卡

一款面向情侣的塔罗牌阵式 3D 问题抽卡网站，原创中英双语题库，莫兰迪裸色简约甜蜜美学。

## 特性

- **塔罗牌阵式 3D 抽卡**：基于 react-three-fiber，牌面朝下铺开，悬停抬起，点击翻牌揭示问题
- **多模式牌阵**：单抽 / 三张叙事（过去-现在-未来）/ 五张十字阵
- **原创中英双语题库**：147 题，3 深度（破冰/升温/灵魂）× 6 类别（回忆/未来/浪漫/价值观/成长/趣味），中文为主英文辅助
- **抽前筛选**：按深度、类别、亲密度上限过滤牌堆
- **防重复 + 手动重置**：抽过的进历史默认不重复，可手动重置牌堆
- **收藏夹 + 历史记录**：localStorage 持久化，历史按日期分组
- **情侣名字 + 纪念日**：个性化问候，纪念日/里程碑天数（100/520/1314）彩蛋
- **深浅主题切换**：莫兰迪裸色 + 玫红/金点缀
- **程序化音效**：Web Audio API 合成翻牌、悬停、揭示、收藏音效（无外部音频文件依赖）
- **丰富动效**：Framer Motion（路由转场、stagger、hover）+ GSAP（英雄区入场、useGSAP）+ Lenis 平滑滚动 + 自定义光标
- **响应式 + 可访问性**：移动端适配、键盘导航、prefers-reduced-motion 降级

## 技术栈

- React 18 + Vite 6 + TypeScript
- Tailwind CSS 3.4（莫兰迪色板 + CSS 变量主题）
- Framer Motion + GSAP + @gsap/react
- @react-three/fiber + @react-three/drei + three（3D 牌阵与翻牌）
- zustand + persist（状态管理与 localStorage 持久化）
- react-router-dom 6（hash 路由，兼容 GitHub Pages）
- Lenis（平滑滚动）
- lucide-react（图标）
- dayjs（纪念日计算）

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

## 部署到 GitHub Pages

本项目配置了 GitHub Actions 自动部署（`.github/workflows/deploy.yml`）。

### 步骤

1. 将 `couple-cards/` 目录内容推送到 GitHub 仓库（仓库名建议为 `couple-cards`）
2. 仓库 Settings → Pages → Source 选择 **GitHub Actions**
3. 推送到 `main` 分支即自动构建部署
4. 访问 `https://<你的用户名>.github.io/couple-cards/`

### base 路径

`vite.config.ts` 中 `base` 按仓库名配置：

```ts
base: command === 'build' ? '/couple-cards/' : '/'
```

若仓库名不同，请修改此处；若部署到 `user.github.io` 顶级仓库则改为 `'/'`。

## 项目结构

```
src/
├── components/
│   ├── scene3d/        # 3D 场景：TarotCanvas / TarotCard / CardSpread / 灯光 / 相机 / 粒子
│   ├── draw/           # 抽卡流程：模式选择 / 过滤器 / 抽牌按钮 / 揭示层 / 重置
│   ├── card/           # 2D 卡片：QuestionCard2D / 标签
│   ├── profile/        # 个性化：情侣信息弹窗 / 问候 / 纪念日彩蛋
│   ├── layout/         # 布局：导航 / 页脚 / 转场 / 主题切换 / 顶部控件
│   ├── audio/          # 音频开关
│   └── ui/             # 通用：磁吸按钮 / 模态 / 平滑滚动 / 自定义光标 / 错误边界
├── pages/              # 5 页：Home / Draw / Favorites / History / Settings
├── store/              # 5 个 zustand store
├── three/              # 3D 工具：CanvasTexture 生成 / 牌阵布局 / 动画插值
├── data/               # 题库 JSON / 级别 / 类别 / 引言
├── hooks/              # useDrawEngine / useAnniversary
├── lib/                # utils / shuffle / date / i18n / audioEngine
├── styles/             # themes.css / animations.css
└── types/              # TypeScript 类型定义
```

## 背景音乐（随机播放你的浪漫 jazz）

音效为程序化合成，无需任何音频文件。背景音乐支持你放入自己的音乐并随机连播：

1. 把音乐文件放进 `public/audio/`（支持 mp3 / flac / wav / aac / m4a / ogg / opus 等浏览器可解码格式）
2. 编辑 `public/audio/playlist.json`，在 `tracks` 数组里列出文件名：
   ```json
   {
     "tracks": ["track01.mp3", "track02.flac", "track03.wav"]
   }
   ```
3. 在页面右上角点击音乐图标开启，随机播放 + 自动连播，可点「下一首」跳曲

**关于 LDAC**：LDAC 是蓝牙传输编码而非文件格式，无法作为文件源。把高码率 flac 或 wav 作为源文件，蓝牙耳机/音箱在传输时会自动协商到 LDAC 等高码率编码。

**无曲目时**：若 `playlist.json` 为空或加载失败，会降级为程序化合成的 ambient pad 氛围音，不会报错。

## 题库说明

题库为完全原创编写，仅借鉴「深度分级 + 类别」的思路，不引用任何桌游（We're Not Really Strangers / Let's Get Deep / BestSelf Intimacy Deck / Better Together / Love Birds 等）原卡文字。

## 许可

代码 MIT，题库原创。
