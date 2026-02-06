-- ============================================================
-- HKBU DMC 资源库 - Supabase 表结构
-- 在 Supabase 控制台：SQL Editor → 粘贴本文件内容 → Run
-- ============================================================

-- 1. 大事一览 - 日历活动
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'school',
    time TEXT,
    location TEXT,
    description TEXT,
    topic_type TEXT,
    reporter TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 若表已存在，可单独执行以添加列：
-- ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS topic_type TEXT;
-- ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS reporter TEXT;
-- ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- 2. 教程库 - 资源帖子
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    link TEXT,
    author TEXT DEFAULT '匿名',
    image TEXT,
    likes INT DEFAULT 0,
    bookmarks INT DEFAULT 0,
    publisher_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 资源共享 - 数据源
CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    category TEXT DEFAULT 'custom',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 资源共享 - 工具
CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    category TEXT DEFAULT 'custom',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. 资源共享 - 校内资源
CREATE TABLE IF NOT EXISTS campus_resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 选题（与日历活动独立，无交叉）
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

-- 若表已存在，可单独执行：ALTER TABLE topics ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'editing';

-- 开启 RLS（按需可加策略，这里先允许匿名读写，便于浏览者添加内容）
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 策略：允许所有人读、写（适合课程/内网小站；正式上线可改为仅登录用户可写）
CREATE POLICY "cal_sel" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "cal_ins" ON calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "cal_upd" ON calendar_events FOR UPDATE USING (true);
CREATE POLICY "cal_del" ON calendar_events FOR DELETE USING (true);

CREATE POLICY "res_sel" ON resources FOR SELECT USING (true);
CREATE POLICY "res_ins" ON resources FOR INSERT WITH CHECK (true);
CREATE POLICY "res_upd" ON resources FOR UPDATE USING (true);
CREATE POLICY "res_del" ON resources FOR DELETE USING (true);

CREATE POLICY "ds_sel" ON datasets FOR SELECT USING (true);
CREATE POLICY "ds_ins" ON datasets FOR INSERT WITH CHECK (true);
CREATE POLICY "ds_upd" ON datasets FOR UPDATE USING (true);
CREATE POLICY "ds_del" ON datasets FOR DELETE USING (true);

CREATE POLICY "tl_sel" ON tools FOR SELECT USING (true);
CREATE POLICY "tl_ins" ON tools FOR INSERT WITH CHECK (true);
CREATE POLICY "tl_upd" ON tools FOR UPDATE USING (true);
CREATE POLICY "tl_del" ON tools FOR DELETE USING (true);

CREATE POLICY "cr_sel" ON campus_resources FOR SELECT USING (true);
CREATE POLICY "cr_ins" ON campus_resources FOR INSERT WITH CHECK (true);
CREATE POLICY "cr_upd" ON campus_resources FOR UPDATE USING (true);
CREATE POLICY "cr_del" ON campus_resources FOR DELETE USING (true);

CREATE POLICY "top_sel" ON topics FOR SELECT USING (true);
CREATE POLICY "top_ins" ON topics FOR INSERT WITH CHECK (true);
CREATE POLICY "top_upd" ON topics FOR UPDATE USING (true);
CREATE POLICY "top_del" ON topics FOR DELETE USING (true);

-- 可选：预置默认数据（首次运行后，前端会以 Supabase 为准；若表已有数据可跳过下面 INSERT）
-- INSERT INTO datasets (id, name, description, link, category) VALUES
-- ('1', '香港政府数据一站通', '香港特别行政区政府提供的开放数据平台。', 'https://data.gov.hk', 'government'),
-- ('2', '世界银行开放数据', '世界银行提供的全球发展数据。', 'https://data.worldbank.org', 'international');
-- INSERT INTO tools (id, name, description, link, category) VALUES
-- ('1', 'Datawrapper', '专业的数据可视化工具。', 'https://www.datawrapper.de', 'visualization'),
-- ('2', 'Flourish', '强大的数据可视化平台。', 'https://flourish.studio', 'visualization');
