// 活动管理模块
class EventManager {
    constructor(calendar) {
        this.calendar = calendar;
        this.modal = document.getElementById('eventModal');
        this.form = document.getElementById('eventForm');
        this.selectedDate = this.calendar.formatDate(new Date());
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateEventsForDate(this.selectedDate);
    }

    attachEventListeners() {
        // 右侧栏「添加活动」按钮
        const addEventBtn = document.getElementById('addEventBtn');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => {
                this.openModal(this.selectedDate, null, false);
            });
        }

        // 现有选题区「添加选题」按钮
        const addTopicBtn = document.getElementById('addTopicBtn');
        if (addTopicBtn) {
            addTopicBtn.addEventListener('click', () => {
                this.openModal(this.selectedDate, null, true);
            });
        }

        // 关闭模态框
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelEvent').addEventListener('click', () => {
            this.closeModal();
        });

        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // 表单提交
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });

        // 删除按钮
        document.getElementById('deleteEvent').addEventListener('click', () => {
            this.deleteEvent();
        });

    }

    openModal(dateStr, eventId = null, isTopicMode = false) {
        const modalTitle = document.getElementById('modalTitle');
        const eventDateInput = document.getElementById('eventDate');
        const eventIdInput = document.getElementById('eventId');
        const eventFormModeInput = document.getElementById('eventFormMode');
        const deleteBtn = document.getElementById('deleteEvent');
        const eventOnlyGroups = this.modal.querySelectorAll('.form-group--event-only');
        const topicOnlyGroups = this.modal.querySelectorAll('.form-group--topic-only');

        eventDateInput.value = dateStr;
        eventIdInput.value = eventId || '';
        eventFormModeInput.value = isTopicMode ? 'topic' : 'event';

        if (isTopicMode) {
            modalTitle.textContent = eventId ? '编辑选题' : '添加选题';
            eventOnlyGroups.forEach(function (el) { el.style.display = 'none'; });
            topicOnlyGroups.forEach(function (el) { el.style.display = 'block'; });
            document.getElementById('eventCategory').removeAttribute('required');
            document.getElementById('eventTitle').removeAttribute('required');
            if (eventId && window.topicsManager) {
                var topic = window.topicsManager.getTopic(eventId);
                if (topic) {
                    document.getElementById('eventDescription').value = topic.description || '';
                    document.getElementById('eventReporter').value = topic.reporter || '';
                    document.getElementById('eventTopicType').value = topic.topic_type || 'spot_news';
                    document.getElementById('eventTopicStatus').value = topic.status || 'preparing';
                    eventDateInput.value = topic.date || dateStr;
                    deleteBtn.style.display = 'block';
                }
            } else {
                document.getElementById('eventDescription').value = '';
                document.getElementById('eventReporter').value = '';
                document.getElementById('eventTopicType').value = 'spot_news';
                document.getElementById('eventTopicStatus').value = 'preparing';
                deleteBtn.style.display = 'none';
            }
        } else {
            modalTitle.textContent = eventId ? '编辑活动' : '添加活动';
            eventOnlyGroups.forEach(function (el) { el.style.display = 'block'; });
            topicOnlyGroups.forEach(function (el) { el.style.display = 'none'; });
            document.getElementById('eventCategory').setAttribute('required', 'required');
            document.getElementById('eventTitle').setAttribute('required', 'required');

            if (eventId) {
                const event = this.calendar.getEvent(eventId);
                if (event) {
                    document.getElementById('eventTitle').value = event.title || '';
                    document.getElementById('eventCategory').value = event.category || '';
                    document.getElementById('eventTime').value = event.time || '';
                    document.getElementById('eventLocation').value = event.location || '';
                    deleteBtn.style.display = 'block';
                }
            } else {
                this.form.reset();
                eventDateInput.value = dateStr;
                eventIdInput.value = '';
                eventFormModeInput.value = 'event';
                deleteBtn.style.display = 'none';
            }
        }

        this.modal.classList.add('show');
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.form.reset();
        document.getElementById('eventId').value = '';
        document.getElementById('deleteEvent').style.display = 'none';
    }

    saveEvent() {
        const eventId = document.getElementById('eventId').value;
        const mode = document.getElementById('eventFormMode').value;
        const topicsManager = window.topicsManager;

        if (mode === 'topic' && topicsManager) {
            const desc = document.getElementById('eventDescription').value || '';
            const status = document.getElementById('eventTopicStatus').value || 'preparing';
            const topicData = {
                date: document.getElementById('eventDate').value,
                title: desc.slice(0, 80) || '',
                description: desc,
                reporter: document.getElementById('eventReporter').value || '',
                topic_type: document.getElementById('eventTopicType').value || 'spot_news',
                status: status,
                completed: status === 'completed'
            };
            if (eventId) {
                topicsManager.updateTopic(eventId, topicData);
            } else {
                topicsManager.addTopic(topicData);
            }
            this.closeModal();
            return;
        }

        const eventData = {
            date: document.getElementById('eventDate').value,
            title: document.getElementById('eventTitle').value,
            category: document.getElementById('eventCategory').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value
        };
        if (eventId) {
            this.calendar.updateEvent(eventId, eventData);
        } else {
            this.calendar.addEvent(eventData);
        }
        this.closeModal();
        this.updateEventsForDate(eventData.date);
    }

    deleteEvent() {
        const eventId = document.getElementById('eventId').value;
        const mode = document.getElementById('eventFormMode').value;
        if (!eventId) return;
        if (mode === 'topic' && window.topicsManager) {
            if (confirm('确定要删除这个选题吗？')) {
                window.topicsManager.deleteTopic(eventId);
                this.closeModal();
            }
            return;
        }
        if (confirm('确定要删除这个活动吗？')) {
            this.calendar.deleteEvent(eventId);
            this.closeModal();
            this.updateEventsForDate(this.selectedDate);
        }
    }

    updateEventsForDate(dateStr) {
        this.selectedDate = dateStr;
        const todayEventsContainer = document.getElementById('todayEvents');
        const events = this.calendar.getEventsForDate(dateStr);

        const titleEl = document.getElementById('eventsTitle');
        if (titleEl) {
            titleEl.textContent = `${dateStr} 的活动`;
        }

        if (events.length === 0) {
            todayEventsContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem;">这一天还没有活动</p>';
            return;
        }

        todayEventsContainer.innerHTML = events.map(event => {
            const categoryClass = event.category || 'school';
            const desc = event.description ? this.escapeHtml(event.description) : '';
            return `
                <div class="event-item ${categoryClass}" onclick="eventManager.openModal('${event.date}', '${event.id}')">
                    <div class="event-item-title">${this.escapeHtml(event.title)}</div>
                    <div class="event-item-desc">${desc}</div>
                </div>
            `;
        }).join('');
    }

    getCategoryLabel(category) {
        const labels = {
            'school': '学校活动',
            'report': '数据报告',
            'major': '重大事件',
            'hot': '社会热点'
        };
        return labels[category] || '活动';
    }

    getTypeLabel(type) {
        const labels = {
            'workshop': '工作坊',
            'lecture': '讲座',
            'competition': '赛事',
            'meeting': '会议',
            'other': '其他'
        };
        return labels[type] || '活动';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 全局函数供日历模块调用：根据日期在右侧栏展示活动
window.showEventsForDate = function(dateStr) {
    if (window.eventManager) {
        window.eventManager.updateEventsForDate(dateStr);
    }
};

window.EventManager = EventManager;
