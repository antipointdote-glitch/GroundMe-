// pages/practice/steps.js
Page({
  data: {
    currentStep: 1,
    totalSteps: 5,
    isDarkMode: false,
    isMusicPlaying: false,
    
    // 接地练习步骤数据
    groundingSteps: [
      {
        number: 5,
        sense: "观察",
        instruction: "请在心中说出你能看见的5样东西",
        examples: ["桌子", "窗户", "手机", "杯子", "墙壁"],
        prompt: "我看见...",
      },
      {
        number: 4,
        sense: "触摸",
        instruction: "请在心中说出你能触摸到的4样东西",
        examples: ["椅子的扶手", "衣服的质感", "桌面", "手机"],
        prompt: "我能摸到...",
      },
      {
        number: 3,
        sense: "倾听",
        instruction: "请在心中说出你能听见的3种声音",
        examples: ["空调声", "汽车声", "鸟叫声"],
        prompt: "我听见...",
      },
      {
        number: 2,
        sense: "闻",
        instruction: "请在心中说出你能闻到的2种气味",
        examples: ["空气清新剂", "咖啡香味"],
        prompt: "我闻到...",
      },
      {
        number: 1,
        sense: "尝味道",
        instruction: "请在心中说出你能尝到的1种味道",
        examples: ["口中的薄荷味", "茶的余香"],
        prompt: "我尝到...",
      },
    ]
  },

  onLoad(options) {
    // 获取当前步骤
    if (options.step) {
      this.setData({
        currentStep: parseInt(options.step)
      });
    }
    
    // 从全局状态或本地存储读取主题设置
    const app = getApp();
    const isDarkMode = (app.globalData && app.globalData.isDarkMode) || wx.getStorageSync('isDarkMode') || false;
    
    // 检查音乐播放状态
    let isMusicPlaying = false;
    if (app.globalData && app.globalData.audioManager) {
      isMusicPlaying = app.globalData.audioManager.isBackgroundMusicPlaying();
    }
    
    this.setData({ 
      isDarkMode,
      isMusicPlaying
    });
    
    console.log('感官练习页面加载成功，当前步骤：', this.data.currentStep);
  },
  
  // 播放按键音效
  playClickSound() {
    try {
      const app = getApp();
      if (app && app.globalData && app.globalData.audioManager) {
        app.globalData.audioManager.playSoundEffect('click');
      }
    } catch (error) {
      console.error('播放按键音效失败:', error);
    }
  },

  // 下一步
  nextStep() {
    if (this.data.currentStep < this.data.totalSteps) {
      // 播放按键音效
      this.playClickSound();
      
      // 添加过渡动画效果
      this.setData({
        currentStep: this.data.currentStep + 1
      });
      
      // 触觉反馈
      wx.vibrateShort();
    } else {
      // 完成所有步骤，跳转到总结页
      wx.navigateTo({
        url: '/pages/result/summary',
        fail: (err) => {
          console.error('跳转失败', err);
          wx.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          });
        }
      });
    }
  },

  // 更新音乐播放状态
  updateMusicStatus() {
    const app = getApp();
    let isMusicPlaying = false;
    if (app.globalData && app.globalData.audioManager) {
      isMusicPlaying = app.globalData.audioManager.isBackgroundMusicPlaying();
    }
    this.setData({ isMusicPlaying });
  },

  // 切换音乐播放状态
  toggleMusic() {
    // 播放按键音效
    this.playClickSound();
    
    const app = getApp();
    if (app.globalData && app.globalData.audioManager) {
      const audioManager = app.globalData.audioManager;
      const isPlaying = audioManager.isBackgroundMusicPlaying();
      
      if (isPlaying) {
        // 暂停音乐
        audioManager.pauseBackgroundMusic();
        this.setData({ isMusicPlaying: false });
        console.log('音乐已暂停');
      } else {
        // 播放音乐
        audioManager.playBackgroundMusic('/static/audio/classical-bg.mp3');
        this.setData({ isMusicPlaying: true });
        console.log('音乐开始播放');
      }
    } else {
      wx.showToast({
        title: '音频系统未初始化',
        icon: 'none'
      });
    }
  },

  // 页面显示时更新音乐状态
  onShow() {
    this.updateMusicStatus();
  },
  
  // 返回
  goBack() {
    // 播放按键音效
    this.playClickSound();
    
    wx.navigateBack({
      delta: 1,
      fail: () => {
        // 如果返回失败，跳转到首页
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    });
  }
})