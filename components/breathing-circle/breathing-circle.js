// components/breathing-circle/breathing-circle.js
Component({
  properties: {
    size: {
      type: Number,
      value: 300 // 默认大小，单位rpx
    },
    color: {
      type: String,
      value: '#A8DADC' // 默认颜色
    },
    borderColor: {
      type: String,
      value: '#FFFFFF' // 边框颜色
    },
    borderWidth: {
      type: Number,
      value: 2 // 边框宽度
    },
    active: {
      type: Boolean,
      value: true // 是否激活动画
    },
    inhaleDuration: {
      type: Number,
      value: 4000 // 吸气时长（毫秒）
    },
    exhaleDuration: {
      type: Number,
      value: 4000 // 呼气时长（毫秒）
    },
    text: {
      type: String,
      value: '' // 圆圈中显示的文字
    }
  },

  data: {
    scale: 0.95, // 初始缩放比例
    opacity: 0.8, // 初始透明度
    animating: false, // 是否正在动画
    phase: 'inhale', // 当前阶段：inhale 或 exhale
    phaseText: '吸气' // 阶段文字
  },

  lifetimes: {
    attached() {
      if (this.data.active) {
        this.startBreathing();
      }
    },
    
    detached() {
      this.stopBreathing();
    }
  },

  observers: {
    'active': function(active) {
      if (active && !this.data.animating) {
        this.startBreathing();
      } else if (!active && this.data.animating) {
        this.stopBreathing();
      }
    }
  },

  methods: {
    startBreathing() {
      this.setData({
        animating: true
      });
      this.breatheIn();
    },

    stopBreathing() {
      this.setData({
        animating: false
      });
      if (this.breatheTimer) {
        clearTimeout(this.breatheTimer);
        this.breatheTimer = null;
      }
    },

    breatheIn() {
      if (!this.data.animating) return;
      
      this.setData({
        phase: 'inhale',
        phaseText: '吸气'
      });
      
      const duration = this.data.inhaleDuration;
      const steps = 20; // 动画步数
      const stepTime = duration / steps;
      const initialScale = 0.95;
      const targetScale = 1.05;
      const initialOpacity = 0.8;
      const targetOpacity = 1;
      
      let currentStep = 0;
      
      const animate = () => {
        if (!this.data.animating) return;
        
        currentStep++;
        const progress = currentStep / steps;
        const newScale = initialScale + (targetScale - initialScale) * progress;
        const newOpacity = initialOpacity + (targetOpacity - initialOpacity) * progress;
        
        this.setData({
          scale: newScale,
          opacity: newOpacity
        });
        
        if (currentStep < steps) {
          this.breatheTimer = setTimeout(animate, stepTime);
        } else {
          this.breatheTimer = setTimeout(() => this.breatheOut(), 500); // 短暂停留
        }
      };
      
      animate();
    },
    
    breatheOut() {
      if (!this.data.animating) return;
      
      this.setData({
        phase: 'exhale',
        phaseText: '呼气'
      });
      
      const duration = this.data.exhaleDuration;
      const steps = 20; // 动画步数
      const stepTime = duration / steps;
      const initialScale = 1.05;
      const targetScale = 0.95;
      const initialOpacity = 1;
      const targetOpacity = 0.8;
      
      let currentStep = 0;
      
      const animate = () => {
        if (!this.data.animating) return;
        
        currentStep++;
        const progress = currentStep / steps;
        const newScale = initialScale + (targetScale - initialScale) * progress;
        const newOpacity = initialOpacity + (targetOpacity - initialOpacity) * progress;
        
        this.setData({
          scale: newScale,
          opacity: newOpacity
        });
        
        if (currentStep < steps) {
          this.breatheTimer = setTimeout(animate, stepTime);
        } else {
          this.breatheTimer = setTimeout(() => this.breatheIn(), 500); // 短暂停留
        }
      };
      
      animate();
    }
  }
})


