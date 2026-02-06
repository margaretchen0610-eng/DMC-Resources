// 资源库管理模块（支持 Supabase 云端存储）
class ResourceManager {
    constructor() {
        this.resources = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.modal = document.getElementById('resourceModal');
        this.form = document.getElementById('resourceForm');
        var self = this;
        this._loadPromise = this.loadResourcesAsync().then(function (r) {
            self.resources = r || [];
            self.init();
            return self.resources;
        });
    }

    loadResourcesAsync() {
        var client = window.supabaseClient;
        if (client) {
            return client.from('resources').select('*').order('created_at', { ascending: false })
                .then(function (res) {
                    var list = (res.data || []).map(function (r) {
                        var o = Object.assign({}, r);
                        o.publisherId = o.publisher_id;
                        o.createdAt = o.created_at;
                        o.liked = localStorage.getItem('resourceLiked_' + o.id) === '1';
                        o.bookmarked = localStorage.getItem('resourceBooked_' + o.id) === '1';
                        return o;
                    });
                    return list;
                })
                .catch(function () { return []; });
        }
        return Promise.resolve(this.loadResources());
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // 上传按钮
        document.getElementById('uploadBtn').addEventListener('click', () => {
            this.openModal();
        });

        // 关闭模态框
        document.getElementById('closeResourceModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelResource').addEventListener('click', () => {
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
            this.saveResource();
        });

        // 分类变更时，「数据可视化」显示并必填成品图片
        const categorySelect = document.getElementById('resourceCategory');
        const imageGroup = document.getElementById('resourceImageGroup');
        const imageInput = document.getElementById('resourceImage');
        if (categorySelect && imageGroup && imageInput) {
            categorySelect.addEventListener('change', () => {
                if (categorySelect.value === 'visualization') {
                    imageGroup.style.display = 'block';
                    imageInput.required = true;
                } else {
                    imageGroup.style.display = 'none';
                    imageInput.required = false;
                    imageInput.value = '';
                }
            });
        }

        // 筛选标签
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                this.currentFilter = tag.dataset.filter;
                this.render();
            });
        });

        // 搜索
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });
    }

    openModal(resourceId = null) {
        const modalTitle = document.getElementById('resourceModalTitle');
        const resourceIdInput = document.getElementById('resourceId');
        const categorySelect = document.getElementById('resourceCategory');
        const imageGroup = document.getElementById('resourceImageGroup');
        const imageInput = document.getElementById('resourceImage');

        resourceIdInput.value = resourceId || '';

        if (resourceId) {
            modalTitle.textContent = '编辑教程';
        } else {
            modalTitle.textContent = '上传新教程';
            this.form.reset();
        }

        if (imageGroup && imageInput) {
            imageGroup.style.display = categorySelect?.value === 'visualization' ? 'block' : 'none';
            imageInput.required = categorySelect?.value === 'visualization';
        }
        this.modal.classList.add('show');
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.form.reset();
        document.getElementById('resourceId').value = '';
    }

    saveResource() {
        const resourceId = document.getElementById('resourceId').value;
        const category = document.getElementById('resourceCategory').value;
        const imageInput = document.getElementById('resourceImage');

        if (category === 'visualization' && !resourceId) {
            if (!imageInput?.files || imageInput.files.length === 0) {
                alert('选择「数据可视化」分类时，请上传一张成品图片。');
                return;
            }
        }

        const finishSave = (imageData) => {
            const resourceData = {
                title: document.getElementById('resourceTitle').value,
                category: category,
                description: document.getElementById('resourceDescription').value,
                link: document.getElementById('resourceLink').value,
                author: document.getElementById('resourceAuthor').value || '匿名',
                image: imageData || (resourceId ? this.getResource(resourceId)?.image : null),
                likes: resourceId ? this.getResource(resourceId)?.likes || 0 : 0,
                bookmarks: resourceId ? this.getResource(resourceId)?.bookmarks || 0 : 0,
                liked: resourceId ? this.getResource(resourceId)?.liked || false : false,
                bookmarked: resourceId ? this.getResource(resourceId)?.bookmarked || false : false,
                createdAt: resourceId ? this.getResource(resourceId)?.createdAt : new Date().toISOString()
            };

            if (resourceId) {
                this.updateResource(resourceId, resourceData);
            } else {
                this.addResource(resourceData);
            }
            this.closeModal();
        };

        if (category === 'visualization' && imageInput?.files?.[0]) {
            const reader = new FileReader();
            reader.onload = () => finishSave(reader.result);
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            finishSave(resourceId ? this.getResource(resourceId)?.image : null);
        }
    }

    getMyPublisherId() {
        let id = localStorage.getItem('resourcePublisherId');
        if (!id) {
            id = 'pub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
            localStorage.setItem('resourcePublisherId', id);
        }
        return id;
    }

    canDeleteResource(resource) {
        const myId = localStorage.getItem('resourcePublisherId');
        return myId && (resource.publisherId === myId || resource.publisher_id === myId);
    }

    addResource(resource) {
        resource.id = Date.now().toString();
        resource.publisherId = this.getMyPublisherId();
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            var row = {
                id: resource.id,
                title: resource.title,
                category: resource.category,
                description: resource.description || '',
                link: resource.link || '',
                author: resource.author || '匿名',
                image: resource.image || null,
                likes: resource.likes || 0,
                bookmarks: resource.bookmarks || 0,
                publisher_id: resource.publisherId,
                created_at: resource.createdAt || new Date().toISOString()
            };
            client.from('resources').insert(row).then(function () {
                self.resources.unshift(resource);
                self.render();
            }).catch(function () {
                self.resources.unshift(resource);
                self.render();
            });
        } else {
            this.resources.unshift(resource);
            this.saveResources();
            this.render();
        }
    }

    updateResource(resourceId, updatedResource) {
        var self = this;
        var client = window.supabaseClient;
        var index = this.resources.findIndex(r => r.id === resourceId);
        if (index === -1) return;
        if (client) {
            var row = {
                title: updatedResource.title,
                category: updatedResource.category,
                description: updatedResource.description,
                link: updatedResource.link,
                author: updatedResource.author,
                image: updatedResource.image,
                likes: updatedResource.likes,
                bookmarks: updatedResource.bookmarks
            };
            client.from('resources').update(row).eq('id', resourceId).then(function () {
                self.resources[index] = Object.assign({}, self.resources[index], updatedResource);
                self.render();
            }).catch(function () {
                self.resources[index] = Object.assign({}, self.resources[index], updatedResource);
                self.render();
            });
        } else {
            this.resources[index] = { ...this.resources[index], ...updatedResource };
            this.saveResources();
            this.render();
        }
    }

    getResource(resourceId) {
        return this.resources.find(r => r.id === resourceId);
    }

    toggleLike(resourceId) {
        var resource = this.getResource(resourceId);
        if (!resource) return;
        resource.liked = !resource.liked;
        resource.likes += resource.liked ? 1 : -1;
        localStorage.setItem('resourceLiked_' + resourceId, resource.liked ? '1' : '0');
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            client.from('resources').update({ likes: resource.likes }).eq('id', resourceId).then(function () {
                self.render();
            }).catch(function () { self.render(); });
        } else {
            this.saveResources();
            this.render();
        }
    }

    toggleBookmark(resourceId) {
        var resource = this.getResource(resourceId);
        if (!resource) return;
        resource.bookmarked = !resource.bookmarked;
        resource.bookmarks += resource.bookmarked ? 1 : -1;
        localStorage.setItem('resourceBooked_' + resourceId, resource.bookmarked ? '1' : '0');
        var self = this;
        var client = window.supabaseClient;
        if (client) {
            client.from('resources').update({ bookmarks: resource.bookmarks }).eq('id', resourceId).then(function () {
                self.render();
            }).catch(function () { self.render(); });
        } else {
            this.saveResources();
            this.render();
        }
    }

    deleteResource(resourceId) {
        var resource = this.getResource(resourceId);
        if (!resource) return;
        if (!this.canDeleteResource(resource)) {
            alert('仅发布者可以删除该帖子。');
            return;
        }
        if (!confirm('确定删除该帖子？')) return;
        var self = this;
        var index = this.resources.findIndex(r => r.id === resourceId);
        if (index === -1) return;
        var client = window.supabaseClient;
        if (client) {
            client.from('resources').delete().eq('id', resourceId).then(function () {
                self.resources.splice(index, 1);
                self.render();
            }).catch(function () {
                self.resources.splice(index, 1);
                self.render();
            });
        } else {
            this.resources.splice(index, 1);
            this.saveResources();
            this.render();
        }
    }

    loadResources() {
        const stored = localStorage.getItem('resources');
        if (stored) {
            return JSON.parse(stored);
        }
        // 返回示例数据
        return [
            {
                id: '1',
                title: '用Python绘制桑基图',
                category: 'visualization',
                description: '学习如何使用Python的plotly库创建交互式桑基图，展示数据流向和关系。',
                link: 'https://example.com/sankey-tutorial',
                author: '数据新闻团队',
                likes: 12,
                bookmarks: 5,
                liked: false,
                bookmarked: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: '使用React构建数据新闻网站',
                category: 'webdev',
                description: '从零开始学习如何使用React框架搭建现代化的数据新闻展示网站。',
                link: 'https://example.com/react-tutorial',
                author: '前端开发专家',
                likes: 8,
                bookmarks: 3,
                liked: false,
                bookmarked: false,
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveResources() {
        localStorage.setItem('resources', JSON.stringify(this.resources));
    }

    getFilteredResources() {
        let filtered = this.resources;

        // 应用筛选
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(r => r.category === this.currentFilter);
        }

        // 应用搜索
        if (this.searchQuery) {
            filtered = filtered.filter(r => 
                r.title.toLowerCase().includes(this.searchQuery) ||
                r.description.toLowerCase().includes(this.searchQuery) ||
                r.author.toLowerCase().includes(this.searchQuery)
            );
        }

        return filtered;
    }

    render() {
        const container = document.getElementById('resourcesGrid');
        const filteredResources = this.getFilteredResources();

        if (filteredResources.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">暂无资源</p>
                    <p>成为第一个分享教程的人吧！</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredResources.map(resource => {
            const categoryLabels = {
                'visualization': '数据可视化',
                'webdev': '网页搭建',
                'analysis': '数据分析',
                'other': '其他'
            };
            const hasImage = resource.category === 'visualization' && resource.image;
            return `
                <div class="resource-card">
                    ${hasImage ? `<div class="resource-card-image"><img src="${resource.image}" alt="成品图" loading="lazy"></div>` : ''}
                    <div class="resource-card-header">
                        <div>
                            <div class="resource-card-title">${this.escapeHtml(resource.title)}</div>
                            <span class="resource-card-category">${categoryLabels[resource.category] || resource.category}</span>
                        </div>
                    </div>
                    <div class="resource-card-description">${this.escapeHtml(resource.description)}</div>
                    ${resource.link ? `<a href="${resource.link}" target="_blank" style="color: var(--primary-color); font-size: 0.875rem; text-decoration: none;">查看教程 →</a>` : ''}
                    <div class="resource-card-footer">
                        <div class="resource-card-author">by ${this.escapeHtml(resource.author)}</div>
                        <div class="resource-card-actions">
                            <button class="action-btn ${resource.liked ? 'liked' : ''}" 
                                    onclick="resourceManager.toggleLike('${resource.id}')" 
                                    title="点赞">
                                ❤️ ${resource.likes || 0}
                            </button>
                            ${this.canDeleteResource(resource) ? `
                            <button class="action-btn action-btn--delete" 
                                    onclick="resourceManager.deleteResource('${resource.id}')" 
                                    title="删除">
                                🗑
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

window.ResourceManager = ResourceManager;
