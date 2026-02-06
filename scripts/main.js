// 主初始化脚本
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏：下滑隐藏、上滑显示
    initNavbarScrollHide();

    // 检查当前页面 - 支持多种路径格式
    var pathname = window.location.pathname;
    var currentPage = pathname.split('/').pop() || pathname;
    var isCalendarPage = currentPage === 'calendar.html' || 
                         currentPage === 'calendar' ||
                         currentPage.endsWith('/calendar.html') ||
                         document.body.classList.contains('page-calendar') ||
                         document.getElementById('calendarGrid') !== null;

    if (isCalendarPage) {
        console.log('检测到日历页面，开始初始化...');
        initCalendarPage();
    } else if (currentPage === 'resources.html' || currentPage === 'resources' || document.getElementById('resourcesGrid')) {
        console.log('检测到资源库页面，开始初始化...');
        initResourcesPage();
    } else if (currentPage === 'datasources.html' || currentPage === 'datasources' || document.getElementById('datasetsGrid')) {
        // 资源共享页面由datasources.js自动初始化
    }
    // index.html (欢迎页面) 不需要其他 JavaScript 初始化
});

/**
 * 导航栏随滚动方向显隐：向下滑时隐藏，向上滑时显示。
 * 导航使用 position:fixed，此处为 body 预留顶部高度。
 */
function initNavbarScrollHide() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const navHeight = navbar.offsetHeight;
    if (!document.body.classList.contains('page-index')) {
        document.body.style.paddingTop = navHeight + 'px';
    }

    let lastScrollY = window.scrollY;
    const scrollThreshold = 60;

    function onScroll() {
        const currentScrollY = window.scrollY;
        if (currentScrollY <= scrollThreshold) {
            navbar.classList.remove('navbar--hidden');
        } else if (currentScrollY > lastScrollY) {
            navbar.classList.add('navbar--hidden');
        } else {
            navbar.classList.remove('navbar--hidden');
        }
        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
}

function initCalendarPage() {
    var container = document.getElementById('calendarGrid');
    if (!container) {
        console.error('无法初始化日历：calendarGrid 容器不存在');
        return;
    }
    var calendar = new Calendar('calendarGrid');
    if (!calendar || !calendar.container) {
        console.error('Calendar 创建失败或容器不存在');
        return;
    }
    window.calendar = calendar;
    var topicsManager = new TopicsManager();
    window.topicsManager = topicsManager;
    Promise.all([calendar.loadReady(), topicsManager.loadReady()]).then(function() {
        var eventManager = new EventManager(calendar);
        window.eventManager = eventManager;
        var today = calendar.formatDate(new Date());
        if (eventManager.updateEventsForDate) {
            eventManager.updateEventsForDate(today);
        }
        updateTodayEventsSidebar();
        setInterval(updateTodayEventsSidebar, 60000);
        if (window.renderTopicSummary) window.renderTopicSummary();
    }).catch(function(err) {
        console.error('初始化日历页面失败:', err);
        var eventManager = new EventManager(calendar);
        window.eventManager = eventManager;
        if (window.renderTopicSummary) window.renderTopicSummary();
    });
}

/**
 * 选题列表：数据来自独立选题库（topics），与日历无交叉
 */
function renderTopicSummary() {
    var topicsManager = window.topicsManager;
    var spotEl = document.getElementById('summarySpotNews');
    var featureEl = document.getElementById('summaryFeatureStory');
    var completedEl = document.getElementById('summaryCompleted');
    var completedCountEl = document.getElementById('completedCount');
    var completedToggle = document.getElementById('completedToggle');
    if (!topicsManager || !spotEl || !featureEl) return;

    var topics = topicsManager.getTopics();
    var isCompleted = function(t) { return t.status === 'completed' || t.completed === true; };
    var spot = topics.filter(function(t) { return t.topic_type === 'spot_news' && !isCompleted(t); });
    var feature = topics.filter(function(t) { return t.topic_type === 'feature_story' && !isCompleted(t); });
    var completedList = topics.filter(isCompleted);

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function makeTopicCard(t, showStatusSelect) {
        var desc = (t.description && t.description.trim()) ? escapeHtml(t.description) : '—';
        var reporter = (t.reporter && t.reporter.trim()) ? escapeHtml(t.reporter) : '—';
        var statusVal = t.status || 'preparing';
        var statusSelect = showStatusSelect !== false ? '<select class="topic-card-status" data-id="' + escapeHtml(t.id) + '" title="状态">' +
            '<option value="preparing"' + (statusVal === 'preparing' ? ' selected' : '') + '>准备中</option>' +
            '<option value="1st_meeting"' + (statusVal === '1st_meeting' ? ' selected' : '') + '>1st Editorial</option>' +
            '<option value="2nd_meeting"' + (statusVal === '2nd_meeting' ? ' selected' : '') + '>2nd Editorial</option>' +
            '<option value="3rd_meeting"' + (statusVal === '3rd_meeting' ? ' selected' : '') + '>3rd Editorial</option>' +
            '<option value="review"' + (statusVal === 'review' ? ' selected' : '') + '>待审核</option>' +
            '<option value="completed"' + (statusVal === 'completed' ? ' selected' : '') + '>已完成</option>' +
            '</select>' : '';
        return '<div class="topic-card" data-date="' + escapeHtml(t.date || '') + '" data-id="' + escapeHtml(t.id) + '">' +
            '<div class="topic-card-row">' +
            '<div class="topic-card-main">' +
            '<div class="topic-card-desc">' + desc + '</div>' +
            '<div class="topic-card-reporter">' + reporter + '</div>' +
            '</div>' +
            '<div class="topic-card-right">' + statusSelect + '</div>' +
            '</div>' +
            '</div>';
    }

    function renderActiveList(list, container) {
        if (list.length === 0) {
            container.innerHTML = '<p class="topic-grid-empty">暂无选题</p>';
            return;
        }
        container.innerHTML = list.map(function(t) { return makeTopicCard(t, true); }).join('');
        container.querySelectorAll('.topic-card').forEach(function(card) {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.topic-card-status')) return;
                var date = card.getAttribute('data-date');
                var id = card.getAttribute('data-id');
                if (window.eventManager && id) window.eventManager.openModal(date || '', id, true);
            });
        });
        container.querySelectorAll('.topic-card-status').forEach(function(sel) {
            sel.addEventListener('change', function(e) {
                e.stopPropagation();
                var id = sel.getAttribute('data-id');
                var val = sel.value;
                if (id && window.topicsManager) {
                    window.topicsManager.updateTopic(id, { status: val, completed: val === 'completed' });
                }
            });
            sel.addEventListener('click', function(e) { e.stopPropagation(); });
        });
    }

    renderActiveList(spot, spotEl);
    renderActiveList(feature, featureEl);

    if (completedCountEl) completedCountEl.textContent = '(' + completedList.length + ')';
    
    if (completedEl) {
        if (completedList.length === 0) {
            // 当没有已完成的选题时，不显示任何内容
            completedEl.innerHTML = '';
        } else {
            // 已完成选题不显示状态框，直接显示列表
            completedEl.innerHTML = completedList.map(function(t) { return makeTopicCard(t, false); }).join('');
            completedEl.querySelectorAll('.topic-card').forEach(function(card) {
                card.addEventListener('click', function(e) {
                    var date = card.getAttribute('data-date');
                    var id = card.getAttribute('data-id');
                    if (window.eventManager && id) window.eventManager.openModal(date || '', id, true);
                });
            });
        }
    }
}

window.renderTopicSummary = renderTopicSummary;

function initResourcesPage() {
    // 创建资源管理器实例
    const resourceManager = new ResourceManager();
    window.resourceManager = resourceManager;
}

function updateTodayEventsSidebar() {
    if (window.eventManager && window.calendar) {
        const today = window.calendar.formatDate(new Date());
        window.eventManager.updateEventsForDate(today);
    }
}
