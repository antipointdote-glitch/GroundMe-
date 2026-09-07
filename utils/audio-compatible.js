// utils/audio-compatible.js - 兼容性更好的音频管理工具
function createAudioManager() {
  var bgMusic = null; // 当前播放的背景音乐
  var bgMusicList = {}; // 背景音乐列表，使用对象而非Map
  var currentBgMusicId = 'forest'; // 当前选中的背景音乐ID
  var soundEffects = {}; // 音效管理，使用对象而非Map
  var isMusicEnabled = true; // 音乐开关
  var isSoundEnabled = true; // 音效开关
  var musicVolume = 0.4; // 背景音乐音量（提高到合适水平）
  var soundVolume = 0.15; // 音效音量（大幅降低，避免盖过音乐）

  // 初始化多个背景音乐
  function initBackgroundMusicList(musicList) {
    try {
      console.log('开始初始化背景音乐列表:', musicList);
      
      // 清理现有音乐
      for (var key in bgMusicList) {
        if (bgMusicList[key] && bgMusicList[key].audio) {
          try {
            bgMusicList[key].audio.destroy();
          } catch (e) {
            console.warn('销毁音频失败:', e);
          }
        }
      }
      bgMusicList = {};
      
      // 初始化音乐列表
      if (musicList && Array.isArray(musicList)) {
        for (var i = 0; i < musicList.length; i++) {
          var musicInfo = musicList[i];
          try {
            var audio = wx.createInnerAudioContext();
            audio.src = musicInfo.src;
            audio.loop = true;
            audio.volume = musicVolume;
            
            // 添加音频事件监听，使用闭包保存musicInfo
            (function(info) {
              audio.onError(function(error) {
                console.error('音频加载失败:', info.name, error);
              });
              
              audio.onCanplay(function() {
                console.log('音频可以播放:', info.name);
              });
            })(musicInfo);
            
            bgMusicList[musicInfo.id] = {
              id: musicInfo.id,
              name: musicInfo.name,
              src: musicInfo.src,
              audio: audio
            };
            
            console.log('✅ 音乐初始化成功:', musicInfo.name, '(ID:', musicInfo.id, ')');
          } catch (error) {
            console.error('初始化音乐失败:', musicInfo.name, error);
          }
        }
      }
      
      // 设置默认音乐为森林
      if (bgMusicList['forest']) {
        bgMusic = bgMusicList['forest'].audio;
        currentBgMusicId = 'forest';
        console.log('默认音乐设置为森林');
      }
      
      console.log('背景音乐列表初始化完成');
      return true;
    } catch (error) {
      console.error('初始化背景音乐列表失败:', error);
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

  // 切换背景音乐
  function switchBackgroundMusic(musicId) {
    try {
      if (!bgMusicList[musicId]) {
        console.error('背景音乐不存在:', musicId);
        return false;
      }
      
      // 暂停并停止当前音乐，防止重叠
      if (bgMusic) {
        bgMusic.pause();
        bgMusic.stop();
        console.log('已停止当前音乐:', currentBgMusicId);
      }
      
      // 暂停所有其他音乐，确保没有重叠
      for (var key in bgMusicList) {
        if (bgMusicList[key] && bgMusicList[key].audio) {
          var audio = bgMusicList[key].audio;
          if (!audio.paused) {
            audio.pause();
            audio.stop();
            console.log('停止音乐:', key);
          }
        }
      }
      
      // 切换到新音乐
      bgMusic = bgMusicList[musicId].audio;
      currentBgMusicId = musicId;
      
      // 确保新音乐的音量设置正确
      if (bgMusic) {
        bgMusic.volume = musicVolume;
        console.log('切换到音乐:', musicId, '音量:', musicVolume);
      }
      
      return true;
    } catch (error) {
      console.error('切换背景音乐失败:', error);
      return false;
    }
  }

  // 播放背景音乐
  function playBackgroundMusic() {
    try {
      if (!isMusicEnabled) {
        console.log('音乐被禁用，不播放');
        return false;
      }
      
      if (!bgMusic) {
        console.log('没有选中的背景音乐');
        return false;
      }
      
      // 确保音量设置正确
      bgMusic.volume = musicVolume;
      
      console.log('准备播放背景音乐，当前音乐ID:', currentBgMusicId, '音量:', musicVolume);
      bgMusic.play();
      console.log('背景音乐播放指令已发送');
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
        console.log('背景音乐已暂停, ID:', currentBgMusicId);
        return true;
      }
      
      // 额外确保所有音乐都被暂停
      for (var key in bgMusicList) {
        if (bgMusicList[key] && bgMusicList[key].audio) {
          var audio = bgMusicList[key].audio;
          if (!audio.paused) {
            audio.pause();
            console.log('强制暂停音乐:', key);
          }
        }
      }
      
      return true;
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
      if (bgMusic && !bgMusic.paused) {
        return true;
      }
      
      // 额外检查所有音乐的播放状态
      for (var key in bgMusicList) {
        if (bgMusicList[key] && bgMusicList[key].audio) {
          var audio = bgMusicList[key].audio;
          if (!audio.paused) {
            console.log('发现正在播放的音乐:', key);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('检查播放状态失败:', error);
      return false;
    }
  }

  // 获取当前背景音乐ID
  function getCurrentBackgroundMusicId() {
    return currentBgMusicId;
  }

  // 获取背景音乐列表
  function getBackgroundMusicList() {
    var list = [];
    for (var key in bgMusicList) {
      list.push({
        id: bgMusicList[key].id,
        name: bgMusicList[key].name
      });
    }
    return list;
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
      for (var key in bgMusicList) {
        if (bgMusicList[key] && bgMusicList[key].audio) {
          bgMusicList[key].audio.destroy();
        }
      }
      
      // 销毁音效
      for (var key in soundEffects) {
        if (soundEffects[key]) {
          soundEffects[key].destroy();
        }
      }
      
      console.log('音频资源销毁完成');
    } catch (error) {
      console.error('销毁音频资源失败:', error);
    }
  }

  // 返回公开的API
  return {
    initBackgroundMusicList: initBackgroundMusicList,
    initSoundEffect: initSoundEffect,
    switchBackgroundMusic: switchBackgroundMusic,
    playBackgroundMusic: playBackgroundMusic,
    pauseBackgroundMusic: pauseBackgroundMusic,
    playSoundEffect: playSoundEffect,
    isBackgroundMusicPlaying: isBackgroundMusicPlaying,
    getCurrentBackgroundMusicId: getCurrentBackgroundMusicId,
    getBackgroundMusicList: getBackgroundMusicList,
    setMusicEnabled: setMusicEnabled,
    setSoundEnabled: setSoundEnabled,
    setMusicVolume: setMusicVolume,
    setSoundVolume: setSoundVolume,
    destroy: destroy
  };
}

// 创建并导出音频管理器实例
module.exports = createAudioManager();
