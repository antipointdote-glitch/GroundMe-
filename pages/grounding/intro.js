// pages/grounding/intro.js
Page({
  data: {
    isDarkMode: false,
    isMusicPlaying: false
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

    console.log('练习说明页面加载成功');
  },

  onShow() {
    // 每次显示页面时更新音乐播放状态
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

  // 开始练习
  startPractice() {
    // 播放按键音效
    this.playClickSound();
    // 触觉反馈
    wx.vibrateShort();

    // 跳转到自我确认页面
    wx.navigateTo({
      url: '/pages/grounding/safe',
      success: () => {
        console.log('跳转到自我确认页成功');
      },
      fail: (err) => {
        console.error('跳转到自我确认页失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 跳过说明
  skipIntro() {
    // 播放按键音效
    this.playClickSound();
    
    // 跳转到自我确认页面，保持完整的练习流程
    wx.navigateTo({
      url: '/pages/grounding/safe',
      success: () => {
        console.log('跳过说明，跳转到自我确认页成功');
      },
      fail: (err) => {
        console.error('跳转到自我确认页失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
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
  }
});