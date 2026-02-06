// 浮动气球效果
(function() {
    const container = document.getElementById('balloonsContainer');
    if (!container) return;

    // 配置
    const config = {
        balloonCount: 12, // 每次显示的气球数量
        minSpeed: 0.3,    // 最小速度
        maxSpeed: 1.2,    // 最大速度
        sizes: ['small', 'medium', 'large'], // 气球大小
        // 气球图片文件夹路径
        imageFolder: 'images/balloon_images/',
        // 可用的照片列表（手动维护，添加新照片时在这里添加文件名）
        availableImages: [
            'balloon1.jpg',
            'balloon2.jpg',
            'balloon3.jpg',
            'balloon4.jpg',
            'balloon5.jpg',
            'balloon6.jpg',
            'balloon7.jpg',
            'balloon8.jpg',
            'balloon9.jpg',
            'balloon10.jpg',
            'balloon11.jpg',
            'balloon12.jpg',
            'balloon13.jpg',
            'balloon14.jpg',
            'balloon15.jpg',
            'balloon16.jpg',
            'balloon17.jpg',
            'balloon18.jpg',
            'balloon19.jpg',
            'balloon20.jpg',
            'balloon21.jpg',
            'balloon22.jpg'
            // 添加更多照片时，在这里继续添加
            // 'balloon23.jpg',
            // 'balloon24.jpg',
            // ...
        ],
        images: [] // 将在初始化时随机选择
    };

    // 随机选择12张不重复的照片
    function selectRandomImages() {
        const count = Math.min(config.balloonCount, config.availableImages.length);
        const shuffled = [...config.availableImages].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        return selected.map(img => config.imageFolder + img);
    }

    // 初始化
    function init() {
        if (config.availableImages.length === 0) {
            console.error('❌ 错误：没有配置任何照片！请在 availableImages 数组中添加照片文件名');
            container.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">未配置照片！</div>';
            return;
        }
        
        // 随机选择12张照片
        config.images = selectRandomImages();
        
        // 创建气球
        createBalloons();
    }

    // 创建所有气球
    function createBalloons() {

    // 气球类
    class Balloon {
        constructor(index) {
            this.element = document.createElement('div');
            this.element.className = 'balloon';
            
            // 随机大小
            const size = config.sizes[Math.floor(Math.random() * config.sizes.length)];
            this.element.classList.add(`size-${size}`);
            
            // 设置图片
            const img = document.createElement('img');
            img.src = config.images[index % config.images.length];
            img.alt = `Team Photo ${index + 1}`;
            this.element.appendChild(img);
            
            // 先添加到容器（这样才能获取正确的尺寸）
            container.appendChild(this.element);
            
            // 获取气球尺寸（现在在 DOM 中了）
            this.updateSize();
            
            // 获取容器尺寸
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            
            // 初始位置（随机，确保在边界内）
            this.x = Math.random() * Math.max(0, containerWidth - this.width);
            this.y = Math.random() * Math.max(0, containerHeight - this.height);
            
            // 随机速度和方向
            const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            // 设置初始位置
            this.updatePosition();
            
            // 点击事件（可选）
            this.element.addEventListener('click', () => {
                this.bounce();
            });
        }
        
        updateSize() {
            const rect = this.element.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
        }
        
        updatePosition() {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        }
        
        // 弹跳效果（点击时）
        bounce() {
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = (Math.random() - 0.5) * 3;
        }
        
        // 更新位置
        update() {
            // 移动
            this.x += this.vx;
            this.y += this.vy;
            
            // 获取容器的实际尺寸
            const containerRect = container.getBoundingClientRect();
            const maxX = containerRect.width - this.width;
            const maxY = containerRect.height - this.height;
            
            // 强制边界检测和反弹
            // 左边界
            if (this.x < 0) {
                this.x = 0;
                this.vx = Math.abs(this.vx);
            }
            
            // 右边界
            if (this.x > maxX) {
                this.x = maxX;
                this.vx = -Math.abs(this.vx);
            }
            
            // 上边界
            if (this.y < 0) {
                this.y = 0;
                this.vy = Math.abs(this.vy);
            }
            
            // 下边界
            if (this.y > maxY) {
                this.y = maxY;
                this.vy = -Math.abs(this.vy);
            }
            
            this.updatePosition();
        }
    }

        const balloons = [];
        const actualCount = Math.min(config.balloonCount, config.images.length);
        
        for (let i = 0; i < actualCount; i++) {
            balloons.push(new Balloon(i));
        }

        // 碰撞检测
        function checkCollisions() {
            for (let i = 0; i < balloons.length; i++) {
                for (let j = i + 1; j < balloons.length; j++) {
                    const b1 = balloons[i];
                    const b2 = balloons[j];
                    
                    const dx = (b1.x + b1.width / 2) - (b2.x + b2.width / 2);
                    const dy = (b1.y + b1.height / 2) - (b2.y + b2.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = (b1.width + b2.width) / 2;
                    
                    if (distance < minDistance) {
                        // 碰撞！交换速度
                        const tempVx = b1.vx;
                        const tempVy = b1.vy;
                        b1.vx = b2.vx;
                        b1.vy = b2.vy;
                        b2.vx = tempVx;
                        b2.vy = tempVy;
                        
                        // 分离气球，避免重叠
                        const overlap = minDistance - distance;
                        const angle = Math.atan2(dy, dx);
                        b1.x += Math.cos(angle) * overlap / 2;
                        b1.y += Math.sin(angle) * overlap / 2;
                        b2.x -= Math.cos(angle) * overlap / 2;
                        b2.y -= Math.sin(angle) * overlap / 2;
                    }
                }
            }
        }

        // 动画循环
        function animate() {
            balloons.forEach(balloon => balloon.update());
            checkCollisions();
            requestAnimationFrame(animate);
        }

        // 开始动画
        animate();

        // 窗口大小改变时更新气球尺寸
        window.addEventListener('resize', () => {
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            
            balloons.forEach(balloon => {
                balloon.updateSize();
                // 确保气球在窗口内
                balloon.x = Math.min(balloon.x, containerWidth - balloon.width);
                balloon.y = Math.min(balloon.y, containerHeight - balloon.height);
                balloon.updatePosition();
            });
        });
    }

    // 启动初始化
    init();
})();

