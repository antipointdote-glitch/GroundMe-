// pages/grounding/safe.js
Page({
  data: {
    isDarkMode: false,
    isMusicPlaying: false,
    userName: '', // 用户名称，可以从存储获取
    userLocation: '', // 用户位置
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
    
    // 获取用户自定义信息（如果有的话）
    const userName = wx.getStorageSync('gm_userName') || '';
    const userLocation = wx.getStorageSync('gm_userLocation') || '';
    
    this.setData({ 
      isDarkMode,
      isMusicPlaying,
      userName,
      userLocation
    });
    
    console.log('自我确认页加载成功');
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

  startPractice() {
    // 播放按键音效
    this.playClickSound();
    // 触觉反馈
    wx.vibrateShort();
    
    // 跳转到深呼吸引导页
    wx.navigateTo({
      url: '/pages/breathing/guide',
      success: (res) => {
        console.log('跳转到深呼吸引导页成功');
      },
      fail: (err) => {
        console.error('跳转失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  onBack() {
    // 播放按键音效
    this.playClickSound();
    wx.navigateBack();
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
})