// 选题数据模块（独立于日历，使用 topics 表 / localStorage）
function TopicsManager() {
    this.topics = [];
    var self = this;
    this._loadPromise = this.loadFromSupabase()
        .then(function (list) {
            self.topics = list || [];
            return self.topics;
        })
        .catch(function (err) {
            console.error('加载选题失败:', err);
            self.topics = self.loadFromStorage();
            return self.topics;
        });
}

TopicsManager.prototype.loadReady = function () {
    return this._loadPromise || Promise.resolve(this.topics);
};

TopicsManager.prototype.loadFromSupabase = function () {
    var client = window.supabaseClient;
    if (!client) return Promise.resolve(this.loadFromStorage());
    return client.from('topics').select('*').order('created_at', { ascending: false })
        .then(function (r) {
            if (r.error) {
                console.error('Supabase 选题查询错误:', r.error);
                return [];
            }
            return r.data || [];
        })
        .catch(function (err) {
            console.error('Supabase 选题连接错误:', err);
            return [];
        });
};

TopicsManager.prototype.loadFromStorage = function () {
    try {
        var raw = localStorage.getItem('topics');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
};

TopicsManager.prototype.saveToStorage = function () {
    try {
        localStorage.setItem('topics', JSON.stringify(this.topics));
    } catch (e) {}
};

TopicsManager.prototype.getTopics = function () {
    return this.topics || [];
};

TopicsManager.prototype.getTopic = function (id) {
    return (this.topics || []).find(function (t) { return t.id === id; });
};

TopicsManager.prototype.addTopic = function (data) {
    var desc = data.description || '';
    var status = data.status || 'preparing';
    var topic = {
        id: Date.now().toString(),
        title: data.title || desc.slice(0, 80) || '',
        description: desc,
        reporter: data.reporter || '',
        topic_type: data.topic_type || 'spot_news',
        status: status,
        completed: status === 'completed',
        date: data.date || ''
    };
    var self = this;
    var client = window.supabaseClient;
    if (client) {
        client.from('topics').insert(topic).then(function () {
            self.topics.unshift(topic);
            self.saveToStorage();
            if (window.renderTopicSummary) window.renderTopicSummary();
        }).catch(function () {
            self.topics.unshift(topic);
            self.saveToStorage();
            if (window.renderTopicSummary) window.renderTopicSummary();
        });
    } else {
        this.topics.unshift(topic);
        this.saveToStorage();
        if (window.renderTopicSummary) window.renderTopicSummary();
    }
};

TopicsManager.prototype.updateTopic = function (id, data) {
    var self = this;
    var client = window.supabaseClient;
    if (client) {
        client.from('topics').update(data).eq('id', id).then(function () {
            var t = self.topics.find(function (x) { return x.id === id; });
            if (t) Object.assign(t, data);
            self.saveToStorage();
            if (window.renderTopicSummary) window.renderTopicSummary();
        }).catch(function () {
            var t = self.topics.find(function (x) { return x.id === id; });
            if (t) Object.assign(t, data);
            self.saveToStorage();
            if (window.renderTopicSummary) window.renderTopicSummary();
        });
    } else {
        var t = this.topics.find(function (x) { return x.id === id; });
        if (t) Object.assign(t, data);
        this.saveToStorage();
        if (window.renderTopicSummary) window.renderTopicSummary();
    }
};

TopicsManager.prototype.deleteTopic = function (id) {
    var self = this;
    var client = window.supabaseClient;
    if (client) {
        client.from('topics').delete().eq('id', id).then(function () {
            self.topics = self.topics.filter(function (t) { return t.id !== id; });
            self.saveToStorage();
            if (window.renderTopicSummary) window.renderTopicSummary();
        }).catch(function () {
            self.topics = self.topics.filter(function (t) { return t.id !== id; });
            self.saveToStorage();
            if (window.renderTopicSummary) window.renderTopicSummary();
        });
    } else {
        this.topics = this.topics.filter(function (t) { return t.id !== id; });
        this.saveToStorage();
        if (window.renderTopicSummary) window.renderTopicSummary();
    }
};

window.TopicsManager = TopicsManager;
