/**
 * Video Hover Player - 多视频批量初始化
 * 功能：支持单个和批量初始化多个视频播放器
 */

class VideoHoverPlayer {
  constructor(container, options = {}) {
    // 支持传入ID字符串或DOM元素
    this.container = typeof container === 'string'
      ? document.getElementById(container)
      : container;

    if (!this.container) {
      console.error(`Video container not found`);
      return;
    }

    // 生成唯一ID（如果没有）
    if (!this.container.id) {
      this.container.id = 'video-player-' + Math.random().toString(36).substr(2, 9);
    }
    this.id = this.container.id;

    // 配置选项
    this.options = {
      autoPlay: true,           // 悬停自动播放
      muted: true,               // 默认静音
      loop: false,               // 是否循环
      showStatus: false,         // 是否显示状态指示器
      playPauseBtnId: null,      // 播放按钮ID
      fullscreenBtnId: null,     // 全屏按钮ID
      replayBtnId: null,         // 重播按钮ID
      statusBadgeId: null,       // 状态指示器ID
      onPlay: null,              // 播放回调
      onPause: null,             // 暂停回调
      onFullscreen: null,        // 全屏回调
      ...options
    };

    // 查找内部元素
    this.video = this.container.querySelector('video');

    // 验证视频元素
    if (!this.video) {
      console.error(`Video element not found inside container #${this.id}`);
      return;
    }

    // 查找外部按钮（支持多种方式）
    this.findButtons();

    // 绑定方法
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.handleFullscreen = this.handleFullscreen.bind(this);
    this.handleReplay = this.handleReplay.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.handleVideoEvent = this.handleVideoEvent.bind(this);

    // 初始化
    this.init();
  }

  /**
   * 查找关联的按钮
   */
  findButtons() {
    // 方法1: 通过ID查找
    if (this.options.playPauseBtnId) {
      this.playPauseBtn = document.getElementById(this.options.playPauseBtnId);
    }
    if (this.options.fullscreenBtnId) {
      this.fullscreenBtn = document.getElementById(this.options.fullscreenBtnId);
    }
    if (this.options.replayBtnId) {
      this.replayBtn = document.getElementById(this.options.replayBtnId);
    }
    if (this.options.statusBadgeId) {
      this.statusBadge = document.getElementById(this.options.statusBadgeId);
    }

    // 方法2: 通过data-player属性查找
    if (!this.playPauseBtn) {
      this.playPauseBtn = document.querySelector(`[data-player="${this.id}"][data-action="play"]`);
    }
    if (!this.fullscreenBtn) {
      this.fullscreenBtn = document.querySelector(`[data-player="${this.id}"][data-action="fullscreen"]`);
    }
    if (!this.replayBtn) {
      this.replayBtn = document.querySelector(`[data-player="${this.id}"][data-action="replay"]`);
    }
    if (!this.statusBadge) {
      this.statusBadge = document.querySelector(`[data-status-for="${this.id}"]`);
    }

    // 方法3: 通过class查找（使用nextElementSibling）
    if (!this.playPauseBtn && this.container.nextElementSibling) {
      this.playPauseBtn = this.container.nextElementSibling.querySelector('.js-play-pause');
      this.fullscreenBtn = this.container.nextElementSibling.querySelector('.js-fullscreen');
      this.replayBtn = this.container.nextElementSibling.querySelector('.js-replay');
    }
  }

  init() {
    // 设置视频属性
    this.video.muted = this.options.muted;
    this.video.loop = this.options.loop;

    // 绑定事件
    this.bindEvents();

    // 初始更新UI
    this.updateUI();

    // 添加到全局实例池
    if (!window.videoPlayers) {
      window.videoPlayers = {};
    }
    window.videoPlayers[this.id] = this;

    // 同时添加到数组便于遍历
    if (!window.videoPlayersList) {
      window.videoPlayersList = [];
    }
    window.videoPlayersList.push(this);

    console.log(`✅ VideoHoverPlayer initialized: ${this.id}`);
    return this;
  }

  bindEvents() {
    // 悬停事件
    if (this.options.autoPlay) {
      this.container.addEventListener('mouseenter', this.handleMouseEnter);
      this.container.addEventListener('mouseleave', this.handleMouseLeave);

      // 触摸设备支持
      this.container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.togglePlay();
      });
    }

    // 按钮事件
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', this.handlePlayPause);
    }
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', this.handleFullscreen);
    }
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', this.handleReplay);
    }

    // 视频事件
    this.video.addEventListener('play', this.handleVideoEvent);
    this.video.addEventListener('pause', this.handleVideoEvent);
    this.video.addEventListener('ended', this.handleVideoEvent);
    this.video.addEventListener('waiting', this.handleVideoEvent);
    this.video.addEventListener('playing', this.handleVideoEvent);
  }

  handleMouseEnter() {
    this.play().catch(error => {
      console.log(`自动播放失败 ${this.id}:`, error);
      if (this.statusBadge) {
        this.statusBadge.className = 'video-status-badge waiting';
        this.statusBadge.textContent = '⚠️ 需要手动播放';
      }
    });
  }

  handleMouseLeave() {
    this.pause();
  }

  async play() {
    try {
      await this.video.play();
      if (this.options.onPlay) this.options.onPlay(this);
      return true;
    } catch (error) {
      console.warn(`Play failed ${this.id}:`, error);
      throw error;
    }
  }

  pause() {
    this.video.pause();
    if (this.options.onPause) this.options.onPause(this);
  }

  togglePlay() {
    if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  handlePlayPause() {
    this.togglePlay();
  }

  handleFullscreen() {
    this.requestFullscreen();
    if (this.options.onFullscreen) this.options.onFullscreen(this);
  }

  handleReplay() {
    this.video.currentTime = 0;
    this.play();
  }

  requestFullscreen() {
    const element = this.container;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  toggleFullscreen() {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.requestFullscreen();
    }
  }

  isFullscreen() {
    return !!(document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement);
  }

  handleVideoEvent(event) {
    this.updateUI();
  }

  updateUI() {
    // 更新容器状态类
    if (this.video.paused) {
      this.container.classList.remove('playing');
      this.container.classList.add('paused');
    } else {
      this.container.classList.add('playing');
      this.container.classList.remove('paused');
    }

    // 更新播放按钮图标
    if (this.playPauseBtn) {
      const icon = this.playPauseBtn.querySelector('i');
      if (icon) {
        icon.className = this.video.paused ? 'fas fa-play' : 'fas fa-pause';
      }
    }

    // 更新状态指示器
    if (this.statusBadge) {
      if (this.video.paused) {
        this.statusBadge.className = 'video-status-badge paused';
        this.statusBadge.textContent = '⏸️ 暂停中';
      } else {
        this.statusBadge.className = 'video-status-badge playing';
        this.statusBadge.textContent = '▶️ 播放中';
      }
    }
  }

  setSource(src) {
    this.video.src = src;
    this.video.load();
  }

  destroy() {
    // 移除事件监听
    this.container.removeEventListener('mouseenter', this.handleMouseEnter);
    this.container.removeEventListener('mouseleave', this.handleMouseLeave);

    if (this.playPauseBtn) {
      this.playPauseBtn.removeEventListener('click', this.handlePlayPause);
    }
    if (this.fullscreenBtn) {
      this.fullscreenBtn.removeEventListener('click', this.handleFullscreen);
    }
    if (this.replayBtn) {
      this.replayBtn.removeEventListener('click', this.handleReplay);
    }

    // 从全局池中移除
    if (window.videoPlayers && window.videoPlayers[this.id]) {
      delete window.videoPlayers[this.id];
    }

    // 从列表中移除
    if (window.videoPlayersList) {
      const index = window.videoPlayersList.findIndex(p => p.id === this.id);
      if (index !== -1) {
        window.videoPlayersList.splice(index, 1);
      }
    }

    console.log(`🗑️ VideoHoverPlayer destroyed: ${this.id}`);
  }
}

/**
 * 批量初始化多个视频播放器
 */
class VideoPlayerManager {
  constructor() {
    this.players = {};
  }

  /**
   * 初始化单个播放器
   */
  initPlayer(containerId, options = {}) {
    const player = new VideoHoverPlayer(containerId, options);
    if (player && player.id) {
      this.players[player.id] = player;
    }
    return player;
  }

  /**
   * 批量初始化播放器
   * @param {string} selector - CSS选择器，默认为所有 .video-hover-container
   * @param {Object} defaultOptions - 默认配置
   */
  initAll(selector = '.video-hover-container', defaultOptions = {}) {
    const containers = document.querySelectorAll(selector);
    const players = [];

    containers.forEach((container, index) => {
      // 从data属性读取配置
      const options = {
        autoPlay: container.dataset.autoPlay !== 'false',
        muted: container.dataset.muted !== 'false',
        loop: container.dataset.loop === 'true',
        playPauseBtnId: container.dataset.playBtnId,
        fullscreenBtnId: container.dataset.fullscreenBtnId,
        replayBtnId: container.dataset.replayBtnId,
        statusBadgeId: container.dataset.statusId,
        ...defaultOptions
      };

      // 确保容器有ID
      if (!container.id) {
        container.id = `video-player-${index}-${Date.now()}`;
      }

      const player = new VideoHoverPlayer(container, options);
      if (player) {
        players.push(player);
        this.players[container.id] = player;
      }
    });

    console.log(`✅ Initialized ${players.length} video players`);
    return players;
  }

  /**
   * 根据ID获取播放器
   */
  get(id) {
    return this.players[id] || window.videoPlayers?.[id];
  }

  /**
   * 根据索引获取播放器（按初始化顺序）
   */
  getByIndex(index) {
    return window.videoPlayersList?.[index];
  }

  /**
   * 获取所有播放器
   */
  getAll() {
    return this.players;
  }

  /**
   * 获取所有播放器列表
   */
  getList() {
    return window.videoPlayersList || [];
  }

  /**
   * 播放所有视频
   */
  playAll() {
    Object.values(this.players).forEach(player => player.play());
  }

  /**
   * 暂停所有视频
   */
  pauseAll() {
    Object.values(this.players).forEach(player => player.pause());
  }

  /**
   * 停止所有视频（暂停并重置）
   */
  stopAll() {
    Object.values(this.players).forEach(player => {
      player.pause();
      player.video.currentTime = 0;
    });
  }

  /**
   * 销毁所有播放器
   */
  destroyAll() {
    Object.values(this.players).forEach(player => player.destroy());
    this.players = {};
  }

  /**
   * 根据自定义属性查找播放器
   */
  findBy(attribute, value) {
    return window.videoPlayersList?.find(p => p[attribute] === value);
  }

  /**
   * 根据容器DOM元素查找播放器
   */
  findByContainer(container) {
    const id = typeof container === 'string' ? container : container.id;
    return this.get(id);
  }
}

// 创建全局管理器实例
// window.videoManager = new VideoPlayerManager();
//
// // 自动初始化（DOM加载完成后）
// document.addEventListener('DOMContentLoaded', function () {
//   // 自动初始化所有带有 data-auto-init 属性的容器
//   window.videoManager.initAll('[data-auto-init="true"]');
//
//   // 或者初始化所有 .video-hover-container
//   if (document.querySelector('.video-hover-container')) {
//     window.videoManager.initAll('.video-hover-container');
//   }
//
//
// });


function controlInit() {

// ===== 等待视频播放器初始化完成 =====
  function waitForPlayers(callback) {
    if (window.videoPlayers && Object.keys(window.videoPlayers).length > 0) {
      callback();
    } else {
      setTimeout(() => waitForPlayers(callback), 100);
    }
  }

  // ===== 方法1: 通过ID控制视频 =====
  window.controlById = function(id, action) {
    console.log(`尝试控制视频: ${id}, 动作: ${action}`);

    // 通过window.videoPlayers查找
    const player = window.videoPlayers ? window.videoPlayers[id] : null;

    if (!player) {
      console.error(`未找到ID为 ${id} 的视频实例`);
      // const availableIds = window.videoPlayers ? Object.keys(window.videoPlayers).join(', ') : '无';
      // alert(`未找到ID为 ${id} 的视频实例。可用ID: ${availableIds}`);
      return;
    }

    // 确保video元素存在
    if (!player.video) {
      console.error('视频元素不存在');
      return;
    }

    switch(action) {
      case 'play':
        player.play().catch(e => console.log('播放失败:', e));
        break;
      case 'pause':
        player.pause();
        break;
      case 'fullscreen':
        player.requestFullscreen();
        break;
      case 'replay':
        if (player.video) {
          player.video.currentTime = 0;
          player.play();
        }
        break;
      case 'mute':
        if (player.video) {
          player.video.muted = true;
        }
        break;
      case 'unmute':
        if (player.video) {
          player.video.muted = false;
        }
        break;
      default:
        console.log('未知动作:', action);
    }

    console.log(`✅ 通过ID控制: ${id} - ${action}`, player);
  };

  // ===== 显示所有视频实例 =====
  window.showAllPlayers = function() {
    console.log('=== 所有视频实例 ===');
    console.log('通过ID索引:', window.videoPlayers);
    console.log('通过列表索引:', window.videoPlayersList);

    if (!window.videoPlayers || Object.keys(window.videoPlayers).length === 0) {
      alert('没有找到任何视频实例，请等待初始化完成');
      return;
    }

    let info = '已初始化视频:\n';
    Object.keys(window.videoPlayers).forEach((id, i) => {
      const player = window.videoPlayers[id];
      const videoSrc = player.video ? player.video.src.split('/').pop() : '未知';
      info += `${i}. ID: ${id}, 视频: ${videoSrc}\n`;
    });
    alert(info);
  };

  // ===== 更新视频统计 - 修复null错误 =====
  function updateVideoStats() {
    // 先检查元素是否存在
    const countElement = document.getElementById('videoCountDisplay');
    if (countElement) {
      const count = window.videoPlayersList?.length || 0;
      countElement.textContent = count;
    } else {
      console.log('videoCountDisplay元素不存在，稍后重试');
    }
  }

  // ===== 安全地初始化 =====
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，等待视频初始化...');

    // 尝试多次更新统计
    let attempts = 0;
    const interval = setInterval(() => {
      updateVideoStats();
      attempts++;

      // 如果视频已初始化或尝试次数过多，停止
      if ((window.videoPlayersList && window.videoPlayersList.length > 0) || attempts > 20) {
        clearInterval(interval);
        console.log('视频初始化完成或超时');

        // 最终更新一次
        setTimeout(updateVideoStats, 500);
      }
    }, 200);
  });

  // 如果DOM已经加载，立即执行
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(updateVideoStats, 500);
  }

}

// controlInit();


function initVideoCarouse () {

  // 创建全局管理器实例
  window.videoManager = new VideoPlayerManager();

// 自动初始化（DOM加载完成后）
  document.addEventListener('DOMContentLoaded', function () {
    // 自动初始化所有带有 data-auto-init 属性的容器
    window.videoManager.initAll('[data-auto-init="true"]');

    // 或者初始化所有 .video-hover-container
    if (document.querySelector('.video-hover-container')) {
      window.videoManager.initAll('.video-hover-container');
    }


  });


  controlInit();
}


// initVideoCarouse ()
