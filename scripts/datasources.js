// 资源共享管理模块（支持 Supabase 云端存储）
class DataSourceManager {
    constructor() {
        this.campus = [];
        this.datasets = [];
        this.tools = [];
        var self = this;
        this._loadPromise = Promise.all([
            this.loadCampusAsync(),
            this.loadDatasetsAsync(),
            this.loadToolsAsync()
        ]).then(function (results) {
            self.campus = results[0] || [];
            self.datasets = results[1] || [];
            self.tools = results[2] || [];
            self.init();
        });
    }

    loadCampusAsync() {
        var client = window.supabaseClient;
        if (client) {
            return client.from('campus_resources').select('*').order('created_at', { ascending: false })
                .then(function (r) { return r.data || []; })
                .catch(function () { return []; });
        }
        return Promise.resolve(this.loadCampus());
    }

    loadDatasetsAsync() {
        var client = window.supabaseClient;
        if (client) {
            return client.from('datasets').select('*').order('created_at', { ascending: false })
                .then(function (r) { return r.data || []; })
                .catch(function () { return []; });
        }
        return Promise.resolve(this.loadDatasets());
    }

    loadToolsAsync() {
        var client = window.supabaseClient;
        if (client) {
            return client.from('tools').select('*').order('created_at', { ascending: false })
                .then(function (r) { return r.data || []; })
                .catch(function () { return []; });
        }
        return Promise.resolve(this.loadTools());
    }

    init() {
        this.render();
        this.attachAddListeners();
        this.attachCollapseListeners();
    }

    attachCollapseListeners() {
        var self = this;
        document.querySelectorAll('.datasource-section').forEach(function (section) {
            var head = section.querySelector('.datasource-section-head');
            var toggle = section.querySelector('.datasource-section-toggle');
            var grid = section.querySelector('.datasource-grid--collapsible');
            if (!toggle || !grid) return;
            toggle.addEventListener('click', function () {
                var expanded = toggle.getAttribute('aria-expanded') === 'true';
                grid.hidden = expanded;
                toggle.setAttribute('aria-expanded', !expanded);
                toggle.querySelector('.datasource-section-arrow').textContent = expanded ? '▲' : '▼';
            });
        });
    }

    attachAddListeners() {
        const addCampusBtn = document.getElementById('addCampusBtn');
        const addDatasetBtn = document.getElementById('addDatasetBtn');
        const addToolBtn = document.getElementById('addToolBtn');
        const modal = document.getElementById('datasourceAddModal');
        const modalClose = document.getElementById('datasourceAddModalClose');
        const modalCancel = document.getElementById('datasourceAddCancel');
        const form = document.getElementById('datasourceAddForm');
        const typeInput = document.getElementById('datasourceAddType');

        if (addCampusBtn) {
            addCampusBtn.addEventListener('click', () => this.openAddModal('campus'));
        }
        if (addDatasetBtn) {
            addDatasetBtn.addEventListener('click', () => this.openAddModal('dataset'));
        }
        if (addToolBtn) {
            addToolBtn.addEventListener('click', () => this.openAddModal('tool'));
        }
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeAddModal());
        }
        if (modalCancel) {
            modalCancel.addEventListener('click', () => this.closeAddModal());
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAddModal();
            });
        }
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddSubmit();
            });
        }
    }

    openAddModal(type) {
        const modal = document.getElementById('datasourceAddModal');
        const titleEl = document.getElementById('datasourceAddModalTitle');
        const typeInput = document.getElementById('datasourceAddType');
        const nameInput = document.getElementById('datasourceAddName');
        const descInput = document.getElementById('datasourceAddDesc');
        const linkInput = document.getElementById('datasourceAddLink');
        
        if (!modal || !titleEl || !typeInput) return;
        
        typeInput.value = type;
        titleEl.textContent = type === 'campus' ? '添加校内资源' : (type === 'dataset' ? '添加数据源' : '添加工具');
        
        // 清空表单（添加模式）
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        if (linkInput) linkInput.value = '';
        
        // 移除编辑ID标记
        modal.removeAttribute('data-edit-id');
        
        modal.classList.add('show');
    }

    closeAddModal() {
        const modal = document.getElementById('datasourceAddModal');
        const form = document.getElementById('datasourceAddForm');
        if (modal) modal.classList.remove('show');
        if (form) form.reset();
    }

    handleAddSubmit() {
        const modal = document.getElementById('datasourceAddModal');
        const typeInput = document.getElementById('datasourceAddType');
        const name = document.getElementById('datasourceAddName')?.value?.trim();
        const description = document.getElementById('datasourceAddDesc')?.value?.trim() || '';
        const link = document.getElementById('datasourceAddLink')?.value?.trim();
        
        if (!name || !link) return;
        
        const type = typeInput?.value || 'dataset';
        const editId = modal?.getAttribute('data-edit-id');
        
        // 判断是编辑还是添加
        if (editId) {
            // 编辑模式
            if (type === 'campus') {
                this.updateCampus(editId, { name, description, link });
            } else if (type === 'dataset') {
                this.updateDataset(editId, { name, description, link });
            } else {
                this.updateTool(editId, { name, description, link });
            }
        } else {
            // 添加模式
            if (type === 'campus') {
                this.addCampus({ name, description, link });
            } else if (type === 'dataset') {
                this.addDataset({ name, description, link });
            } else {
                this.addTool({ name, description, link });
            }
        }
        
        this.closeAddModal();
    }

    updateCampus(id, data) {
        const index = this.campus.findIndex(item => item.id === id);
        if (index === -1) return;
        
        this.campus[index] = { ...this.campus[index], ...data };
        
        const client = window.supabaseClient;
        if (client) {
            client.from('campus_resources').update(data).eq('id', id).then(() => {
                this.renderCampus();
            }).catch(() => {
                this.renderCampus();
            });
        } else {
            this.saveCampus();
            this.renderCampus();
        }
    }

    updateDataset(id, data) {
        const index = this.datasets.findIndex(item => item.id === id);
        if (index === -1) return;
        
        this.datasets[index] = { ...this.datasets[index], ...data };
        
        const client = window.supabaseClient;
        if (client) {
            client.from('datasets').update(data).eq('id', id).then(() => {
                this.renderDatasets();
            }).catch(() => {
                this.renderDatasets();
            });
        } else {
            this.saveDatasets();
            this.renderDatasets();
        }
    }

    updateTool(id, data) {
        const index = this.tools.findIndex(item => item.id === id);
        if (index === -1) return;
        
        this.tools[index] = { ...this.tools[index], ...data };
        
        const client = window.supabaseClient;
        if (client) {
            client.from('tools').update(data).eq('id', id).then(() => {
                this.renderTools();
            }).catch(() => {
                this.renderTools();
            });
        } else {
            this.saveTools();
            this.renderTools();
        }
    }

    addCampus(item) {
        var id = String(Date.now());
        var row = { id: id, name: item.name, description: item.description || '', link: item.link };
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            client.from('campus_resources').insert(row).then(function () {
                self.campus.unshift(row);
                self.renderCampus();
            }).catch(function () {
                self.campus.unshift(row);
                self.renderCampus();
            });
        } else {
            this.campus.unshift(row);
            this.saveCampus();
            this.renderCampus();
        }
    }

    loadCampus() {
        try {
            var stored = localStorage.getItem('campus_resources');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    saveCampus() {
        try {
            localStorage.setItem('campus_resources', JSON.stringify(this.campus));
        } catch (e) {}
    }

    renderCampus() {
        const container = document.getElementById('campusGrid');
        if (!container) return;
        if (this.campus.length === 0) {
            container.innerHTML = '<div style="width: 100%; text-align: center; padding: 2rem; color: var(--text-secondary);"><p style="font-size: 1.125rem; margin: 0;">暂无校内资源</p></div>';
            return;
        }
        container.innerHTML = this.campus.map(function (item) {
            return '<div class="datasource-card" data-id="' + item.id + '" data-type="campus" style="cursor: pointer;">' +
                '<div class="datasource-card-title"><span>' + this.escapeHtml(item.name) + '</span></div>' +
                '<div class="datasource-card-description">' + this.escapeHtml(item.description) + '</div>' +
                '<a href="' + item.link + '" target="_blank" rel="noopener noreferrer" class="datasource-card-link" onclick="event.stopPropagation();">访问网站</a>' +
                '</div>';
        }.bind(this)).join('');
        
        // 添加点击事件
        container.querySelectorAll('.datasource-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                const item = this.campus.find(i => i.id === id);
                if (item) this.openEditModal('campus', item);
            });
        });
    }

    addDataset(item) {
        var id = String(Date.now());
        var row = { id: id, name: item.name, description: item.description || '', link: item.link, category: 'custom' };
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            client.from('datasets').insert(row).then(function () {
                self.datasets.unshift(row);
                self.renderDatasets();
            }).catch(function () {
                self.datasets.unshift(row);
                self.renderDatasets();
            });
        } else {
            this.datasets.push(row);
            this.saveDatasets();
            this.renderDatasets();
        }
    }

    addTool(item) {
        var id = String(Date.now());
        var row = { id: id, name: item.name, description: item.description || '', link: item.link, category: 'custom' };
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            client.from('tools').insert(row).then(function () {
                self.tools.unshift(row);
                self.renderTools();
            }).catch(function () {
                self.tools.unshift(row);
                self.renderTools();
            });
        } else {
            this.tools.push(row);
            this.saveTools();
            this.renderTools();
        }
    }

    loadDatasets() {
        const stored = localStorage.getItem('datasets');
        if (stored) {
            return JSON.parse(stored);
        }
        // 返回示例数据集
        return [
            {
                id: '1',
                name: '香港政府数据一站通',
                description: '香港特别行政区政府提供的开放数据平台，涵盖经济、社会、环境等多个领域的数据集。',
                link: 'https://data.gov.hk',
                category: 'government'
            },
            {
                id: '2',
                name: '世界银行开放数据',
                description: '世界银行提供的全球发展数据，包括经济指标、社会统计数据等，支持多语言查询。',
                link: 'https://data.worldbank.org',
                category: 'international'
            },
            {
                id: '3',
                name: '联合国数据',
                description: '联合国统计司提供的全球统计数据，涵盖人口、经济、环境、社会发展等多个维度。',
                link: 'https://data.un.org',
                category: 'international'
            },
            {
                id: '4',
                name: '中国国家统计局',
                description: '中国国家统计局官方数据发布平台，提供国民经济和社会发展统计数据。',
                link: 'http://www.stats.gov.cn',
                category: 'government'
            },
            {
                id: '5',
                name: 'Kaggle数据集',
                description: '全球最大的数据科学社区，提供大量公开数据集，涵盖各个领域。',
                link: 'https://www.kaggle.com/datasets',
                category: 'community'
            },
            {
                id: '6',
                name: 'Google数据集搜索',
                description: 'Google推出的数据集搜索引擎，帮助快速找到所需的数据资源。',
                link: 'https://datasetsearch.research.google.com',
                category: 'search'
            }
        ];
    }

    loadTools() {
        const stored = localStorage.getItem('tools');
        if (stored) {
            return JSON.parse(stored);
        }
        // 返回示例工具
        return [
            {
                id: '1',
                name: 'Datawrapper',
                description: '专业的数据可视化工具，无需编程即可创建美观的图表和地图，适合新闻媒体使用。',
                link: 'https://www.datawrapper.de',
                category: 'visualization'
            },
            {
                id: '2',
                name: 'Flourish',
                description: '强大的数据可视化平台，支持创建交互式图表、地图和故事叙述。',
                link: 'https://flourish.studio',
                category: 'visualization'
            },
            {
                id: '3',
                name: 'Tableau Public',
                description: 'Tableau的免费版本，可以创建和分享交互式数据可视化作品。',
                link: 'https://public.tableau.com',
                category: 'visualization'
            },
            {
                id: '4',
                name: 'Observable',
                description: '基于D3.js的在线数据可视化平台，适合创建复杂的交互式数据图表。',
                link: 'https://observablehq.com',
                category: 'visualization'
            },
            {
                id: '5',
                name: 'GitHub Pages',
                description: '免费的静态网站托管服务，适合部署数据新闻项目和个人作品集。',
                link: 'https://pages.github.com',
                category: 'hosting'
            },
            {
                id: '6',
                name: 'Netlify',
                description: '现代化的网站部署平台，支持持续集成和自动部署，适合前端项目。',
                link: 'https://www.netlify.com',
                category: 'hosting'
            },
            {
                id: '7',
                name: 'Data Journalism Handbook',
                description: '数据新闻实践指南，提供从数据获取到可视化的完整工作流程。',
                link: 'https://datajournalism.com',
                category: 'reference'
            },
            {
                id: '8',
                name: 'Storytelling with Data',
                description: '数据叙事学习资源，提供数据可视化和故事叙述的最佳实践。',
                link: 'https://www.storytellingwithdata.com',
                category: 'reference'
            }
        ];
    }

    saveDatasets() {
        localStorage.setItem('datasets', JSON.stringify(this.datasets));
    }

    saveTools() {
        localStorage.setItem('tools', JSON.stringify(this.tools));
    }

    render() {
        this.renderCampus();
        this.renderDatasets();
        this.renderTools();
    }

    renderDatasets() {
        const container = document.getElementById('datasetsGrid');
        if (!container) return;

        if (this.datasets.length === 0) {
            container.innerHTML = `
                <div style="width: 100%; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p style="font-size: 1.125rem; margin: 0;">暂无数据资源</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.datasets.map(dataset => `
            <div class="datasource-card" data-id="${dataset.id}" data-type="dataset" style="cursor: pointer;">
                <div class="datasource-card-title">
                    <span>${this.escapeHtml(dataset.name)}</span>
                </div>
                <div class="datasource-card-description">
                    ${this.escapeHtml(dataset.description)}
                </div>
                <a href="${dataset.link}" target="_blank" rel="noopener noreferrer" class="datasource-card-link" onclick="event.stopPropagation();">
                    访问网站
                </a>
            </div>
        `).join('');
        
        // 添加点击事件
        container.querySelectorAll('.datasource-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                const item = this.datasets.find(i => i.id === id);
                if (item) this.openEditModal('dataset', item);
            });
        });
    }

    renderTools() {
        const container = document.getElementById('toolsGrid');
        if (!container) return;

        if (this.tools.length === 0) {
            container.innerHTML = `
                <div style="width: 100%; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p style="font-size: 1.125rem; margin: 0;">暂无工具资源</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.tools.map(tool => `
            <div class="datasource-card" data-id="${tool.id}" data-type="tool" style="cursor: pointer;">
                <div class="datasource-card-title">
                    <span>${this.escapeHtml(tool.name)}</span>
                </div>
                <div class="datasource-card-description">
                    ${this.escapeHtml(tool.description)}
                </div>
                <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="datasource-card-link" onclick="event.stopPropagation();">
                    访问网站
                </a>
            </div>
        `).join('');
        
        // 添加点击事件
        container.querySelectorAll('.datasource-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                const item = this.tools.find(i => i.id === id);
                if (item) this.openEditModal('tool', item);
            });
        });
    }

    openEditModal(type, item) {
        const modal = document.getElementById('datasourceAddModal');
        const titleEl = document.getElementById('datasourceAddModalTitle');
        const typeInput = document.getElementById('datasourceAddType');
        const nameInput = document.getElementById('datasourceAddName');
        const descInput = document.getElementById('datasourceAddDesc');
        const linkInput = document.getElementById('datasourceAddLink');
        
        if (!modal || !titleEl || !typeInput) return;
        
        // 设置弹窗标题
        typeInput.value = type;
        titleEl.textContent = type === 'campus' ? '编辑校内资源' : (type === 'dataset' ? '编辑数据源' : '编辑工具');
        
        // 填充已有信息
        if (nameInput) nameInput.value = item.name || '';
        if (descInput) descInput.value = item.description || '';
        if (linkInput) linkInput.value = item.link || '';
        
        // 保存当前编辑的项目ID
        modal.setAttribute('data-edit-id', item.id);
        
        modal.classList.add('show');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化
if (document.getElementById('datasetsGrid')) {
    window.dataSourceManager = new DataSourceManager();
}
