/**
 * 卡片轮播组件 - 支持多个实例共存
 * 依赖: jQuery (Bootstrap 4.6 自带)
 */
function initCardCarousel() {



  /**
   * 卡片轮播组件 - 支持多个实例共存
   * 依赖: jQuery (Bootstrap 4.6 自带)
   */

  /**
   * 卡片轮播组件 - 支持多个实例共存，支持外部箭头控制
   * 依赖: jQuery (Bootstrap 4.6 自带)
   */

  (function($) {
    'use strict';

    class CardCarousel {
      constructor(element, options) {
        this.$element = $(element);
        this.id = this.$element.attr('id').replace('carousel-', '');
        this.options = options || {};

        // 配置参数
        this.cardsPerView = {
          default: parseInt(this.$element.data('cards-desktop')) || 3,
          768: parseInt(this.$element.data('cards-tablet')) || 2,
          576: parseInt(this.$element.data('cards-mobile')) || 1
        };

        this.currentIndex = 0;
        this.visibleCards = 3;
        this.cardWidth = 0;
        this.totalCards = 0;

        // DOM 元素
        this.$carouselInner = this.$element.find('.carousel-inner');
        this.$row = this.$element.find('.carousel-inner .row');
        this.$cards = this.$element.find('.col-card');
        this.$prevBtn = this.$element.find('.carousel-control-prev');
        this.$nextBtn = this.$element.find('.carousel-control-next');
        this.$indicators = this.$element.find('.carousel-indicators');

        // 只在有卡片时初始化
        if (this.$cards.length > 0) {
          this.init();
        }
      }

      // 获取当前应显示的卡片数量（基于窗口宽度）
      getVisibleCardsCount() {
        const width = $(window).width();
        if (width <= 576) return this.cardsPerView[576];
        if (width <= 768) return this.cardsPerView[768];
        return this.cardsPerView.default;
      }

      // 更新轮播状态
      updateCarousel(animate = true) {
        this.totalCards = this.$cards.length;
        if (this.totalCards === 0) return;

        // 获取当前可见卡片数
        const newVisibleCards = this.getVisibleCardsCount();

        // 确保可见卡片数不超过总卡片数
        const maxPossibleCards = Math.min(newVisibleCards, this.totalCards);

        // 如果可见卡片数变化了，需要调整currentIndex
        if (maxPossibleCards !== this.visibleCards) {
          // 估算新索引，尽量保持中间的卡片不变
          const oldCenter = this.currentIndex + Math.floor(this.visibleCards / 2);
          this.visibleCards = maxPossibleCards;
          this.currentIndex = Math.max(0, Math.min(this.totalCards - this.visibleCards, oldCenter - Math.floor(this.visibleCards / 2)));
        }

        // 限制索引范围
        const maxIndex = Math.max(0, this.totalCards - this.visibleCards);
        this.currentIndex = Math.min(maxIndex, Math.max(0, this.currentIndex));

        // 设置卡片宽度
        // this.cardWidth = 100 / this.visibleCards;
        this.cardWidth = 33; // // 固定为三分之一
        this.$cards.css('width', this.cardWidth + '%');

        // 移动行容器
        const movePercent = -(this.currentIndex * this.cardWidth);
        this.$row.css({
          'transform': `translateX(${movePercent}%)`,
          'transition': animate ? 'transform 0.5s ease' : 'none'
        });

        // 更新指示器状态
        this.updateIndicators();

        // 更新箭头状态
        this.updateArrows();
      }

      // 更新箭头状态（禁用/启用）
      updateArrows() {
        const maxIndex = Math.max(0, this.totalCards - this.visibleCards);

        // 更新内部箭头
        if (this.currentIndex <= 0) {
          this.$prevBtn.css('opacity', '0.5').prop('disabled', true);
        } else {
          this.$prevBtn.css('opacity', '1').prop('disabled', false);
        }

        if (this.currentIndex >= maxIndex) {
          this.$nextBtn.css('opacity', '0.5').prop('disabled', true);
        } else {
          this.$nextBtn.css('opacity', '1').prop('disabled', false);
        }

        // 触发自定义事件，让外部箭头可以监听状态变化
        this.$element.trigger('carousel.update', {
          id: this.id,
          currentIndex: this.currentIndex,
          maxIndex: maxIndex,
          hasPrev: this.currentIndex > 0,
          hasNext: this.currentIndex < maxIndex
        });
      }

      // 生成指示器
      generateIndicators() {
        this.$indicators.empty();

        const totalGroups = Math.max(1, this.totalCards - this.visibleCards + 1);
        for (let i = 0; i < totalGroups; i++) {
          this.$indicators.append(`<li data-index="${i}"></li>`);
        }

        // 绑定指示器点击事件
        const self = this;
        this.$indicators.find('li').click(function() {
          const index = $(this).data('index');
          if (index !== undefined) {
            self.goTo(index);
          }
        });
      }

      // 更新指示器状态
      updateIndicators() {
        // 重新生成指示器（因为visibleCards可能变化）
        this.generateIndicators();

        // 高亮当前激活的指示器
        const activeIndex = Math.min(this.currentIndex, this.totalCards - this.visibleCards);
        this.$indicators.find('li').removeClass('active');
        this.$indicators.find(`li[data-index="${activeIndex}"]`).addClass('active');
      }

      // 跳转到指定索引
      goTo(index) {
        const maxIndex = Math.max(0, this.totalCards - this.visibleCards);
        this.currentIndex = Math.min(maxIndex, Math.max(0, index));
        this.updateCarousel(true);
      }

      // 下一张
      next() {
        const maxIndex = Math.max(0, this.totalCards - this.visibleCards);
        if (this.currentIndex < maxIndex) {
          this.currentIndex++;
          this.updateCarousel(true);
        } else {
          // 轻微抖动提示到头了
          this.shakeEnd('right');
        }
      }

      // 上一张
      prev() {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.updateCarousel(true);
        } else {
          // 轻微抖动提示到头了
          this.shakeEnd('left');
        }
      }

      // 到头/到尾时的抖动效果
      shakeEnd(direction) {
        const self = this;
        const maxIndex = Math.max(0, this.totalCards - this.visibleCards);
        const currentTransform = -(this.currentIndex * this.cardWidth);

        this.$row.css('transition', 'transform 0.1s ease');

        if (direction === 'left') {
          this.$row.css('transform', `translateX(${2}%)`);
        } else {
          this.$row.css('transform', `translateX(-${(maxIndex * this.cardWidth) + 2}%)`);
        }

        setTimeout(() => {
          self.$row.css('transition', 'transform 0.5s ease');
          self.$row.css('transform', `translateX(${currentTransform}%)`);
        }, 100);
      }

      // 初始化
      init() {
        if (this.$cards.length === 0) return;

        this.visibleCards = this.getVisibleCardsCount();
        this.currentIndex = 0;
        this.updateCarousel(false);

        // 绑定内部箭头事件
        const self = this;
        this.$prevBtn.click(function(e) {
          e.preventDefault();
          self.prev();
        });

        this.$nextBtn.click(function(e) {
          e.preventDefault();
          self.next();
        });

        // 监听窗口大小变化
        let resizeTimer;
        $(window).resize(function() {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function() {
            self.updateCarousel(false);
          }, 150);
        });

        // 存储实例到全局对象，方便外部访问
        if (!window.cardCarousels) {
          window.cardCarousels = {};
        }
        window.cardCarousels[this.id] = this;
      }
    }

    // 初始化所有卡片轮播
    $(document).ready(function() {
      $('.card-carousel').each(function() {
        const $this = $(this);
        // 防止重复初始化
        if (!$this.data('cardCarousel')) {
          const carousel = new CardCarousel(this);
          $this.data('cardCarousel', carousel);
        }
      });

      // 绑定外部箭头控制
      setupExternalControls();
    });

    // 设置外部箭头控制
    function setupExternalControls() {
      // 监听所有带有 data-carousel-target 属性的元素点击
      $(document).on('click', '[data-carousel-target]', function(e) {
        e.preventDefault();

        const targetId = $(this).data('carousel-target');
        const action = $(this).data('carousel-action');
        const index = $(this).data('carousel-index');

        if (!targetId || !window.cardCarousels) return;

        const carousel = window.cardCarousels[targetId];
        if (!carousel) return;

        if (action === 'next') {
          carousel.next();
        } else if (action === 'prev') {
          carousel.prev();
        } else if (action === 'go' && index !== undefined) {
          carousel.goTo(parseInt(index));
        }
      });

      // 可选：更新外部箭头状态（如果它们有disabled类）
      $(document).on('carousel.update', '.card-carousel', function(e, data) {
        // 更新指向这个轮播的外部箭头
        $(`[data-carousel-target="${data.id}"]`).each(function() {
          const $btn = $(this);
          const action = $btn.data('carousel-action');

          if (action === 'prev') {
            if (data.hasPrev) {
              $btn.removeClass('disabled').prop('disabled', false).css('opacity', '1');
            } else {
              $btn.addClass('disabled').prop('disabled', true).css('opacity', '0.5');
            }
          } else if (action === 'next') {
            if (data.hasNext) {
              $btn.removeClass('disabled').prop('disabled', false).css('opacity', '1');
            } else {
              $btn.addClass('disabled').prop('disabled', true).css('opacity', '0.5');
            }
          }
        });
      });
    }

  })(jQuery);






}

// window.addEventListener('load', initCardCarousel);
