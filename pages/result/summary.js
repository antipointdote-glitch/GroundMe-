// pages/result/summary.js
Page({
  data: {
    isDarkMode: false
  },

  onLoad(options) {
    // 从全局状态或本地存储读取主题设置
    const app = getApp();
    const isDarkMode = (app.globalData && app.globalData.isDarkMode) || wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
    
    // 播放完成音效
    try {
      if (app && app.globalData && app.globalData.audioManager) {
        setTimeout(() => {
          app.globalData.audioManager.playSoundEffect('complete');
        }, 500); // 延迟播放，让页面先加载
      }
    } catch (error) {
      console.error('播放完成音效失败:', error);
    }
    
    console.log('总结页加载成功');
    
    // 可以添加一个简单的记录，表示用户完成了一次练习
    const completionTime = new Date().toISOString();
    const sessions = wx.getStorageSync('gm_sessions') || [];
    
    // 添加当前会话记录（只记录完成时间）
    sessions.unshift({
      timestamp: Date.now(),
      completionTime: completionTime
    });
    
    // 限制历史记录数量（例如最多保存10条）
    if (sessions.length > 10) {
      sessions.length = 10;
    }
    
    // 保存历史记录
    wx.setStorageSync('gm_sessions', sessions);
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

  // 重新开始
  restart() {
    // 播放按键音效
    this.playClickSound();
    // 触觉反馈
    wx.vibrateShort();
    
    // 直接跳转到练习介绍页
    wx.redirectTo({
      url: '/pages/grounding/intro',
      success: () => {
        console.log('重新开始练习');
      },
      fail: (err) => {
        console.error('跳转失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 结束
  finish() {
    // 播放按键音效
    this.playClickSound();
    
    // 直接返回首页
    wx.reLaunch({
      url: '/pages/index/index',
      success: () => {
        console.log('结束并返回首页成功');
      },
      fail: (err) => {
        console.error('结束并返回首页失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  }
})