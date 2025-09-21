class PhotoWall3D {
    constructor() {
        this.images = [];
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotation = { x: 0, y: 0 };
        this.autoRotateEnabled = true;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.imageCount = document.getElementById('imageCount');
        this.photoWallContainer = document.getElementById('photoWallContainer');
        this.photoWall = document.getElementById('photoWall');
        this.resetBtn = document.getElementById('resetBtn');
        this.autoRotateCheckbox = document.getElementById('autoRotate');
        this.speedControl = document.getElementById('speedControl');
        this.interactionHint = document.getElementById('interactionHint');
    }

    bindEvents() {
        // 文件上传事件
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖拽上传事件
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 3D交互事件
        this.photoWall.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        
        // 触摸事件
        this.photoWall.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.photoWall.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.photoWall.addEventListener('touchend', () => this.handleTouchEnd());
        
        // 控制按钮事件
        this.resetBtn.addEventListener('click', () => this.resetPhotoWall());
        this.autoRotateCheckbox.addEventListener('change', (e) => this.toggleAutoRotate(e.target.checked));
        this.speedControl.addEventListener('input', (e) => this.updateRotationSpeed(e.target.value));
        
        // 双击重置视角
        this.photoWall.addEventListener('dblclick', () => this.resetViewAngle());
        
        // 演示按钮
        const demoBtn = document.getElementById('demoBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.loadDemoImages());
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = Array.from(event.dataTransfer.files);
        this.processFiles(files);
    }

    async processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('请选择图片文件！');
            return;
        }

        if (this.images.length + imageFiles.length > 100) {
            alert('最多只能上传100张图片！');
            return;
        }

        // 显示加载状态
        this.showLoading();

        for (const file of imageFiles) {
            try {
                const imageData = await this.loadImage(file);
                this.images.push(imageData);
                this.updateImageCount();
            } catch (error) {
                console.error('加载图片失败:', error);
            }
        }

        this.hideLoading();

        if (this.images.length >= 10) {
            this.showPhotoWall();
        } else {
            alert(`至少需要10张图片才能显示3D照片墙，当前已上传${this.images.length}张`);
        }
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        src: e.target.result,
                        name: file.name,
                        width: img.width,
                        height: img.height
                    });
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    showLoading() {
        this.uploadArea.innerHTML = `
            <div class="upload-content">
                <div class="loading"></div>
                <p>正在加载图片...</p>
            </div>
        `;
    }

    hideLoading() {
        this.uploadArea.innerHTML = `
            <div class="upload-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <p>点击或拖拽上传图片</p>
                <p class="upload-hint">支持 JPG、PNG 格式，最多100张</p>
            </div>
        `;
    }

    updateImageCount() {
        this.imageCount.textContent = this.images.length;
    }

    showPhotoWall() {
        this.photoWallContainer.style.display = 'block';
        this.generatePhotoWall();
        this.createRomanticEffects();
        
        // 平滑滚动到照片墙
        this.photoWallContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    createRomanticEffects() {
        // 创建心形粒子效果
        this.createHeartParticles();
        
        // 创建光晕效果
        this.createGlowEffect();
    }

    createHeartParticles() {
        const container = document.querySelector('.photo-wall-wrapper');
        
        setInterval(() => {
            if (this.photoWallContainer.style.display === 'none') return;
            
            const heart = document.createElement('div');
            heart.innerHTML = '♥';
            heart.style.cssText = `
                position: absolute;
                color: rgba(255, 182, 193, 0.6);
                font-size: ${Math.random() * 20 + 10}px;
                left: ${Math.random() * 100}%;
                bottom: -50px;
                pointer-events: none;
                z-index: 0;
                animation: heartFloat ${Math.random() * 3 + 4}s linear forwards;
            `;
            
            container.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 7000);
        }, 2000);
    }

    createGlowEffect() {
        const wrapper = document.querySelector('.photo-wall-wrapper');
        
        // 添加动态光晕
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(255,182,193,0.1) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 0;
            animation: pulse 4s ease-in-out infinite;
        `;
        
        wrapper.appendChild(glow);
    }

    generatePhotoWall() {
        this.photoWall.innerHTML = '';
        const imageCount = this.images.length;
        
        // 计算3D布局参数
        const layouts = this.calculate3DLayouts(imageCount);
        
        this.images.forEach((image, index) => {
            const photoElement = this.createPhotoElement(image, layouts[index]);
            this.photoWall.appendChild(photoElement);
        });
    }

    calculate3DLayouts(count) {
        const layouts = [];
        
        if (count <= 12) {
            // 立方体布局 - 适合少量照片
            this.createCubeLayout(layouts, count);
        } else if (count <= 30) {
            // 多层立方体布局
            this.createMultiCubeLayout(layouts, count);
        } else if (count <= 60) {
            // 螺旋圆柱布局
            this.createSpiralLayout(layouts, count);
        } else {
            // 球形星系布局
            this.createGalaxyLayout(layouts, count);
        }
        
        return layouts;
    }

    createCubeLayout(layouts, count) {
        const size = 180;
        const positions = [
            // 前面
            ...this.getFacePositions(count, 0, 0, size, 0),
            // 右面
            ...this.getFacePositions(count, size, 0, 0, 90),
            // 后面
            ...this.getFacePositions(count, 0, 0, -size, 180),
            // 左面
            ...this.getFacePositions(count, -size, 0, 0, -90),
            // 上面
            ...this.getFacePositions(count, 0, -size, 0, -90, 'rotateX'),
            // 下面
            ...this.getFacePositions(count, 0, size, 0, 90, 'rotateX')
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            layouts.push(positions[i]);
        }
    }

    getFacePositions(totalCount, x, y, z, rotation, axis = 'rotateY') {
        const positions = [];
        const faceCount = Math.min(Math.ceil(totalCount / 6), 4);
        
        for (let i = 0; i < faceCount; i++) {
            const offsetX = (i % 2) * 80 - 40;
            const offsetY = Math.floor(i / 2) * 80 - 40;
            
            positions.push({
                transform: `translate3d(${x + offsetX}px, ${y + offsetY}px, ${z}px) ${axis}(${rotation}deg)`,
                delay: i * 0.1
            });
        }
        
        return positions;
    }

    createMultiCubeLayout(layouts, count) {
        const layers = Math.ceil(count / 12);
        const itemsPerLayer = Math.ceil(count / layers);
        
        for (let layer = 0; layer < layers; layer++) {
            const radius = 120 + layer * 80;
            const layerCount = Math.min(itemsPerLayer, count - layer * itemsPerLayer);
            const angleStep = (2 * Math.PI) / layerCount;
            const yOffset = (layer - layers / 2) * 60;
            
            for (let i = 0; i < layerCount; i++) {
                const angle = i * angleStep + layer * 0.5;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const rotateY = (angle * 180 / Math.PI) + 180;
                const rotateX = Math.sin(layer * 0.5) * 15;
                
                layouts.push({
                    transform: `translate3d(${x}px, ${yOffset}px, ${z}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
                    delay: (layer * layerCount + i) * 0.05
                });
            }
        }
    }

    createSpiralLayout(layouts, count) {
        const radius = 200;
        const height = 300;
        const spirals = 3;
        
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const angle = t * spirals * 2 * Math.PI;
            const currentRadius = radius * (0.5 + 0.5 * Math.cos(t * Math.PI));
            
            const x = Math.cos(angle) * currentRadius;
            const z = Math.sin(angle) * currentRadius;
            const y = (t - 0.5) * height;
            
            const rotateY = (angle * 180 / Math.PI) + 180;
            const rotateX = Math.sin(t * Math.PI * 2) * 20;
            const rotateZ = Math.cos(t * Math.PI * 4) * 10;
            
            layouts.push({
                transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
                delay: i * 0.03
            });
        }
    }

    createGalaxyLayout(layouts, count) {
        const arms = 4;
        const armSeparation = (2 * Math.PI) / arms;
        
        for (let i = 0; i < count; i++) {
            const armIndex = i % arms;
            const positionInArm = Math.floor(i / arms);
            const totalInArm = Math.ceil(count / arms);
            
            const t = positionInArm / totalInArm;
            const armAngle = armIndex * armSeparation;
            const spiralAngle = armAngle + t * Math.PI * 1.5;
            
            const radius = 100 + t * 200;
            const x = Math.cos(spiralAngle) * radius;
            const z = Math.sin(spiralAngle) * radius;
            const y = (Math.random() - 0.5) * 100 + Math.sin(t * Math.PI * 2) * 50;
            
            const rotateY = (spiralAngle * 180 / Math.PI) + 180;
            const rotateX = (Math.random() - 0.5) * 40;
            const rotateZ = (Math.random() - 0.5) * 30;
            
            layouts.push({
                transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
                delay: i * 0.02
            });
        }
    }

    createPhotoElement(image, layout) {
        const photo = document.createElement('div');
        photo.className = 'photo';
        photo.style.transform = layout.transform;
        photo.style.opacity = '0';
        photo.style.animation = `float 6s ease-in-out infinite ${(layout.delay || 0)}s`;
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.name;
        img.loading = 'lazy';
        
        // 添加进入动画
        setTimeout(() => {
            photo.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            photo.style.opacity = '1';
        }, (layout.delay || 0) * 1000);
        
        // 添加点击放大效果
        photo.addEventListener('click', () => this.showImageModal(image));
        
        photo.appendChild(img);
        return photo;
    }

    showImageModal(image) {
        // 创建模态框显示大图
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = image.src;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        modal.appendChild(img);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // 鼠标交互
    handleMouseDown(event) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        this.photoWall.classList.add('manual-control');
    }

    handleMouseMove(event) {
        if (!this.isDragging) return;
        
        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;
        
        this.rotation.y += deltaX * 0.5;
        this.rotation.x -= deltaY * 0.5;
        
        this.updatePhotoWallTransform();
        
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    handleMouseUp() {
        this.isDragging = false;
        if (this.autoRotateEnabled) {
            this.photoWall.classList.remove('manual-control');
        }
    }

    // 触摸交互
    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            this.photoWall.classList.add('manual-control');
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (!this.isDragging || event.touches.length !== 1) return;
        
        const deltaX = event.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = event.touches[0].clientY - this.previousMousePosition.y;
        
        this.rotation.y += deltaX * 0.5;
        this.rotation.x -= deltaY * 0.5;
        
        this.updatePhotoWallTransform();
        
        this.previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    handleTouchEnd() {
        this.isDragging = false;
        if (this.autoRotateEnabled) {
            this.photoWall.classList.remove('manual-control');
        }
    }

    updatePhotoWallTransform() {
        this.photoWall.style.transform = `rotateX(${this.rotation.x}deg) rotateY(${this.rotation.y}deg)`;
    }

    toggleAutoRotate(enabled) {
        this.autoRotateEnabled = enabled;
        if (enabled) {
            this.photoWall.classList.remove('manual-control');
            this.photoWall.style.transform = '';
            this.rotation = { x: 0, y: 0 };
        } else {
            this.photoWall.classList.add('manual-control');
        }
    }

    updateRotationSpeed(speed) {
        const duration = 25 / parseFloat(speed);
        this.photoWall.style.animationDuration = `${duration}s`;
    }

    resetViewAngle() {
        this.rotation = { x: 0, y: 0 };
        this.photoWall.style.transition = 'transform 1s ease';
        this.photoWall.style.transform = '';
        
        setTimeout(() => {
            this.photoWall.style.transition = '';
        }, 1000);
        
        // 显示提示
        this.showNotification('视角已重置 🎯');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 105, 180, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 0.9rem;
            z-index: 1000;
            backdrop-filter: blur(10px);
            animation: slideInOut 3s ease forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    resetPhotoWall() {
        this.images = [];
        this.updateImageCount();
        this.photoWallContainer.style.display = 'none';
        this.fileInput.value = '';
        this.rotation = { x: 0, y: 0 };
        this.photoWall.style.transform = '';
        this.photoWall.classList.remove('manual-control');
        
        // 清理特效元素
        const hearts = document.querySelectorAll('.photo-wall-wrapper div[style*="heartFloat"]');
        hearts.forEach(heart => heart.remove());
        
        // 滚动回上传区域
        document.querySelector('.upload-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    async loadDemoImages() {
        this.showNotification('正在生成演示图片... 🎨');
        
        // 生成彩色渐变演示图片
        const colors = [
            ['#FF6B6B', '#4ECDC4'], ['#45B7D1', '#96CEB4'], ['#FFECD2', '#FCB69F'],
            ['#A8EDEA', '#FED6E3'], ['#D299C2', '#FEF9D7'], ['#89F7FE', '#66A6FF'],
            ['#FDA085', '#F6D365'], ['#F093FB', '#F5576C'], ['#4FACFE', '#00F2FE'],
            ['#43E97B', '#38F9D7'], ['#FA709A', '#FEE140'], ['#A770EF', '#CF8BF3'],
            ['#FEB692', '#EA5455'], ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'],
            ['#4facfe', '#00f2fe'], ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140']
        ];

        this.images = [];
        
        for (let i = 0; i < Math.min(colors.length, 18); i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            
            // 创建渐变背景
            const gradient = ctx.createLinearGradient(0, 0, 300, 300);
            gradient.addColorStop(0, colors[i][0]);
            gradient.addColorStop(1, colors[i][1]);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 300, 300);
            
            // 添加装饰元素
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(150, 150, 80, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加心形或其他图案
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            const symbols = ['💕', '💖', '💗', '💘', '💝', '💞', '💟', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❣️', '💋'];
            ctx.fillText(symbols[i % symbols.length], 150, 170);
            
            // 转换为图片数据
            const dataURL = canvas.toDataURL('image/png');
            this.images.push({
                src: dataURL,
                name: `demo-${i + 1}.png`,
                width: 300,
                height: 300
            });
        }
        
        this.updateImageCount();
        this.showPhotoWall();
        this.showNotification('演示图片加载完成！ ✨');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PhotoWall3D();
});

// 防止页面刷新时丢失图片的警告
window.addEventListener('beforeunload', (event) => {
    const photoWall = document.getElementById('photoWallContainer');
    if (photoWall && photoWall.style.display !== 'none') {
        event.preventDefault();
        event.returnValue = '确定要离开吗？上传的图片将会丢失。';
    }
});