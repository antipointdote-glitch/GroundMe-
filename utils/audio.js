// utils/audio.js - 增强版音频管理工具 (支持 App 环境)
class AudioManager {
  constructor() {
    this.bgMusic = null;
    this.bgMusicList = new Map();
    this.currentBgMusicId = 'forest';
    this.soundEffects = new Map();
    this.isMusicEnabled = true;
    this.isSoundEnabled = true;
    this.musicVolume = 0.3;
    this.soundVolume = 0.8;
  }

  // 辅助方法：确保路径在 App 环境下可用
  fixPath(src) {
    if (!src) return '';
    // 如果是网络路径直接返回
    if (src.startsWith('http')) return src;
    // App环境下，确保以 / 开头的绝对路径通常更稳
    return src.startsWith('/') ? src : '/' + src;
  }

  initBackgroundMusicList(musicList) {
    try {
      if (this.bgMusicList) {
        this.bgMusicList.forEach(musicInfo => {
          if (musicInfo && musicInfo.audio) musicInfo.audio.destroy();
        });
        this.bgMusicList.clear();
      }
      
      if (musicList && Array.isArray(musicList)) {
        musicList.forEach(musicInfo => {
          try {
            const music = wx.createInnerAudioContext();
            // 关键：App环境强制配置
            music.obeyMuteSwitch = false; 
            music.src = this.fixPath(musicInfo.src);
            music.loop = true;
            music.volume = this.musicVolume;
            
            music.onError((res) => {
              console.error(`音频错误 [${musicInfo.name}]:`, res);
              // 如果还是不出声，弹窗显示原因
              wx.showToast({
                title: '音频加载失败: ' + res.errCode,
                icon: 'none'
              });
            });
            
            this.bgMusicList.set(musicInfo.id, {
              audio: music,
              name: musicInfo.name,
              description: musicInfo.description
            });
          } catch (error) {
            console.error(`初始化音乐失败:`, error);
          }
        });
      }
      const savedMusicId = wx.getStorageSync('selectedBgMusic') || 'forest';
      this.currentBgMusicId = savedMusicId;
    } catch (error) {
      console.error('初始化列表失败:', error);
    }
  }

  playBackgroundMusic() {
    if (!this.isMusicEnabled || this.currentBgMusicId === 'none') return;
    const musicInfo = this.bgMusicList.get(this.currentBgMusicId);
    if (musicInfo) {
      if (this.bgMusic) this.bgMusic.pause();
      this.bgMusic = musicInfo.audio;
      
      // 这里的 play 需要在某些 Android 机型上确保已经 canplay
      this.bgMusic.play();
      console.log(`正在播放: ${musicInfo.name}, 路径: ${this.bgMusic.src}`);
    }
  }

  pauseBackgroundMusic() {
    if (this.bgMusic) this.bgMusic.pause();
  }

  stopBackgroundMusic() {
    if (this.bgMusic) this.bgMusic.stop();
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
    this.bgMusicList.forEach(m => { m.audio.volume = volume; });
  }

  createSoundEffect(name, src) {
    try {
      const audio = wx.createInnerAudioContext();
      audio.obeyMuteSwitch = false;
      audio.src = this.fixPath(src);
      audio.volume = this.soundVolume;
      this.soundEffects.set(name, audio);
      return audio;
    } catch (e) { return null; }
  }

  playSoundEffect(name) {
    if (!this.isSoundEnabled) return;
    const audio = this.soundEffects.get(name);
    if (audio) {
      audio.stop();
      audio.play();
    }
  }

  toggleMusic(enabled) {
    this.isMusicEnabled = enabled;
    enabled ? this.playBackgroundMusic() : this.pauseBackgroundMusic();
  }

  switchBackgroundMusic(musicId) {
    if (musicId === this.currentBgMusicId) return;
    this.pauseBackgroundMusic();
    this.currentBgMusicId = musicId;
    wx.setStorageSync('selectedBgMusic', musicId);
    if (this.isMusicEnabled && musicId !== 'none') this.playBackgroundMusic();
  }

  getBackgroundMusicList() {
    const list = [{id: 'none', name: '无音乐', description: '关闭背景音乐'}];
    this.bgMusicList.forEach((info, id) => {
      list.push({id: id, name: info.name, description: info.description});
    });
    return list;
  }

  destroy() {
    this.bgMusicList.forEach(m => m.audio.destroy());
    this.soundEffects.forEach(s => s.destroy());
  }
}

// 导出单例实例
const audioManager = new AudioManager();
module.exports = audioManager;