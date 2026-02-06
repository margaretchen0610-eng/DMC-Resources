# HKBU DMC 资源库

一个简约、直观的数据新闻社区平台，集成了活动管理、选题跟踪、知识共享和数据源导航功能。

## 功能特性

### 1. 欢迎封面页
- 🎨 全屏背景展示团队合照
- 🎈 浮动气球动画展示团队成员照片
- 🎯 清晰的导航入口
- ✨ 优雅的动画效果

### 2. 日历/选题管理
#### 📅 活动日历
- 直观的月份视图，清晰展示所有活动
- ➕ 点击任意日期即可快速添加活动
- ✏️ 支持编辑和删除已有活动
- 🏷️ **活动分类**：
  - 学校活动（蓝色）
  - 数据报告（黄色）
  - 重大事件（红色）
  - 社会热点（紫色）
- 🔔 今日活动侧边栏实时显示
- 🎨 不同分类用不同颜色的指示点区分

#### 📝 选题管理
- **Spot News** 和 **Feature Story** 分类管理
- 记录选题描述、负责记者、状态跟踪
- 状态选项：准备中、1st/2nd/3rd Editorial、待审核、已完成
- 已完成选题单独展示，便于回顾
- 文件夹标签式设计，清晰直观

### 3. 教程库（社区共享资源）
- 📚 上传和分享数据新闻技能教程
- 🏷️ **资源分类**：
  - 数据可视化
  - 网页搭建
  - 数据分析
  - 其他
- 🔍 按分类筛选和实时搜索
- ❤️ 点赞和收藏功能
- 👥 显示作者信息

### 4. 资源共享（数据源导航）
- 📊 **优质数据资源库**：整理公开、高质量的数据集
  - 政府开放数据
  - 国际组织数据
  - 社区数据集
- 🛠️ **实用工具与网页**：推荐数据新闻常用工具
  - 可视化工具
  - 网站托管服务
  - 学习参考资源

## 设计理念

- **简约美学**：干净的界面设计，避免冗余元素
- **直接互动**：清晰的视觉引导和即时操作反馈
- **流畅体验**：响应式设计，适配各种设备
- **视觉增强**：渐变背景、柔和阴影、流畅动画，提升用户体验

## 使用方法

### 基础设置

1. **添加团队合照**（欢迎页背景）
   - 将团队合照命名为 `team_photo.jpg`
   - 放置在 `images/` 目录下

2. **添加浮动气球照片**（首页动画）
   - 将照片命名为 `balloon1.jpg`, `balloon2.jpg`, `balloon3.jpg` 等
   - 放置在 `images/balloon_images/` 目录下
   - 在 `scripts/floating-balloons.js` 中配置文件名
   - 详细说明见 `images/balloon_images/README.md`

3. **启动网站**
   - 直接在浏览器中打开 `index.html` 即可使用

### 数据存储方式（二选一）

- **不配 Supabase**：数据只存在本机 localStorage，仅当前浏览器可见，适合本地 demo。
- **配置 Supabase**：浏览者添加的内容会写入云端，所有人共享。  
  详细步骤见 **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**：建项目、跑 `supabase-schema.sql`、在 `scripts/supabase.js` 里填好 Project URL 和 anon key 即可。

## 文件结构

```
DMC_Resources/
├── index.html              # 欢迎封面页
├── calendar.html           # 日历/选题管理
├── resources.html          # 教程库（资源分享）
├── datasources.html        # 资源共享（数据源导航）
├── images/
│   ├── team_photo.jpg      # 团队合照（需自行添加）
│   ├── balloon_images/     # 浮动气球照片文件夹
│   │   ├── balloon1.jpg
│   │   ├── balloon2.jpg
│   │   └── ...
│   └── README.md           # 图片说明
├── styles/
│   ├── main.css            # 主样式文件（包含所有页面样式）
│   └── floating-balloons.css  # 浮动气球动画样式
└── scripts/
    ├── main.js             # 主初始化脚本
    ├── supabase.js         # Supabase 配置（需填 URL 与 anon key）
    ├── calendar.js         # 日历功能模块
    ├── topics.js           # 选题管理模块
    ├── events.js           # 活动管理模块
    ├── resources.js        # 资源库管理模块
    ├── datasources.js      # 数据源导航模块
    └── floating-balloons.js # 浮动气球动画脚本
```

## 页面导航

- **首页** (`index.html`) - 欢迎封面页，网站入口
- **日历/选题** (`calendar.html`) - 活动日历与选题管理
- **教程库** (`resources.html`) - 社区资源分享
- **资源共享** (`datasources.html`) - 数据资源和工具导航

## 技术栈

- 纯 HTML/CSS/JavaScript（无框架依赖）
- 数据存储：**LocalStorage**（默认）或 **Supabase**（可选，需自行配置）
- 响应式设计
- 模块化代码结构
- CSS3 动画和渐变效果

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge）

## 注意事项

- 欢迎页面需要 `images/team_photo.jpg` 图片文件
- 浮动气球需要在 `images/balloon_images/` 目录下添加照片并配置
- 如果图片不存在，页面仍可正常显示
- 未配置 Supabase 时，数据只保存在浏览器本地，清除浏览器数据会丢失所有内容
- 配置 Supabase 后，数据会同步到云端，多端共享

## 特色功能说明

### 浮动气球动画
- 首页会展示配置的所有团队成员照片
- 照片以圆形气球形式浮动
- 气球会随机大小、位置、速度飘动
- 气球之间会碰撞反弹，营造活泼氛围

### 选题管理系统
- 支持 Spot News 和 Feature Story 两种类型
- 每个选题可记录描述、记者、状态
- 状态可通过下拉菜单快速更新
- 已完成选题自动归档，保持界面整洁
- 点击选题可查看详情和编辑
