# 项目概述

本项目是一个基于 **纯前端技术栈** 的浪漫恋爱纪念册应用，集成了3D照片展示、恋爱天数计算、照片上传管理和社交分享等功能。

## 技术栈

- **前端**: HTML
- **存储**: 浏览器本地存储 (LocalStorage)
- **部署**: 静态文件部署，支持单文件部署

## 开发规范

- **响应式设计** 确保多设备兼容
- 代码格式化使用一致的缩进和命名规范

## 项目结构

```
/tengxuncli_activity
├── /assets - 静态资源文件
│   ├── /images - 示例图片
│   └── /styles - 样式组件
├── /components - 核心功能组件  
│   ├── Enhanced3DPhotoWall.js - 3D照片墙组件
│   ├── PhotoUploader.js - 照片上传组件
│   ├── LoveCalculator.js - 恋爱天数计算组件
│   └── ShareGenerator.js - 分享图片生成组件
├── /utils - 工具函数库
│   ├── dateUtils.js - 日期处理工具
│   ├── canvasUtils.js - Canvas绘图工具
│   └── animationUtils.js - 动画效果工具
└── /dist - 构建输出目录
```

## 核心功能模块

### 1. 恋爱天数计算模块

```javascript
class LoveCalculator {
    constructor(startDate) {
        this.startDate = new Date(startDate);
        this.updateInterval = null;
    }
    
    calculateDays() {
        const today = new Date();
        const timeDiff = today.getTime() - this.startDate.getTime();
        return Math.floor(timeDiff / (1000 * 3600 * 24));
    }
    
    animateNumber(element, start, end, duration = 2000) {
        // 数字动画实现
        const startTime = performance.now();
        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (end - start) * easeOut);
            element.textContent = currentValue;
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}
```

### 2. 3D照片墙渲染模块

```javascript
class Enhanced3DPhotoWall {
    constructor(container) {
        this.container = container;
        this.images = [];
        this.rotationSpeed = 1;
        this.autoRotate = true;
    }
    
    generate3DLayout(imageCount) {
        const layouts = [];
        const radius = 450;
        const angleStep = 360 / Math.min(imageCount, 8);
        
        for (let i = 0; i < Math.min(imageCount, 8); i++) {
            const angle = i * angleStep;
            const radian = (angle * Math.PI) / 180;
            const x = Math.sin(radian) * radius;
            const z = Math.cos(radian) * radius;
            
            layouts.push({
                transform: `translateZ(${z}px) translateX(${x}px) rotateY(${-angle}deg)`,
                delay: i * 0.2
            });
        }
        return layouts;
    }
    
    createPhotoCard(image, layout, index) {
        const card = document.createElement('div');
        card.className = 'card-3d';
        card.style.transform = layout.transform;
        
        // 添加3D效果和交互
        card.addEventListener('mouseenter', () => {
            card.style.transform += ' scale(1.2) translateZ(120px)';
        });
        
        return card;
    }
}
```

### 3. 分享图片生成模块

```javascript
class ShareGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    async generateShareImage(coupleData, selectedPhoto) {
        // 设置画布尺寸
        this.canvas.width = 800;
        this.canvas.height = 1200;
        
        // 绘制背景渐变
        this.drawBackground();
        
        // 绘制内容区域
        this.drawTopSection(coupleData);
        if (selectedPhoto) {
            await this.drawMainPhoto(selectedPhoto);
        }
        this.drawBottomSection(coupleData);
        
        return this.canvas.toDataURL('image/png');
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(0.5, '#fecfef');
        gradient.addColorStop(1, '#ffd1dc');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
```

```

## 技术亮点


### 1. 响应式设计
- 移动端优化的触摸交互
- 自适应不同屏幕尺寸和设备像素比
- 渐进增强的用户体验

### 2. 性能优化
- 图片懒加载和分批渲染
- 防抖和节流优化用户交互
- 内存管理和定时器清理

## 浏览器兼容性

- **现代浏览器**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **移动端**: iOS Safari 12+, Chrome Mobile 70+
- **核心功能**: 支持ES6+、CSS3 Transform、Canvas API
- **降级方案**: 不支持3D时自动切换到2D模式

## 部署说明

### 静态部署
项目支持完全静态部署，无需后端服务器：

# 生成 love-calculator-enhanced.html
# 可直接上传到任何支持静态文件的服务器
```


## 项目特色

1. **零依赖**: 不依赖任何第三方框架或库
2. **单文件部署**: 支持所有代码打包成一个HTML文件
3. **移动优先**: 专为移动设备优化的交互体验  
4. **社交分享**: 一键生成适合朋友圈分享的精美图片
5. **个性化**: 支持自定义情侣信息和照片选择

## 开发总结

本项目展示了如何使用纯前端技术栈构建一个功能完整、体验优秀的Web应用。通过合理的架构设计和性能优化，实现了复杂的3D渲染、图像处理和交互功能，同时保持了良好的浏览器兼容性和部署便利性。
