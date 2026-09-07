// pages/breathing/guide.js
Page({
  data: {
    isDarkMode: false,
    isMusicPlaying: false,
    instruction: '准备开始',
    animating: false,
    isTransitioning: false,
    started: false,
    completed: false,
    showCounter: false,
    currentCount: 0,
    completedCount: 0, // 已完成的呼吸次数
    totalCount: 3,
    breathingPhase: 'prepare', // prepare, inhale, hold, exhale, rest
    isBreathing: false, // 是否正在进行一轮呼吸
    showNextButton: false, // 是否显示"下一次呼吸"按钮
    instructions: {
      prepare: '准备开始第一次深呼吸',
      inhale: '慢慢吸气',
      hold: '屏住呼吸',
      exhale: '慢慢呼气',
      rest: '很好，休息一下'
    }
  },

  onLoad(options) {
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
    
    // 延迟播放背景音乐，避免影响页面加载和动画
    setTimeout(() => {
      this.playBackgroundMusic();
    }, 500);
    
    console.log('深呼吸引导页面加载成功');
  },

  startBreathing() {
    // 播放按键音效
    this.playClickSound();
    // 触觉反馈
    wx.vibrateShort();
    
    this.setData({
      started: true,
      showCounter: true,
      currentCount: 1,
      instruction: '准备开始第一次深呼吸'
    });
    
    // 减短准备时间
    setTimeout(() => {
      this.startSingleBreath();
    }, 800);
  },

  startSingleBreath() {
    this.setData({
      isBreathing: true,
      showNextButton: false,
      animating: true
    });

    // 使用requestAnimationFrame优化动画性能
    // 吸气阶段 (4秒)
    wx.nextTick(() => {
      this.setData({
        breathingPhase: 'inhale'
      });
    });
    
    this.breathTimer1 = setTimeout(() => {
      // 屏气阶段 (2秒)
      wx.nextTick(() => {
        this.setData({
          breathingPhase: 'hold'
        });
      });
      
      this.breathTimer2 = setTimeout(() => {
        // 呼气阶段 (4秒，减短呼气时间)
        wx.nextTick(() => {
          this.setData({
            breathingPhase: 'exhale'
          });
        });
        
        this.breathTimer3 = setTimeout(() => {
          // 完成一次呼吸
          this.completeSingleBreath();
        }, 4000);
      }, 2000);
    }, 4000);
  },

  completeSingleBreath() {
    const newCompletedCount = this.data.completedCount + 1;
    
    this.setData({
      isBreathing: false,
      breathingPhase: 'rest',
      animating: false,
      completedCount: newCompletedCount
    });

    if (newCompletedCount < this.data.totalCount) {
      // 还有剩余次数，显示休息状态
      this.setData({
        instruction: '很好，休息一下，准备好后点击继续'
      });
    } else {
      // 完成所有呼吸
      this.setData({
        completed: true,
        instruction: '很好，你已经完成了深呼吸练习'
      });
    }
  },

  nextBreath() {
    // 如果正在进行呼吸或已达到总次数，不执行
    if (this.data.isBreathing || this.data.completedCount >= this.data.totalCount) {
      return;
    }

    // 播放按键音效
    this.playClickSound();
    // 触觉反馈
    wx.vibrateShort();
    
    // 增加当前进行中的计数
    this.setData({
      currentCount: this.data.currentCount + 1,
      instruction: `准备开始第${this.data.currentCount + 1}次深呼吸`
    });

    // 减短准备时间，让用户更快进入下一次呼吸
    setTimeout(() => {
      this.startSingleBreath();
    }, 800);
  },

  nextStep() {
    // 播放按键音效
    this.playClickSound();
    
    // 跳转到5-4-3-2-1感官练习
    wx.navigateTo({
      url: '/pages/practice/steps',
      success: () => {
        console.log('跳转到感官练习页成功');
      },
      fail: (err) => {
        console.error('跳转到感官练习页失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  goHome() {
    // 播放按键音效
    this.playClickSound();
    
    // 跳转到首页
    wx.reLaunch({
      url: '/pages/index/index',
      success: () => {
        console.log('跳转到首页成功');
      },
      fail: (err) => {
        console.error('跳转到首页失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  skipBreathing() {
    // 播放按键音效
    this.playClickSound();
    
    // 直接跳转到5-4-3-2-1感官练习
    wx.navigateTo({
      url: '/pages/practice/steps',
      success: () => {
        console.log('跳过深呼吸，跳转到感官练习页成功');
      },
      fail: (err) => {
        console.error('跳转到感官练习页失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  onBack() {
    // 播放按键音效
    this.playClickSound();
    wx.navigateBack();
  },

  // 播放背景音乐（仅在已经播放的情况下继续）
  playBackgroundMusic() {
    const app = getApp();
    if (app.globalData && app.globalData.audioManager) {
      const audioManager = app.globalData.audioManager;
      
      // 检查音乐是否已经在播放，只有在播放状态下才继续播放
      const isPlaying = audioManager.isBackgroundMusicPlaying();
      
      if (isPlaying) {
        // 在呼吸页面设置适中的音量
        audioManager.setMusicVolume(0.6); // 保持较高音量，营造氛围
        console.log('呼吸页面继续播放背景音乐，音量: 0.6');
      } else {
        console.log('呼吸页面：音乐未在播放，不自动开始播放');
      }
    }
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

  // 页面显示时恢复音乐
  onShow() {
    this.playBackgroundMusic();
    this.updateMusicStatus();
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

  // 清理定时器
  clearBreathTimers() {
    if (this.breathTimer1) {
      clearTimeout(this.breathTimer1);
      this.breathTimer1 = null;
    }
    if (this.breathTimer2) {
      clearTimeout(this.breathTimer2);
      this.breathTimer2 = null;
    }
    if (this.breathTimer3) {
      clearTimeout(this.breathTimer3);
      this.breathTimer3 = null;
    }
  },

  onUnload() {
    // 清理定时器，防止内存泄漏
    this.clearBreathTimers();
    
    // 恢复正常音量
    const app = getApp();
    if (app.globalData && app.globalData.audioManager) {
      app.globalData.audioManager.setMusicVolume(0.8); // 恢复默认高音量
      console.log('呼吸页面卸载，音量已恢复到默认值');
    }
    
    console.log('呼吸页面卸载，定时器已清理');
  },

  onHide() {
    // 页面隐藏时也清理定时器
    this.clearBreathTimers();
  }
})