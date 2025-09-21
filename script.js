class LoveDaysCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.setupDateConstraints();
        this.startFloatingHearts();
    }

    initializeElements() {
        // 输入元素
        this.inputSection = document.getElementById('inputSection');
        this.resultSection = document.getElementById('resultSection');
        this.name1Input = document.getElementById('name1');
        this.name2Input = document.getElementById('name2');
        this.startDateInput = document.getElementById('startDate');
        this.photoUploadArea = document.getElementById('photoUploadArea');
        this.photoInput = document.getElementById('photoInput');
        this.calculateBtn = document.getElementById('calculateBtn');
        
        // 结果显示元素
        this.displayName1 = document.getElementById('displayName1');
        this.displayName2 = document.getElementById('displayName2');
        this.daysNumber = document.getElementById('daysNumber');
        this.photoDisplay = document.getElementById('photoDisplay');
        this.couplePhoto = document.getElementById('couplePhoto');
        
        // 按钮元素
        this.resetBtn = document.getElementById('resetBtn');
        this.shareBtn = document.getElementById('shareBtn');
        
        // 浮动爱心容器
        this.floatingHearts = document.getElementById('floatingHearts');
    }

    bindEvents() {
        // 计算按钮事件
        this.calculateBtn.addEventListener('click', () => this.calculateLoveDays());
        
        // 重置按钮事件
        this.resetBtn.addEventListener('click', () => this.resetForm());
        
        // 分享按钮事件
        this.shareBtn.addEventListener('click', () => this.shareLove());
        
        // 照片上传事件
        this.photoUploadArea.addEventListener('click', () => this.photoInput.click());
        this.photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
        
        // 拖拽上传事件
        this.photoUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.photoUploadArea.addEventListener('drop', (e) => this.handlePhotoDrop(e));
        this.photoUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        
        // 输入框焦点事件，增加浪漫特效
        [this.name1Input, this.name2Input, this.startDateInput].forEach(input => {
            input.addEventListener('focus', () => this.addSparkleEffect(input));
            input.addEventListener('blur', () => this.removeSparkleEffect(input));
        });
        
        // 回车键快捷计算
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.inputSection.style.display !== 'none') {
                this.calculateLoveDays();
            }
        });
    }

    setupDateConstraints() {
        // 设置日期输入的最大值为今天
        const today = new Date().toISOString().split('T')[0];
        this.startDateInput.setAttribute('max', today);
        
        // 设置默认日期为一年前
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        this.startDateInput.value = oneYearAgo.toISOString().split('T')[0];
    }

    calculateLoveDays() {
        const name1 = this.name1Input.value.trim();
        const name2 = this.name2Input.value.trim();
        const startDate = this.startDateInput.value;

        // 验证输入
        if (!name1 || !name2) {
            this.showNotification('请输入两个人的名字 💕', 'warning');
            return;
        }

        if (!startDate) {
            this.showNotification('请选择在一起的日期 📅', 'warning');
            return;
        }

        const startDateTime = new Date(startDate);
        const today = new Date();
        
        if (startDateTime > today) {
            this.showNotification('日期不能是未来哦 😊', 'warning');
            return;
        }

        // 计算天数
        const timeDiff = today.getTime() - startDateTime.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        // 显示加载动画
        this.showLoadingAnimation();

        // 延迟显示结果，增加仪式感
        setTimeout(() => {
            this.showResults(name1, name2, daysDiff, startDateTime);
        }, 1500);
    }

    showLoadingAnimation() {
        this.calculateBtn.innerHTML = `
                <div class="loading"></div>
            <span>正在计算我们的美好时光...</span>
        `;
        this.calculateBtn.disabled = true;
    }

    showResults(name1, name2, days, startDate) {
        // 更新显示内容
        this.displayName1.textContent = name1;
        this.displayName2.textContent = name2;
        
        // 动画数字显示
        this.animateNumber(this.daysNumber, 0, days, 2000);
        
        // 生成里程碑事件
        this.generateMilestones(startDate, days);
        
        // 切换到结果界面
        this.inputSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        this.resultSection.classList.add('fade-in');
        
        // 添加庆祝特效
        this.triggerCelebration();
        
        // 显示成功通知
        this.showNotification(`🎉 你们已经相爱了 ${days} 天！`, 'success');
        
        // 重置计算按钮
        this.resetCalculateButton();
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const range = end - start;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (range * easeOutQuart));
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    generateMilestones(startDate, totalDays) {
        const milestones = this.calculateMilestones(startDate, totalDays);
        const milestoneGrid = document.querySelector('.milestone-grid');
        
        // 清空现有内容
        milestoneGrid.innerHTML = '';
        
        // 生成里程碑卡片
        milestones.forEach((milestone, index) => {
            const card = document.createElement('div');
            card.className = 'milestone-card';
            card.style.animationDelay = `${index * 0.2}s`;
            card.innerHTML = `
                <div class="milestone-icon">${milestone.icon}</div>
                <div class="milestone-content">
                    <div class="milestone-title">${milestone.title}</div>
                    <div class="milestone-date">${milestone.date}</div>
                    <div class="milestone-days">${milestone.days}</div>
                </div>
            `;
            milestoneGrid.appendChild(card);
        });
    }

    calculateMilestones(startDate, totalDays) {
        const milestones = [];
        const start = new Date(startDate);
        
        // 100天纪念日
        if (totalDays >= 100) {
            const day100 = new Date(start);
            day100.setDate(day100.getDate() + 100);
            milestones.push({
                icon: '💯',
                title: '100天纪念日',
                date: this.formatDate(day100),
                days: `${totalDays - 100}天前`
            });
        }
        
        // 半年纪念日
        if (totalDays >= 182) {
            const day182 = new Date(start);
            day182.setDate(day182.getDate() + 182);
            milestones.push({
                icon: '💝',
                title: '半年纪念日',
                date: this.formatDate(day182),
                days: `${totalDays - 182}天前`
            });
        }
        
        // 一年纪念日
        if (totalDays >= 365) {
            const day365 = new Date(start);
            day365.setDate(day365.getDate() + 365);
            milestones.push({
                icon: '🎉',
                title: '一周年纪念日',
                date: this.formatDate(day365),
                days: `${totalDays - 365}天前`
            });
        }
        
        // 如果没有足够的里程碑，添加一些通用的
        if (milestones.length === 0) {
            milestones.push(
                {
                    icon: '💕',
                    title: '第一次牵手',
                    date: this.formatDate(start),
                    days: '美好的开始'
                },
                {
                    icon: '🌟',
                    title: '第一个月',
                    date: this.formatDate(new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)),
                    days: totalDays > 30 ? `${totalDays - 30}天前` : '即将到来'
                }
            );
        }
        
        return milestones.slice(0, 3); // 最多显示3个里程碑
    }

    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
        return date.toLocaleDateString('zh-CN', options);
    }

    triggerCelebration() {
        // 创建庆祝特效
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.createCelebrationHeart();
            }, i * 100);
        }
        
        // 屏幕闪烁效果
        document.body.style.animation = 'celebrationFlash 0.1s ease-in-out 3';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 300);
    }

    createCelebrationHeart() {
        const heart = document.createElement('div');
        heart.innerHTML = ['💖', '💕', '💗', '💘', '💝', '💞'][Math.floor(Math.random() * 6)];
        heart.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 2 + 1}rem;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            pointer-events: none;
            z-index: 9999;
            animation: celebrationHeartBurst 3s ease-out forwards;
        `;
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 3000);
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.couplePhoto.src = e.target.result;
                this.photoDisplay.style.display = 'block';
                this.photoDisplay.classList.add('fade-in');
                this.showNotification('照片上传成功！💝', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            this.showNotification('请选择图片文件', 'warning');
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.photoUploadArea.style.borderColor = '#ff69b4';
        this.photoUploadArea.style.background = 'rgba(255, 255, 255, 0.7)';
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.photoUploadArea.style.borderColor = 'rgba(255, 182, 193, 0.5)';
        this.photoUploadArea.style.background = 'rgba(255, 255, 255, 0.3)';
    }

    handlePhotoDrop(event) {
        event.preventDefault();
        this.handleDragLeave(event);
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.photoInput.files = files;
            this.handlePhotoUpload({ target: { files } });
        }
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

    resetForm() {
        // 重置输入
        this.name1Input.value = '';
        this.name2Input.value = '';
        this.photoInput.value = '';
        this.couplePhoto.src = '';
        this.photoDisplay.style.display = 'none';
        
        // 重置日期为一年前
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        this.startDateInput.value = oneYearAgo.toISOString().split('T')[0];
        
        // 切换界面
        this.resultSection.style.display = 'none';
        this.inputSection.style.display = 'block';
        this.inputSection.classList.add('fade-in');
        
        // 重置按钮状态
        this.resetCalculateButton();
        
        this.showNotification('已重置，可以重新计算啦 🔄', 'info');
    }

    resetCalculateButton() {
        this.calculateBtn.innerHTML = `
            <span>💖</span>
            <span>开始计算我们的爱</span>
            <span>💖</span>
        `;
        this.calculateBtn.disabled = false;
    }

    shareLove() {
        const name1 = this.displayName1.textContent;
        const name2 = this.displayName2.textContent;
        const days = this.daysNumber.textContent;
        
        const shareText = `💕 ${name1} & ${name2} 已经相爱了 ${days} 天！每一天都充满爱意~ 🌹`;
        
        // 尝试使用Web Share API
        if (navigator.share) {
            navigator.share({
                title: '我们的恋爱天数',
                text: shareText,
                url: window.location.href
            }).then(() => {
                this.showNotification('分享成功！💕', 'success');
            }).catch(() => {
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        // 复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('文本已复制到剪贴板！📋', 'success');
            }).catch(() => {
                this.showShareModal(text);
            });
        } else {
            this.showShareModal(text);
        }
    }

    showShareModal(text) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 20px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 20px; color: #ff69b4;">分享我们的爱 💕</h3>
            <p style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 10px; word-break: break-all;">${text}</p>
            <button onclick="this.parentNode.parentNode.remove()" style="background: #ff69b4; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer;">关闭</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// 添加CSS动画定义
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrationHeartBurst {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0.5) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes celebrationFlash {
        0%, 100% { background-color: transparent; }
        50% { background-color: rgba(255, 182, 193, 0.3); }
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
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new LoveDaysCalculator();
    
    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
});
