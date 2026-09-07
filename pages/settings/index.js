// pages/settings/index.js
Page({
  data: {
    isDarkMode: false,
    musicEnabled: true,
    soundEnabled: true,
    vibrateEnabled: true,
    animationEnabled: true,
    musicVolume: 30,
    soundVolume: 80
  },

  onLoad() {
    // 从全局状态或本地存储读取主题设置
    const app = getApp();
    const isDarkMode = (app.globalData && app.globalData.isDarkMode) || wx.getStorageSync('isDarkMode') || false;
    
    // 读取音频设置
    const musicEnabled = wx.getStorageSync('musicEnabled');
    const soundEnabled = wx.getStorageSync('soundEnabled');
    const vibrateEnabled = wx.getStorageSync('vibrateEnabled');
    const animationEnabled = wx.getStorageSync('animationEnabled');
    const musicVolume = wx.getStorageSync('musicVolume') || 30;
    const soundVolume = wx.getStorageSync('soundVolume') || 80;
    
    
    this.setData({
      isDarkMode,
      musicEnabled: musicEnabled !== '' ? musicEnabled : true,
      soundEnabled: soundEnabled !== '' ? soundEnabled : true,
      vibrateEnabled: vibrateEnabled !== '' ? vibrateEnabled : true,
      animationEnabled: animationEnabled !== '' ? animationEnabled : true,
      musicVolume: Math.round(musicVolume * 100),
      soundVolume: Math.round(soundVolume * 100)
    });
    
    console.log('设置页加载成功');
  },

  // 背景音乐开关
  onMusicToggle(e) {
    const enabled = e.detail.value;
    this.setData({ musicEnabled: enabled });
    
    // 保存设置
    wx.setStorageSync('musicEnabled', enabled);
    
    // 应用设置
    const app = getApp();
    if (app.globalData.audioManager) {
      app.globalData.audioManager.toggleMusic(enabled);
    }
    
    // 播放音效
    this.playClickSound();
  },

  // 音效开关
  onSoundToggle(e) {
    const enabled = e.detail.value;
    this.setData({ soundEnabled: enabled });
    
    // 保存设置
    wx.setStorageSync('soundEnabled', enabled);
    
    // 应用设置
    const app = getApp();
    if (app.globalData.audioManager) {
      app.globalData.audioManager.toggleSound(enabled);
    }
    
    // 播放音效（如果开启）
    if (enabled) {
      this.playClickSound();
    }
  },

  // 震动反馈开关
  onVibrateToggle(e) {
    const enabled = e.detail.value;
    this.setData({ vibrateEnabled: enabled });
    
    // 保存设置
    wx.setStorageSync('vibrateEnabled', enabled);
    
    // 震动反馈
    if (enabled) {
      wx.vibrateShort();
    }
    
    this.playClickSound();
  },

  // 动画效果开关
  onAnimationToggle(e) {
    const enabled = e.detail.value;
    this.setData({ animationEnabled: enabled });
    
    // 保存设置
    wx.setStorageSync('animationEnabled', enabled);
    
    this.playClickSound();
    
    if (this.data.vibrateEnabled) {
      wx.vibrateShort();
    }
  },

  // 音乐音量调节
  onMusicVolumeChange(e) {
    const volume = e.detail.value;
    this.setData({ musicVolume: volume });
    
    // 转换为0-1范围
    const normalizedVolume = volume / 100;
    
    // 保存设置
    wx.setStorageSync('musicVolume', normalizedVolume);
    
    // 应用设置
    const app = getApp();
    if (app.globalData.audioManager) {
      app.globalData.audioManager.setMusicVolume(normalizedVolume);
    }
  },

  // 音效音量调节
  onSoundVolumeChange(e) {
    const volume = e.detail.value;
    this.setData({ soundVolume: volume });
    
    // 转换为0-1范围
    const normalizedVolume = volume / 100;
    
    // 保存设置
    wx.setStorageSync('soundVolume', normalizedVolume);
    
    // 应用设置
    const app = getApp();
    if (app.globalData.audioManager) {
      app.globalData.audioManager.setSoundVolume(normalizedVolume);
    }
    
    // 播放测试音效
    this.playClickSound();
  },

  // 播放点击音效
  playClickSound() {
    const app = getApp();
    if (app.globalData.audioManager && this.data.soundEnabled) {
      app.globalData.audioManager.playSoundEffect('click');
    }
  },


  // 返回
  goBack() {
    this.playClickSound();
    
    if (this.data.vibrateEnabled) {
      wx.vibrateShort();
    }
    
    wx.navigateBack();
  }
});