// utils/audio-simple.js - 简化版音频管理器（单一背景音乐）
function createSimpleAudioManager() {
  var bgMusic = null; // 单一背景音乐实例
  var soundEffects = {}; // 音效管理
  var isMusicEnabled = true; // 音乐开关
  var isSoundEnabled = true; // 音效开关
  var musicVolume = 0.8; // 背景音乐音量（大幅提高）
  var soundVolume = 0.1; // 音效音量（降低，避免盖过音乐）

  // 初始化单一背景音乐
  function initBackgroundMusic(musicSrc) {
    try {
      console.log('初始化背景音乐:', musicSrc);
      
      // 清理现有音乐
      if (bgMusic) {
        try {
          bgMusic.destroy();
        } catch (e) {
          console.warn('销毁旧音频失败:', e);
        }
      }
      
      // 创建新的音频实例
      bgMusic = wx.createInnerAudioContext();
      bgMusic.src = musicSrc;
      bgMusic.loop = true;
      bgMusic.volume = musicVolume;
      
      // 添加事件监听
      bgMusic.onError(function(error) {
        console.error('背景音乐加载失败:', error);
      });
      
      bgMusic.onCanplay(function() {
        console.log('背景音乐可以播放');
      });
      
      console.log('✅ 背景音乐初始化成功');
      return true;
    } catch (error) {
      console.error('初始化背景音乐失败:', error);
      return false;
    }
  }

  // 初始化音效
  function initSoundEffect(name, src) {
    try {
      var audio = wx.createInnerAudioContext();
      audio.src = src;
      audio.volume = soundVolume;
      
      soundEffects[name] = audio;
      console.log('音效初始化成功:', name);
      return true;
    } catch (error) {
      console.error('初始化音效失败:', name, error);
      return false;
    }
  }

  // 播放背景音乐
  function playBackgroundMusic() {
    try {
      if (!isMusicEnabled || !bgMusic) {
        console.log('音乐被禁用或未初始化');
        return false;
      }
      
      bgMusic.volume = musicVolume;
      bgMusic.play();
      console.log('背景音乐开始播放');
      return true;
    } catch (error) {
      console.error('播放背景音乐失败:', error);
      return false;
    }
  }

  // 暂停背景音乐
  function pauseBackgroundMusic() {
    try {
      if (bgMusic) {
        bgMusic.pause();
        console.log('背景音乐已暂停');
        return true;
      }
      return false;
    } catch (error) {
      console.error('暂停背景音乐失败:', error);
      return false;
    }
  }

  // 播放音效
  function playSoundEffect(name) {
    try {
      if (!isSoundEnabled || !soundEffects[name]) {
        return false;
      }
      
      var sound = soundEffects[name];
      sound.stop(); // 先停止，避免重叠
      sound.play();
      console.log('播放音效:', name);
      return true;
    } catch (error) {
      console.error('播放音效失败:', name, error);
      return false;
    }
  }

  // 检查背景音乐是否正在播放
  function isBackgroundMusicPlaying() {
    try {
      return bgMusic && !bgMusic.paused;
    } catch (error) {
      console.error('检查播放状态失败:', error);
      return false;
    }
  }

  // 设置音乐开关
  function setMusicEnabled(enabled) {
    isMusicEnabled = enabled;
    if (!enabled && bgMusic) {
      bgMusic.pause();
    }
  }

  // 设置音效开关
  function setSoundEnabled(enabled) {
    isSoundEnabled = enabled;
  }
  
  // 设置音乐音量
  function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
    if (bgMusic) {
      bgMusic.volume = musicVolume;
    }
    console.log('音乐音量设置为:', musicVolume);
  }
  
  // 设置音效音量
  function setSoundVolume(volume) {
    soundVolume = Math.max(0, Math.min(1, volume));
    for (var key in soundEffects) {
      if (soundEffects[key]) {
        soundEffects[key].volume = soundVolume;
      }
    }
    console.log('音效音量设置为:', soundVolume);
  }

  // 销毁音频资源
  function destroy() {
    try {
      // 销毁背景音乐
      if (bgMusic) {
        bgMusic.destroy();
        bgMusic = null;
      }
      
      // 销毁音效
      for (var key in soundEffects) {
        if (soundEffects[key]) {
          soundEffects[key].destroy();
        }
      }
      soundEffects = {};
      
      console.log('音频资源销毁完成');
    } catch (error) {
      console.error('销毁音频资源失败:', error);
    }
  }

  // 返回公开的API
  return {
    initBackgroundMusic: initBackgroundMusic,
    initSoundEffect: initSoundEffect,
    playBackgroundMusic: playBackgroundMusic,
    pauseBackgroundMusic: pauseBackgroundMusic,
    playSoundEffect: playSoundEffect,
    isBackgroundMusicPlaying: isBackgroundMusicPlaying,
    setMusicEnabled: setMusicEnabled,
    setSoundEnabled: setSoundEnabled,
    setMusicVolume: setMusicVolume,
    setSoundVolume: setSoundVolume,
    destroy: destroy
  };
}

// 创建并导出音频管理器实例
module.exports = createSimpleAudioManager();
