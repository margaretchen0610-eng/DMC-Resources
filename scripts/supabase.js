/**
 * Supabase 配置 - 请替换为你的项目地址与密钥
 * 在 https://supabase.com/dashboard 中：选择项目 → Settings → API
 * 将 Project URL 填入 SUPABASE_URL，将 anon public 填入 SUPABASE_ANON_KEY
 */
(function () {
    if (typeof supabase === 'undefined') {
        console.warn('Supabase CDN 未加载，请先在页面中引入：<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return;
    }
    var SUPABASE_URL = 'https://zytgrveholkjqzvlwmdu.supabase.co';   // 例如: https://xxxxx.supabase.co
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dGdydmVob2xranF6dmx3bWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzMyNjMsImV4cCI6MjA4NTEwOTI2M30.YqapIv-yv2TbRlkhhm78hOdqBKxT_KkGOmpCGZ9bUN4'; // 在 Dashboard → Settings → API 中的 anon public
    var createClient = supabase.createClient;
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
