

var plugin = (function() {
  "use strict";
  var arcSlider = function () {
    var elem = this;
    elem.config = {
      target: document.querySelector('.testimonials'),
      dots: document.querySelector('.testimonials__dots'),
      transition: {
        speed: 300
      },
      autoPlay: true,
      autoPlaySpeed: 4000
    };
    elem.init();
  };
  arcSlider.prototype.createDots = function () {
    var elem = this;
    for (var i = 0; i < elem.totalSlides; i++) {
      var dot = document.createElement('li');
      dot.setAttribute('data-pos', i + 1);
      elem.config.dots.appendChild(dot);
    }
    elem.config.dots.addEventListener('click', function (e) {
      if (e.target && e.target.nodeName == "LI") {
        elem.curSlide = e.target.getAttribute('data-pos');
        elem.gotoSlide();
      }
    }, false);
  };
  arcSlider.prototype.getPosLeft = function () {
    var elem = this;
    elem.curLeft = (elem.sliderWrap.style.left != '' ? parseInt(elem.sliderWrap.style.left.split('px')[0]) : 0);
  };
  arcSlider.prototype.gotoSlide = function () {
    var elem = this;
    elem.sliderWrap.style.transition = 'left ' + elem.config.transition.speed / 1000 + 's ';
    elem.sliderWrap.style.left = -elem.curSlide * elem.slideW + 'px';
    elem.config.target.classList.add('animating');
    setTimeout(function () {
      elem.sliderWrap.style.transition = '';
      elem.config.target.classList.remove('animating');
    }, elem.config.transition.speed);
    elem.setDot();
    elem.config.target.style.height = elem.allSlides[elem.curSlide].offsetHeight + "px";
    clearInterval(elem.autoRotate);
  };
  arcSlider.prototype.setDot = function () {
    var elem = this;
    var tardot = elem.curSlide - 1;
    for (var j = 0; j < elem.totalSlides; j++) {
      elem.config.dots.querySelectorAll('li')[j].classList.remove('active');
    }
    if (elem.curSlide - 1 < 0) {
      tardot = elem.totalSlides - 1;
    } else if (elem.curSlide - 1 > elem.totalSlides - 1) {
      tardot = 0;
    }
    elem.config.dots.querySelectorAll('li')[tardot].classList.add('active');
  };
  arcSlider.prototype.init = function () {
    var elem = this;
    function on_resize(c, t) {
      onresize = function() {
        clearTimeout(t);
        t = setTimeout(c, 100);
      };
      return onresize;
    }
    window.addEventListener("resize", on_resize(function () {
      elem.updateSliderDimension();
    }), false);
    var nowHTML = elem.config.target.innerHTML;
    elem.config.target.innerHTML = '<div class="testimonials--wrap">' + nowHTML + '</div>';
    elem.allSlides = 0;
    elem.curSlide = 0;
    elem.curLeft = 0;
    elem.totalSlides = elem.config.target.querySelectorAll('.testimonials__item').length;
    elem.sliderWrap = elem.config.target.querySelector('.testimonials--wrap');

    var cloneFirst = elem.config.target.querySelectorAll('.testimonials__item')[0].cloneNode(true);
    elem.sliderWrap.appendChild(cloneFirst);
    var cloneLast = elem.config.target.querySelectorAll('.testimonials__item')[elem.totalSlides - 1].cloneNode(true);
    elem.sliderWrap.insertBefore(cloneLast, elem.sliderWrap.firstChild);
   
    elem.curSlide++;
    elem.allSlides = elem.config.target.querySelectorAll('.testimonials__item');

    elem.sliderWrap.style.width = (elem.totalSlides + 2) * 100 + "%";
    for (var _i = 0; _i < elem.totalSlides + 2; _i++) {
      elem.allSlides[_i].style.width = 100 / (elem.totalSlides + 2) + "%";
      elem.updateSliderDimension();
    }
    elem.createDots();
    elem.setDot();

    elem.autoRotate = setInterval(function () {
        elem.getPosLeft();
        elem.curSlide++;
        if (elem.curSlide < 0) {
            elem.curSlide = elem.totalSlides;
        } else if (elem.curSlide == elem.totalSlides + 1) {
            elem.curSlide = 1;
        }
        elem.gotoSlide();
        elem.config.target.classList.remove('animating');

    }, elem.config.autoPlaySpeed);

    function addListenerMulti(el, s, fn) {
      s.split(' ').forEach(function (e) {
        return el.addEventListener(e, fn, false);
      });
    }
    function removeListenerMulti(el, s, fn) {
      s.split(' ').forEach(function (e) {
        return el.removeEventListener(e, fn, false);
      });
    }

    addListenerMulti(elem.sliderWrap, 'mousedown touchstart', startSwipe);
    elem.animating = false;

    function startSwipe(e) {
      var touch = e;
      elem.getPosLeft();
      if (!elem.animating) {
        if (e.type == 'touchstart') {
          touch = e.targetTouches[0] || e.changedTouches[0];
        }
        elem.startX = touch.pageX;
        elem.startY = touch.pageY;
        addListenerMulti(elem.sliderWrap, 'mousemove touchmove', swipeMove);
        addListenerMulti(document.querySelector('body'), 'mouseup touchend', swipeEnd);
      }
      clearInterval(elem.autoRotate);
    }

    function swipeMove(e) {
      var touch = e;
      if (e.type == 'touchmove') {
        touch = e.targetTouches[0] || e.changedTouches[0];
      }
      elem.moveX = touch.pageX;
      elem.moveY = touch.pageY;
      if (Math.abs(elem.moveX - elem.startX) < 40) return;
      elem.animating = true;
      elem.config.target.classList.add('animating');
      e.preventDefault();

      if (elem.curLeft + elem.moveX - elem.startX > 0 && elem.curLeft == 0) {
        elem.curLeft = -elem.totalSlides * elem.slideW;
      } else if (elem.curLeft + elem.moveX - elem.startX < -(elem.totalSlides + 1) * elem.slideW) {
        elem.curLeft = -elem.slideW;
      }
      elem.sliderWrap.style.left = elem.curLeft + elem.moveX - elem.startX + "px";
    }

    function swipeEnd(e) {
      elem.getPosLeft();
      if (Math.abs(elem.moveX - elem.startX) === 0) return;
      elem.stayAtCur = Math.abs(elem.moveX - elem.startX) < 40 || typeof elem.moveX === "undefined" ? true : false;
      elem.dir = elem.startX < elem.moveX ? 'left' : 'right';
      if (!elem.stayAtCur) {
        if (elem.dir == 'left') {elem.curSlide--;} else {elem.curSlide++;}
        if (elem.curSlide < 0) {
          elem.curSlide = elem.totalSlides;
        } else if (elem.curSlide == elem.totalSlides + 2) {
          elem.curSlide = 1;
        }
      }
      elem.gotoSlide();
      delete elem.startX;
      delete elem.startY;
      delete elem.moveX;
      delete elem.moveY;
      elem.animating = false;
      elem.config.target.classList.remove('animating');
      removeListenerMulti(elem.sliderWrap, 'mousemove touchmove', swipeMove);
      removeListenerMulti(document.querySelector('body'), 'mouseup touchend', swipeEnd);
    }
  };
  arcSlider.prototype.updateSliderDimension = function () {
    var elem = this;
    elem.slideW = parseInt(elem.config.target.querySelectorAll('.testimonials__item')[0].offsetWidth);
    elem.sliderWrap.style.left = -elem.slideW * elem.curSlide + "px";
    elem.config.target.style.height = elem.allSlides[elem.curSlide].offsetHeight + "px";
  };
  return arcSlider;
})();

var arctouchslider = new plugin();