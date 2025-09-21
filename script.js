class RomanticPhotoWall {
    constructor() {
        this.images = [];
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotation = { x: 0, y: 0 };
        this.autoRotateEnabled = true;
        this.loveStartDate = null;
        this.coupleName1 = '';
        this.coupleName2 = '';
        
        this.initializeElements();
        this.bindEvents();
        this.setupDateConstraints();
        this.startFloatingHearts();
    }

    initializeElements() {
        // 界面元素
        this.loveInfoSection = document.getElementById('loveInfoSection');
        this.photoWallContainer = document.getElementById('photoWallContainer');
        
        // 输入元素
        this.name1Input = document.getElementById('name1');
        this.name2Input = document.getElementById('name2');
        this.startDateInput = document.getElementById('startDate');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.imageCount = document.getElementById('imageCount');
        this.createWallBtn = document.getElementById('createWallBtn');
        this.demoBtn = document.getElementById('demoBtn');
        
        // 显示元素
        this.displayName1 = document.getElementById('displayName1');
        this.displayName2 = document.getElementById('displayName2');
        this.daysNumber = document.getElementById('daysNumber');
        this.photoWall = document.getElementById('photoWall');
        this.interactionHint = document.getElementById('interactionHint');
        
        // 控制元素
        this.resetBtn = document.getElementById('resetBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.autoRotateCheckbox = document.getElementById('autoRotate');
        this.speedControl = document.getElementById('speedControl');
        
        // 分享相关元素
        this.shareCanvas = document.getElementById('shareCanvas');
        this.shareModal = document.getElementById('shareModal');
        this.sharePreview = document.getElementById('sharePreview');
        this.closeShareModal = document.getElementById('closeShareModal');
        this.downloadShare = document.getElementById('downloadShare');
        this.copyShare = document.getElementById('copyShare');
        
        // 浮动爱心容器
        this.floatingHearts = document.getElementById('floatingHearts');
    }

    bindEvents() {
        // 照片上传事件
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖拽上传事件
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 创建照片墙按钮
        this.createWallBtn.addEventListener('click', () => this.createPhotoWall());
        
        // 演示按钮
        this.demoBtn.addEventListener('click', () => this.loadDemoImages());
        
        // 输入框变化事件
        [this.name1Input, this.name2Input, this.startDateInput].forEach(input => {
            input.addEventListener('input', () => this.validateInputs());
            input.addEventListener('focus', () => this.addSparkleEffect(input));
            input.addEventListener('blur', () => this.removeSparkleEffect(input));
        });
        
        // 3D交互事件
        this.photoWall.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        
        // 触摸事件
        this.photoWall.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.photoWall.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.photoWall.addEventListener('touchend', () => this.handleTouchEnd());
        
        // 控制按钮事件
        this.resetBtn.addEventListener('click', () => this.resetToStart());
        this.shareBtn.addEventListener('click', () => this.generateShareImage());
        this.autoRotateCheckbox.addEventListener('change', (e) => this.toggleAutoRotate(e.target.checked));
        this.speedControl.addEventListener('input', (e) => this.updateRotationSpeed(e.target.value));
        
        // 双击重置视角
        this.photoWall.addEventListener('dblclick', () => this.resetViewAngle());
        
        // 分享模态框事件
        this.closeShareModal.addEventListener('click', () => this.closeShare());
        this.downloadShare.addEventListener('click', () => this.downloadShareImage());
        this.copyShare.addEventListener('click', () => this.copyShareImage());
        this.shareModal.addEventListener('click', (e) => {
            if (e.target === this.shareModal) this.closeShare();
        });
        
        // 回车键快捷操作
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.loveInfoSection.style.display !== 'none') {
                this.createPhotoWall();
            }
        });
    }

    setupDateConstraints() {
        const today = new Date().toISOString().split('T')[0];
        this.startDateInput.setAttribute('max', today);
        
        // 设置默认日期为一年前
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        this.startDateInput.value = oneYearAgo.toISOString().split('T')[0];
    }

    validateInputs() {
        const name1 = this.name1Input.value.trim();
        const name2 = this.name2Input.value.trim();
        const startDate = this.startDateInput.value;
        const hasImages = this.images.length >= 10;
        
        const isValid = name1 && name2 && startDate && hasImages;
        this.createWallBtn.disabled = !isValid;
        
        if (isValid) {
            this.createWallBtn.classList.add('ready');
        } else {
            this.createWallBtn.classList.remove('ready');
        }
    }

    // 文件处理方法
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
            this.showNotification('请选择图片文件！', 'warning');
            return;
        }

        if (this.images.length + imageFiles.length > 100) {
            this.showNotification('最多只能上传100张图片！', 'warning');
            return;
        }

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
        this.validateInputs();

        if (this.images.length >= 10) {
            this.showNotification(`太棒了！已上传${this.images.length}张照片 💕`, 'success');
        } else {
            this.showNotification(`还需要${10 - this.images.length}张照片才能创建照片墙`, 'info');
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
        this.uploadArea.querySelector('.upload-content').innerHTML = `
            <div class="loading"></div>
            <p>正在加载图片...</p>
        `;
    }

    hideLoading() {
        this.uploadArea.querySelector('.upload-content').innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <p>上传我们的美好回忆</p>
            <p class="upload-hint">支持 JPG、PNG 格式，至少10张照片</p>
            <button type="button" id="demoBtn" class="demo-btn">📸 加载演示图片</button>
        `;
        
        // 重新绑定演示按钮事件
        const newDemoBtn = document.getElementById('demoBtn');
        if (newDemoBtn) {
            newDemoBtn.addEventListener('click', () => this.loadDemoImages());
        }
    }

    updateImageCount() {
        this.imageCount.textContent = this.images.length;
    }

    async loadDemoImages() {
        this.showNotification('正在生成演示图片... 🎨', 'info');
        
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
            
            const dataURL = canvas.toDataURL('image/png');
            this.images.push({
                src: dataURL,
                name: `demo-${i + 1}.png`,
                width: 300,
                height: 300
            });
        }
        
        this.updateImageCount();
        this.validateInputs();
        this.showNotification('演示图片加载完成！ ✨', 'success');
    }

    createPhotoWall() {
        const name1 = this.name1Input.value.trim();
        const name2 = this.name2Input.value.trim();
        const startDate = this.startDateInput.value;

        if (!name1 || !name2) {
            this.showNotification('请输入两个人的名字 💕', 'warning');
            return;
        }

        if (!startDate) {
            this.showNotification('请选择在一起的日期 📅', 'warning');
            return;
        }

        if (this.images.length < 10) {
            this.showNotification('至少需要10张照片才能创建照片墙', 'warning');
            return;
        }

        // 保存恋爱信息
        this.coupleName1 = name1;
        this.coupleName2 = name2;
        this.loveStartDate = new Date(startDate);

        // 显示加载
        this.createWallBtn.innerHTML = `
            <div class="loading"></div>
            <span>正在创建我们的回忆墙...</span>
        `;
        this.createWallBtn.disabled = true;

        // 延迟切换界面
        setTimeout(() => {
            this.showPhotoWall();
        }, 1500);
    }

    showPhotoWall() {
        // 更新恋爱信息显示
        this.displayName1.textContent = this.coupleName1;
        this.displayName2.textContent = this.coupleName2;
        
        // 计算并动画显示恋爱天数
        const today = new Date();
        const timeDiff = today.getTime() - this.loveStartDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        this.animateNumber(this.daysNumber, 0, daysDiff, 2000);
        
        // 生成3D照片墙
        this.generatePhotoWall();
        
        // 切换界面
        this.loveInfoSection.style.display = 'none';
        this.photoWallContainer.style.display = 'block';
        this.photoWallContainer.classList.add('fade-in');
        
        // 创建浪漫特效
        this.createRomanticEffects();
        
        // 显示成功通知
        this.showNotification(`🎉 我们的回忆墙创建成功！相爱了 ${daysDiff} 天！`, 'success');
        
        // 滚动到照片墙
        this.photoWallContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const range = end - start;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (range * easeOutQuart));
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    generatePhotoWall() {
        this.photoWall.innerHTML = '';
        const imageCount = this.images.length;
        
        let layoutType = '';
        if (imageCount <= 12) layoutType = '立方体布局';
        else if (imageCount <= 30) layoutType = '多层立方体布局';
        else if (imageCount <= 60) layoutType = '螺旋圆柱布局';
        else layoutType = '星系布局';
        
        this.showNotification(`正在生成${layoutType} - ${imageCount}张照片 ✨`, 'info');
        
        const layouts = this.calculate3DLayouts(imageCount);
        
        const batchSize = 10;
        let currentBatch = 0;
        
        const loadBatch = () => {
            const start = currentBatch * batchSize;
            const end = Math.min(start + batchSize, imageCount);
            
            for (let i = start; i < end; i++) {
                if (layouts[i]) {
                    const photoElement = this.createPhotoElement(this.images[i], layouts[i]);
                    this.photoWall.appendChild(photoElement);
                }
            }
            
            currentBatch++;
            if (currentBatch * batchSize < imageCount) {
                setTimeout(loadBatch, 100);
            }
        };
        
        loadBatch();
        
        setTimeout(() => {
            this.showNotification(`${layoutType}生成完成！🎉`, 'success');
        }, 2000);
    }

    calculate3DLayouts(count) {
        const layouts = [];
        
        if (count <= 12) {
            // 立方体布局
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * 2 * Math.PI;
                const x = Math.cos(angle) * 200;
                const z = Math.sin(angle) * 200;
                const y = (Math.sin(i * 0.8) * 100);
                
                layouts.push({
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${angle * 180 / Math.PI}deg)`,
                    delay: i * 0.1
                });
            }
        } else {
            // 球形布局
            for (let i = 0; i < count; i++) {
                const phi = Math.acos(1 - 2 * i / count);
                const theta = Math.PI * (1 + Math.sqrt(5)) * i;
                const radius = 250;
                
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                
                layouts.push({
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${theta * 180 / Math.PI}deg)`,
                    delay: i * 0.05
                });
            }
        }
        
        return layouts;
    }

    createPhotoElement(image, layout) {
        const photo = document.createElement('div');
        photo.className = 'photo';
        photo.style.transform = layout.transform;
        photo.style.opacity = '0';
        
        const maxDelay = Math.min((layout.delay || 0), 2);
        photo.style.animation = `float 6s ease-in-out infinite ${maxDelay}s`;
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.name;
        img.loading = 'lazy';
        
        setTimeout(() => {
            photo.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            photo.style.opacity = '1';
        }, maxDelay * 200);
        
        photo.addEventListener('click', () => this.showImageModal(image));
        
        photo.appendChild(img);
        return photo;
    }

    showImageModal(image) {
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

    // 3D交互方法
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
        const duration = 40 / parseFloat(speed);
        this.photoWall.style.animationDuration = `${duration}s`;
    }

    resetViewAngle() {
        this.rotation = { x: 0, y: 0 };
        this.photoWall.style.transition = 'transform 1s ease';
        this.photoWall.style.transform = '';
        
        setTimeout(() => {
            this.photoWall.style.transition = '';
        }, 1000);
        
        this.showNotification('视角已重置 🎯', 'info');
    }

    // 分享功能
    async generateShareImage() {
        this.showNotification('正在生成分享图片... 🎨', 'info');
        
        const canvas = this.shareCanvas;
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 1200;
        
        // 创建渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#ffeef8');
        gradient.addColorStop(0.3, '#ffc1d9');
        gradient.addColorStop(0.6, '#ff91ba');
        gradient.addColorStop(1, '#f093fb');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 添加标题
        ctx.fillStyle = '#ff1493';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💕 我们的爱情回忆墙', canvas.width / 2, 100);
        
        // 添加情侣名字
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#ff69b4';
        ctx.fillText(`${this.coupleName1} & ${this.coupleName2}`, canvas.width / 2, 180);
        
        // 添加天数
        const today = new Date();
        const timeDiff = today.getTime() - this.loveStartDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        ctx.font = 'bold 72px sans-serif';
        ctx.fillStyle = '#ff1493';
        ctx.fillText(daysDiff, canvas.width / 2, 300);
        
        ctx.font = 'bold 32px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('天', canvas.width / 2 + 80, 300);
        ctx.fillText('我们已经相爱了', canvas.width / 2 - 120, 250);
        
        // 添加底部文字
        ctx.fillStyle = '#666';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('每一张照片都是我们的美好回忆 💕', canvas.width / 2, canvas.height - 80);
        
        // 显示分享预览
        const dataURL = canvas.toDataURL('image/png');
        this.sharePreview.src = dataURL;
        this.shareModal.style.display = 'flex';
        
        this.showNotification('分享图片生成完成！💕', 'success');
    }

    closeShare() {
        this.shareModal.style.display = 'none';
    }

    downloadShareImage() {
        const dataURL = this.sharePreview.src;
        const link = document.createElement('a');
        link.download = `我们的爱情回忆墙_${this.coupleName1}&${this.coupleName2}.png`;
        link.href = dataURL;
        link.click();
        
        this.showNotification('图片下载成功！📥', 'success');
    }

    async copyShareImage() {
        try {
            const canvas = this.shareCanvas;
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    this.showNotification('图片已复制到剪贴板！📋', 'success');
                } catch (error) {
                    this.fallbackCopy();
                }
            });
        } catch (error) {
            this.fallbackCopy();
        }
    }

    fallbackCopy() {
        const shareText = `💕 ${this.coupleName1} & ${this.coupleName2} 的爱情回忆墙\n我们已经相爱了 ${this.daysNumber.textContent} 天！\n每一天都充满爱意~ 🌹`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('文本已复制到剪贴板！📋', 'success');
            }).catch(() => {
                this.showNotification('复制失败，请手动截图分享', 'warning');
            });
        } else {
            this.showNotification('复制失败，请手动截图分享', 'warning');
        }
    }

    // 重置功能
    resetToStart() {
        this.images = [];
        this.updateImageCount();
        this.photoWallContainer.style.display = 'none';
        this.loveInfoSection.style.display = 'block';
        this.loveInfoSection.classList.add('fade-in');
        
        // 重置输入
        this.name1Input.value = '';
        this.name2Input.value = '';
        this.fileInput.value = '';
        
        // 重置日期
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        this.startDateInput.value = oneYearAgo.toISOString().split('T')[0];
        
        // 重置3D状态
        this.rotation = { x: 0, y: 0 };
        this.photoWall.style.transform = '';
        this.photoWall.classList.remove('manual-control');
        
        // 重置按钮状态
        this.createWallBtn.innerHTML = `
            <span>💖</span>
            <span>创建我们的3D回忆墙</span>
            <span>💖</span>
        `;
        this.createWallBtn.disabled = true;
        
        this.validateInputs();
        this.showNotification('已重置，可以重新开始啦 🔄', 'info');
        
        // 滚动到顶部
        this.loveInfoSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    // 浪漫特效
    createRomanticEffects() {
        this.createHeartParticles();
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

    startFloatingHearts() {
        setInterval(() => {
            this.createFloatingHeart();
        }, 3000);
    }

    createFloatingHeart() {
        const hearts = ['💕', '💖', '💗', '💘', '💝', '💞', '💟', '❤️'];
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
        heart.style.fontSize = (Math.random() * 0.8 + 1) + 'rem';
        
        this.floatingHearts.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 7000);
    }

    addSparkleEffect(element) {
        const sparkles = document.createElement('div');
        sparkles.className = 'sparkles';
        sparkles.innerHTML = '✨';
        sparkles.style.cssText = `
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 1.2rem;
            animation: sparkle 1s ease-in-out infinite;
            pointer-events: none;
        `;
        
        element.parentNode.style.position = 'relative';
        element.parentNode.appendChild(sparkles);
    }

    removeSparkleEffect(element) {
        const sparkles = element.parentNode.querySelector('.sparkles');
        if (sparkles) {
            sparkles.remove();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: slideInOut 4s ease forwards;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = 'rgba(76, 175, 80, 0.9)';
                notification.style.color = 'white';
                break;
            case 'warning':
                notification.style.background = 'rgba(255, 152, 0, 0.9)';
                notification.style.color = 'white';
                break;
            default:
                notification.style.background = 'rgba(255, 105, 180, 0.9)';
                notification.style.color = 'white';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
}

// 添加CSS动画定义
const style = document.createElement('style');
style.textContent = `
    @keyframes heartFloat {
        0% {
            transform: translateY(100vh) scale(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(1) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.1;
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    @keyframes sparkle {
        0%, 100% {
            opacity: 0;
            transform: scale(0);
        }
        50% {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideInOut {
        0% {
            transform: translateX(100%);
            opacity: 0;
        }
        15%, 85% {
            transform: translateX(0);
            opacity: 1;
        }
        100% {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .create-wall-btn.ready {
        animation: glow 2s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
        from {
            box-shadow: 0 10px 30px rgba(255, 105, 180, 0.4);
        }
        to {
            box-shadow: 0 15px 40px rgba(255, 105, 180, 0.7);
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new RomanticPhotoWall();
    
    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
});
