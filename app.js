// 使用更安全的音频初始化方式
// const audioManager = require('./utils/audio.js');

App({
  globalData: {
    isDarkMode: false,
    audioManager: null // 稍后动态初始化
  },
  
  onLaunch: function() {
    console.log('GroundMe 应用启动');
    
    // 延迟执行所有需要wx API的操作，确保微信环境完全准备好
    setTimeout(() => {
      this.initApp();
    }, 100);
  },

  // 安全的应用初始化
  initApp: function() {
    try {
      console.log('开始安全初始化应用...');
      
      // 检查wx是否可用
      if (typeof wx === 'undefined') {
        console.error('wx API 尚未准备好，延迟重试...');
        setTimeout(() => {
          this.initApp();
        }, 500);
        return;
      }
      
      // 初始化主题
      const isDarkMode = wx.getStorageSync('isDarkMode') || false;
      this.globalData.isDarkMode = isDarkMode;
      
      // 延迟初始化音频系统
      setTimeout(() => {
        this.safeInitAudio();
      }, 1000);
      
      console.log('应用初始化成功，主题:', isDarkMode ? '深色' : '浅色');
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  },

  // 安全的音频初始化
  safeInitAudio: function() {
    try {
      console.log('=== 开始安全初始化音频系统 ===');
      
      // 动态加载简化版本的音频管理器
      console.log('正在加载简化版音频管理器模块...');
      const audioManager = require('./utils/audio-simple.js');
      
      if (!audioManager) {
        console.error('❌ 音频管理器加载失败');
        return;
      }
      
      console.log('✅ 音频管理器模块加载成功');
      console.log('音频管理器类型:', typeof audioManager);
      console.log('音频管理器方法:', Object.keys(audioManager));
      
      this.globalData.audioManager = audioManager;
      console.log('✅ 音频管理器已设置到globalData');
      
      // 继续原有的初始化流程
      console.log('开始调用initAudio...');
      this.initAudio();
      console.log('=== 安全初始化音频系统完成 ===');
    } catch (error) {
      console.error('❌ 音频系统安全初始化失败:', error);
      console.error('错误详情:', error.stack);
      // 即使音频初始化失败，也不影响应用正常运行
    }
  },

  // 初始化音频系统
  initAudio: function() {
    try {
      console.log('=== 开始初始化音频系统 ===');
      
      // 确保使用globalData中的audioManager
      const audioManager = this.globalData.audioManager;
      if (!audioManager) {
        console.error('❌ audioManager不存在于globalData中');
        return;
      }
      
      console.log('✅ audioManager获取成功');
      
      // 初始化单一背景音乐（使用古典音乐）
      console.log('准备初始化背景音乐...');
      const initResult = audioManager.initBackgroundMusic('/static/audio/classical-bg.mp3');
      console.log('背景音乐初始化结果:', initResult);
      
      // 初始化音效
      console.log('准备初始化音效...');
      const clickResult = audioManager.initSoundEffect('click', '/static/audio/click.mp3');
      console.log('点击音效初始化结果:', clickResult);
      
      const completeResult = audioManager.initSoundEffect('complete', '/static/audio/complete.mp3');
      console.log('完成音效初始化结果:', completeResult);
      
      // 从存储中恢复音频设置
      const audioSettings = wx.getStorageSync('audioSettings') || {};
      if (audioSettings.isMusicEnabled !== undefined) {
        audioManager.setMusicEnabled(audioSettings.isMusicEnabled);
      }
      if (audioSettings.isSoundEnabled !== undefined) {
        audioManager.setSoundEnabled(audioSettings.isSoundEnabled);
      }
      // 简化版不需要切换音乐，只有一首
      
      console.log('音频系统初始化成功');
    } catch (error) {
      console.error('音频系统初始化失败:', error);
    }
  },

  // 更新全局主题状态
  updateGlobalTheme: function(isDarkMode) {
    this.globalData.isDarkMode = isDarkMode;
    wx.setStorageSync('isDarkMode', isDarkMode);
    console.log('全局主题更新为:', isDarkMode ? '深色' : '浅色');
  },

  onHide: function() {
    // 应用隐藏时暂停背景音乐
    if (this.globalData.audioManager) {
      this.globalData.audioManager.pauseBackgroundMusic();
    }
  },

  onShow: function() {
    // 应用显示时不自动播放音乐，由各页面自行控制
    // 这样可以避免音乐状态混乱
    console.log('应用显示，不自动播放音乐');
  }
})
