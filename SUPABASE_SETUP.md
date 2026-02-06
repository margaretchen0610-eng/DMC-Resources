# Supabase 配置说明

本项目的「大事一览」「教程库」「资源共享」已支持用 Supabase 做云端存储。下面先总结**你需要在 Supabase 进行的更改**，再给出**分步教程**。

---

## 一、需要在 Supabase 进行的更改总结

### 1. 涉及的表与用途

| 表名 | 用途 | 对应页面/功能 |
|------|------|----------------|
| `calendar_events` | 日历活动 | 大事一览 - 活动/讲座/工作坊等 |
| `topics` | 选题 | 大事一览 - 下方「现有选题」（Spot News / Feature Story） |
| `resources` | 教程帖子 | 教程库 |
| `datasets` | 数据源 | 资源共享 - 优质数据资源库 |
| `tools` | 工具 | 资源共享 - 实用工具与网页 |
| `campus_resources` | 校内资源 | 资源共享 - 校内资源（置顶） |

### 2. 你需要做的两件事

1. **建表 + 开 RLS + 建策略**  
   在 Supabase 的 **SQL Editor** 里执行建表与权限的 SQL（见下文「执行建表 SQL」）。
2. **填好 API 配置**  
   在项目里的 `scripts/supabase.js` 填上 **Project URL** 和 **anon key**（若已填过可跳过）。

### 3. 两种执行方式

- **方式 A：全新项目或表还不全**  
  → 直接执行整个 **`supabase-schema.sql`**（推荐），一次建好所有表和策略。
- **方式 B：老项目，只多了「选题」和「校内资源」**  
  → 只执行下面「仅新增：选题 + 校内资源」里的那一小段 SQL，补上 `topics` 和 `campus_resources` 即可。

---

## 二、分步教程

### 步骤 1：打开 Supabase 并进入 SQL Editor

1. 打开 [https://supabase.com](https://supabase.com)，登录。
2. 选中你的项目（没有就 **New Project** 新建一个）。
3. 左侧菜单点击 **SQL Editor**。
4. 点击 **New query**，得到一个空白 SQL 窗口。

---

### 步骤 2：执行建表 SQL

**方式 A：执行完整 schema（推荐首次或表不全时）**

1. 打开本仓库里的 **`supabase-schema.sql`**，全选并复制全部内容。
2. 粘贴到 SQL Editor 的空白窗口。
3. 点击右下角 **Run**（或按 Ctrl/Cmd + Enter）。
4. 若无报错，会看到 “Success” 或类似提示，表示以下内容已就绪：
   - 表：`calendar_events`、`topics`、`resources`、`datasets`、`tools`、`campus_resources`
   - 每张表的 RLS 已开启
   - 每张表都有 SELECT / INSERT / UPDATE / DELETE 策略（当前为允许所有人读写）

**方式 B：只补「选题」和「校内资源」（表已存在时）**

若你之前已经建过 `calendar_events`、`resources`、`datasets`、`tools`，只需补两张新表。在 SQL Editor 新建查询，粘贴并执行下面整段：

```sql
-- 校内资源表
CREATE TABLE IF NOT EXISTS campus_resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 选题表（大事一览 - 现有选题）
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    reporter TEXT,
    topic_type TEXT NOT NULL,
    status TEXT DEFAULT 'editing',
    completed BOOLEAN DEFAULT false,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campus_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cr_sel" ON campus_resources FOR SELECT USING (true);
CREATE POLICY "cr_ins" ON campus_resources FOR INSERT WITH CHECK (true);
CREATE POLICY "cr_upd" ON campus_resources FOR UPDATE USING (true);
CREATE POLICY "cr_del" ON campus_resources FOR DELETE USING (true);

CREATE POLICY "top_sel" ON topics FOR SELECT USING (true);
CREATE POLICY "top_ins" ON topics FOR INSERT WITH CHECK (true);
CREATE POLICY "top_upd" ON topics FOR UPDATE USING (true);
CREATE POLICY "top_del" ON topics FOR DELETE USING (true);
```

---

### 步骤 3：确认表已创建（可选）

1. 在 Supabase 左侧点击 **Table Editor**。
2. 在表列表中应能看到：
   - `calendar_events`
   - `topics`
   - `resources`
   - `datasets`
   - `tools`
   - `campus_resources`

点击任一张表可查看列结构，无需改任何列，只要表存在即可。

---

### 步骤 4：获取 Project URL 和 anon key

1. 左侧点击 **Project Settings**（齿轮图标）。
2. 选 **API**。
3. 复制 **Project URL**（例如 `https://xxxxx.supabase.co`）。
4. 在 **Project API keys** 中复制 **anon**、**public** 那一串（不要用 `service_role`）。

---

### 步骤 5：在项目里填写配置

1. 打开本仓库的 **`scripts/supabase.js`**。
2. 将下面两处替换成你在步骤 4 复制的值：

```javascript
var SUPABASE_URL = 'https://你的项目id.supabase.co';   // 换成 Project URL
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'; // 换成 anon public key
```

3. 保存文件。

---

### 步骤 6：验证是否生效

1. **大事一览（日历 + 选题）**  
   打开 `calendar.html`，添加一条活动、再在下方选题区添加一条选题，刷新页面，看是否仍存在；改选题状态是否正常。
2. **教程库**  
   打开 `resources.html`，上传一条教程，用另一浏览器或隐身窗口打开，看是否能看到。
3. **资源共享**  
   打开 `datasources.html`，在「校内资源」「优质数据资源库」「实用工具与网页」各添加一条，刷新或换设备看是否同步显示。

若以上都正常，说明 Supabase 已生效，数据会持久保存在云端。

---

## 三、表与页面对应关系（完整）

| 页面 | Supabase 表名 | 说明 |
|------|----------------|------|
| 大事一览 | `calendar_events` | 活动日期、标题、分类、时间、地点等 |
| 大事一览 | `topics` | 选题（Spot News / Feature Story）、记者、状态等 |
| 教程库 | `resources` | 教程标题、分类、作者、点赞/收藏等 |
| 资源共享 | `campus_resources` | 校内资源（置顶） |
| 资源共享 | `datasets` | 优质数据资源库 |
| 资源共享 | `tools` | 实用工具与网页 |

---

## 四、未配置 Supabase 时

如果**不**修改 `scripts/supabase.js`（仍为占位符），或未执行建表 SQL：

- 各页面会退回到 **本地 localStorage**：只能在本机、本浏览器看到自己添加的内容。
- 不会报错，站点仍可正常打开和操作。

---

## 五、可选：预置默认数据

若希望「资源共享」一打开就有若干默认数据，可在 **SQL Editor** 里执行（在表已建好的前提下）：

```sql
INSERT INTO datasets (id, name, description, link, category) VALUES
('seed1', '香港政府数据一站通', '香港特别行政区政府提供的开放数据平台。', 'https://data.gov.hk', 'government'),
('seed2', '世界银行开放数据', '世界银行提供的全球发展数据。', 'https://data.worldbank.org', 'international')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tools (id, name, description, link, category) VALUES
('seed1', 'Datawrapper', '专业的数据可视化工具。', 'https://www.datawrapper.de', 'visualization'),
('seed2', 'Flourish', '强大的数据可视化平台。', 'https://flourish.studio', 'visualization')
ON CONFLICT (id) DO NOTHING;
```

按需修改名称、链接、分类后再执行。

---

更多说明可参考 [Supabase 官方文档](https://supabase.com/docs)。
