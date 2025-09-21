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
        
        // 平滑滚动到照片墙
        this.photoWallContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
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
        
        if (count <= 20) {
            // 圆形布局
            const radius = 200;
            const angleStep = (2 * Math.PI) / count;
            
            for (let i = 0; i < count; i++) {
                const angle = i * angleStep;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const rotateY = (angle * 180 / Math.PI) + 180;
                
                layouts.push({
                    transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotateY}deg)`
                });
            }
        } else if (count <= 50) {
            // 双层圆形布局
            const radius1 = 150;
            const radius2 = 250;
            const layer1Count = Math.ceil(count * 0.4);
            const layer2Count = count - layer1Count;
            
            // 内层
            for (let i = 0; i < layer1Count; i++) {
                const angle = (i * 2 * Math.PI) / layer1Count;
                const x = Math.cos(angle) * radius1;
                const z = Math.sin(angle) * radius1;
                const rotateY = (angle * 180 / Math.PI) + 180;
                
                layouts.push({
                    transform: `translate3d(${x}px, -30px, ${z}px) rotateY(${rotateY}deg)`
                });
            }
            
            // 外层
            for (let i = 0; i < layer2Count; i++) {
                const angle = (i * 2 * Math.PI) / layer2Count;
                const x = Math.cos(angle) * radius2;
                const z = Math.sin(angle) * radius2;
                const rotateY = (angle * 180 / Math.PI) + 180;
                
                layouts.push({
                    transform: `translate3d(${x}px, 30px, ${z}px) rotateY(${rotateY}deg)`
                });
            }
        } else {
            // 球形布局
            const radius = 200;
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            
            for (let i = 0; i < count; i++) {
                const y = 1 - (i / (count - 1)) * 2;
                const radiusAtY = Math.sqrt(1 - y * y) * radius;
                const theta = goldenAngle * i;
                
                const x = Math.cos(theta) * radiusAtY;
                const z = Math.sin(theta) * radiusAtY;
                const yPos = y * radius;
                
                const rotateY = (theta * 180 / Math.PI);
                const rotateX = (Math.asin(y) * 180 / Math.PI);
                
                layouts.push({
                    transform: `translate3d(${x}px, ${yPos}px, ${z}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`
                });
            }
        }
        
        return layouts;
    }

    createPhotoElement(image, layout) {
        const photo = document.createElement('div');
        photo.className = 'photo';
        photo.style.transform = layout.transform;
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.name;
        img.loading = 'lazy';
        
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

    resetPhotoWall() {
        this.images = [];
        this.updateImageCount();
        this.photoWallContainer.style.display = 'none';
        this.fileInput.value = '';
        this.rotation = { x: 0, y: 0 };
        this.photoWall.style.transform = '';
        this.photoWall.classList.remove('manual-control');
        
        // 滚动回上传区域
        document.querySelector('.upload-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
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