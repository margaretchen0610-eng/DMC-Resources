// 日历功能模块（支持 Supabase 云端存储）
class Calendar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('日历容器不存在:', containerId);
            return;
        }
        this.currentDate = new Date();
        this.selectedDate = null;
        this.events = [];
        // 先渲染一次空日历，确保页面有内容
        this.render();
        this.attachEventListeners();
        var self = this;
        // 然后异步加载活动数据，加载完成后重新渲染
        this._loadPromise = this.loadEventsFromSupabase()
            .then(function (events) {
                self.events = events || [];
                self.render(); // 重新渲染，显示活动
                return self.events;
            })
            .catch(function (err) {
                console.error('加载活动失败:', err);
                self.events = self.loadEvents(); // 降级到 localStorage
                self.render(); // 重新渲染
                return self.events;
            });
    }

    loadReady() {
        return this._loadPromise || Promise.resolve(this.events);
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    attachEventListeners() {
        var prevBtn = document.getElementById('prevMonth');
        var nextBtn = document.getElementById('nextMonth');
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.render();
            }.bind(this));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.render();
            }.bind(this));
        }
    }

    render() {
        if (!this.container) {
            console.error('无法渲染：日历容器不存在');
            return;
        }
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份标题
        var monthEl = document.getElementById('currentMonth');
        if (monthEl) {
            monthEl.textContent = `${year}年${month + 1}月`;
        }

        // 清空日历网格
        this.container.innerHTML = '';

        // 添加星期标题
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            this.container.appendChild(dayHeader);
        });

        // 获取月份第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        // 添加上个月的日期
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            this.createDayElement(day, true, new Date(year, month - 1, day));
        }

        // 添加当前月的日期
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isSameDay(date, today);
            this.createDayElement(day, false, date, isToday);
        }

        // 添加下个月的日期以填满网格
        const totalCells = this.container.children.length;
        const remainingCells = 42 - totalCells; // 6行 x 7列
        for (let day = 1; day <= remainingCells; day++) {
            this.createDayElement(day, true, new Date(year, month + 1, day));
        }
    }

    createDayElement(dayNumber, isOtherMonth, date, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }

        const dateStr = this.formatDate(date);
        dayElement.setAttribute('data-date', dateStr);
        if (dateStr === this.selectedDate) {
            dayElement.classList.add('selected');
        }
        const dayEvents = this.getEventsForDate(dateStr);
        
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-events');
            // 根据活动分类添加样式类（只要当天有该分类的任意一个活动，就加上）
            const categories = dayEvents.map(e => e.category).filter(Boolean);
            if (categories.includes('school')) dayElement.classList.add('school');
            if (categories.includes('report')) dayElement.classList.add('report');
            if (categories.includes('major')) dayElement.classList.add('major');
            if (categories.includes('hot')) dayElement.classList.add('hot');
        }

        const dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'calendar-day-number';
        dayNumberElement.textContent = dayNumber;
        dayElement.appendChild(dayNumberElement);

        const categoryMap = {
            'school': 'school',
            'report': 'report',
            'major': 'major',
            'hot': 'hot'
        };
        const eventsWrap = document.createElement('div');
        eventsWrap.className = 'calendar-day-events';
        const categoryTitleMap = { school: '学校活动', report: '数据报告', major: '重大事件', hot: '社会热点' };
        const toShow = dayEvents.slice(0, 4).sort((a, b) => {
            if (a.category === 'major' && b.category !== 'major') return -1;
            if (a.category !== 'major' && b.category === 'major') return 1;
            return 0;
        });
        toShow.forEach(event => {
            const category = event.category || 'school';
            const row = document.createElement('div');
            row.className = `calendar-event-row calendar-event-${category}`;
            const dot = document.createElement('span');
            dot.className = `event-dot ${categoryMap[category] || 'school'}`;
            row.appendChild(dot);
            const titleEl = document.createElement('span');
            titleEl.className = 'calendar-event-title';
            titleEl.textContent = event.title || categoryTitleMap[category] || '活动';
            row.appendChild(titleEl);
            eventsWrap.appendChild(row);
        });
        dayElement.appendChild(eventsWrap);

        if (!isOtherMonth) {
            dayElement.addEventListener('click', () => {
                this.selectDate(dateStr);
            });
        }

        this.container.appendChild(dayElement);
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.container.querySelectorAll('.calendar-day').forEach(cell => {
            cell.classList.toggle('selected', cell.getAttribute('data-date') === dateStr);
        });
        // 点击日期不再直接弹出编辑框，而是让右侧栏展示该日期的活动列表
        if (window.showEventsForDate) {
            window.showEventsForDate(dateStr);
        }
    }

    getEventsForDate(dateStr) {
        return this.events.filter(function(event) { return event.date === dateStr; });
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    loadEventsFromSupabase() {
        var client = window.supabaseClient;
        if (!client) return Promise.resolve(this.loadEvents());
        var self = this;
        return client.from('calendar_events').select('*').order('date')
            .then(function (r) {
                if (r.error) {
                    console.error('Supabase 查询错误:', r.error);
                    return self.loadEvents(); // 降级到 localStorage
                }
                return r.data || [];
            })
            .catch(function (err) {
                console.error('Supabase 连接错误:', err);
                return self.loadEvents(); // 降级到 localStorage
            });
    }

    loadEvents() {
        const stored = localStorage.getItem('calendarEvents');
        return stored ? JSON.parse(stored) : [];
    }

    addEvent(event) {
        event.id = Date.now().toString();
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            client.from('calendar_events').insert(event).then(function () {
                self.events.push(event);
                self.render();
            }).catch(function () {
                self.events.push(event);
                self.render();
            });
        } else {
            this.events.push(event);
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
            this.render();
        }
    }

    updateEvent(eventId, updatedEvent) {
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            client.from('calendar_events').update(updatedEvent).eq('id', eventId).then(function () {
                var i = self.events.findIndex(function (e) { return e.id === eventId; });
                if (i !== -1) {
                    self.events[i] = Object.assign({}, self.events[i], updatedEvent);
                    self.render();
                }
            }).catch(function () {
                var i = self.events.findIndex(function (e) { return e.id === eventId; });
                if (i !== -1) { self.events[i] = Object.assign({}, self.events[i], updatedEvent); self.render(); }
            });
        } else {
            var index = this.events.findIndex(e => e.id === eventId);
            if (index !== -1) {
                this.events[index] = { ...this.events[index], ...updatedEvent };
                localStorage.setItem('calendarEvents', JSON.stringify(this.events));
                this.render();
            }
        }
    }

    deleteEvent(eventId) {
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            client.from('calendar_events').delete().eq('id', eventId).then(function () {
                self.events = self.events.filter(function (e) { return e.id !== eventId; });
                self.render();
            }).catch(function () {
                self.events = self.events.filter(function (e) { return e.id !== eventId; });
                self.render();
            });
        } else {
            this.events = this.events.filter(e => e.id !== eventId);
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
            this.render();
        }
    }

    getEvent(eventId) {
        return this.events.find(e => e.id === eventId);
    }

    getEventsForToday() {
        const today = this.formatDate(new Date());
        return this.getEventsForDate(today);
    }
}

// 导出供其他模块使用
window.Calendar = Calendar;
