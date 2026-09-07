// 恢复完整功能 + 分享功能 + 自动播放背景音乐
Page({
  data: {
    animating: false,
    isDarkMode: false,
    isPlaying: false,
    audioReady: false // 音频系统是否就绪
  },

  onLoad() {
    console.log('首页开始加载');

    // 延迟执行需要wx API的操作
    setTimeout(() => {
      this.initPage();
    }, 200);

    // ======================
    // 启用右上角分享按钮
    if (typeof wx !== 'undefined') {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    // ======================
  },

  // 配置转发内容
  onShareAppMessage: function () {
    return {
      title: '心安安 — 跟着步骤做的工具', // 分享标题
      path: '/pages/index/index',           // 点击分享后打开的页面
      imageUrl: '/images/share-card.png'    // 可选自定义图片，如果没有可删除此行
    }
  },

  // 安全的页面初始化
  initPage() {
    try {
      if (typeof wx === 'undefined') {
        console.error('wx API 尚未准备好，延迟重试...');
        setTimeout(() => {
          this.initPage();
        }, 300);
        return;
      }

      const isDarkMode = wx.getStorageSync('isDarkMode') || false;
      this.setData({ isDarkMode });

      setTimeout(() => {
        this.setData({ animating: true });
      }, 1000);

      setTimeout(() => {
        this.checkAudioSystem();
      }, 1500);

      console.log('首页加载成功');
    } catch (error) {
      console.error('首页加载失败:', error);
    }
  },

  toggleTheme() {
    this.playClickSound();

    const newTheme = !this.data.isDarkMode;
    this.setData({ isDarkMode: newTheme });
    wx.setStorageSync('isDarkMode', newTheme);

    const app = getApp();
    if (app && app.updateGlobalTheme) {
      app.updateGlobalTheme(newTheme);
    } else if (app && app.globalData) {
      app.globalData.isDarkMode = newTheme;
    }

    wx.vibrateShort();
    console.log('主题已切换到:', newTheme ? '深色' : '浅色');
  },

  onShow() {
    if (typeof wx !== 'undefined') {
      try {
        const isDarkMode = wx.getStorageSync('isDarkMode') || false;
        if (isDarkMode !== this.data.isDarkMode) {
          this.setData({ isDarkMode });
        }

        if (this.data.audioReady) {
          this.initMusicState();
        }
      } catch (error) {
        console.error('onShow 执行失败:', error);
      }
    }
  },

  checkAudioSystem() {
    try {
      const app = getApp();
      if (app && app.globalData && app.globalData.audioManager) {
        console.log('音频系统检测成功，显示音频控件');
        this.setData({ audioReady: true });

        // ================================
        // 自动播放背景音乐
        const audioManager = app.globalData.audioManager;
        audioManager.playBackgroundMusic();
        this.setData({ isPlaying: true });
        console.log('背景音乐自动播放');
        // ================================

        this.initMusicState();
      } else {
        console.log('音频系统未就绪，隐藏音频控件');
        if (!this.audioRetryCount) this.audioRetryCount = 0;
        if (this.audioRetryCount < 3) {
          this.audioRetryCount++;
          setTimeout(() => {
            this.checkAudioSystem();
          }, 1000);
        } else {
          console.log('音频系统加载失败，停止重试');
        }
      }
    } catch (error) {
      console.error('音频系统检测失败:', error);
    }
  },

  initMusicState() {
    try {
      const app = getApp();
      if (app && app.globalData && app.globalData.audioManager) {
        const audioManager = app.globalData.audioManager;
        const isPlaying = audioManager.isBackgroundMusicPlaying();

        console.log('音频状态初始化，播放状态:', isPlaying);

        this.setData({ isPlaying: isPlaying });
      }
    } catch (error) {
      console.error('音频状态初始化失败:', error);
    }
  },

  toggleMusic() {
    try {
      const app = getApp();

      if (!app || !app.globalData || !app.globalData.audioManager) {
        wx.showToast({ title: '音频系统未就绪', icon: 'none' });
        return;
      }

      const audioManager = app.globalData.audioManager;
      this.playClickSound();
      wx.vibrateShort();

      if (this.data.isPlaying) {
        audioManager.pauseBackgroundMusic();
        this.setData({ isPlaying: false });
        wx.showToast({ title: '音乐已暂停', icon: 'none', duration: 1500 });
      } else {
        audioManager.playBackgroundMusic();
        this.setData({ isPlaying: true });
        wx.showToast({ title: '音乐开始播放', icon: 'none', duration: 1500 });
      }
    } catch (error) {
      console.error('音乐控制失败:', error);
      wx.showToast({ title: '音乐控制失败', icon: 'none' });
    }
  },

  startPractice() {
    this.playClickSound();
    if (typeof wx !== 'undefined') {
      try {
        wx.vibrateShort();
        wx.navigateTo({ url: '/pages/grounding/intro' });
      } catch (error) {
        console.error('导航失败:', error);
      }
    }
  },

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

  onUnload() {
    console.log('首页卸载');
  }
});
