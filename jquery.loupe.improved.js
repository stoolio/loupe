/*! (c) 2010 jdbartlett, MIT license */
/**
 * loupe - an image magnifier for jQuery
 * (C) 2010 jdbartlett, MIT license
 * http://github.com/jdbartlett/loupe
 */
(function ($, window) {

  // requestAnimationFrame polyfill with setTimeout fallback
  var raf = window.requestAnimationFrame       ||
            window.mozRequestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame     ||
            window.oRequestAnimationFrame      ||
            // We use 33.3 as the timeout for 30fps
            function(fn) { return setTimeout(fn, 33.3); },
      caf = window.cancelAnimationFrame    ||
            window.mozCancelAnimationFrame ||
            window.clearTimeout,
      $win = $(window),
      // Function from Remy Sharp
      // @ http://remysharp.com/2010/07/21/throttling-function-calls/
      debounce = $.debounce ||
        function (wait, fn) {
          var timer = null;
          return function () {
            var that = this,
              args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() {
              fn.apply(that, args);
            }, wait);
          };
        },
      isTouch = typeof Modernizr === 'undefined' ?
        // This is a portion of the Modernizr test, the rest of the test
        // requires a bunch of extra code, use Modernizr for the full test
        ('ontouchstart' in window) ||
        window.DocumentTouch && document instanceof DocumentTouch :
        Modernizr.touch;

  // If you include jquery.ba-throttle-debounce.js before this file
  // it's debounce function will be used, see:
  // http://benalman.com/projects/jquery-throttle-debounce-plugin/

  $.fn.loupe = function (arg) {
    var options = $.extend({
      loupe: 'loupe',
      width: 200,
      height: 150,
      method: 'hover',
      hideFn: 'hide',
      showFn: 'show',
      onFn: 'mouseenter',
      moveFn: 'mousemove',
      sensitivity: 15
    }, arg || {});

    if (options.method === 'click' && !isTouch) {
      options.onFn = 'mousedown';
    } else if (isTouch) {
      options.onFn = 'touchstart';
      options.moveFn = 'touchmove';
    }

    return this.length ? this.each(function () {
      var $this = $(this),
        $big,             // large background image for loupe
        $loupe,           // loupe!
        $small,           // image that will be "zoomed" with loupe

        animateID,        // id for requestAnimationFrame/setTimeout loop

        offsetX, offsetY, // loupe offset so it appear centered on the mouse pos

        factorX, addX,    // vars for equation of zoom image background position
        factorY, addY,

        mouseX, mouseY,   // mouse coordinates

        minX, maxX,       // these represent the coordinates of images upper
        minY, maxY,       // left and bottom right corners

        // This functions as a protection against the code running "backwards"
        // it prevents rebinding callbacks multiple times in function enter(e)
        // and short circuits the various other functions.
        // The proper order is:
        // mouseenter|mousedown|touchstart on image -> enter
        //  enter shows loupe, binds callbacks, starts animation
        //  mouse is over the loupe now
        // outOfBounds triggers loupe.deactivate -> leave
        activated,

        move, // function variable to set mouse/touch coords, set dynamically
        debouncedOutOfBounds; // this will be a debounced version of a function
                              // below, prevents scrolling from breaking loupe

      // short circuits if already activated
      if ($this.data('loupe') === true) {
        return $this.data('loupe', arg);
      }

      /*
       *  Function Definitions
       */
      function hideLoupe() {
        return $loupe[options.hideFn]();
      }

      function showLoupe() {
        return $loupe[options.showFn]();
      }

      // These variables only need to be calculated once
      // it saves some calculation time during the mousemove and animation
      function computeOffsets() {
        var os = $small.offset(),
        sW = $small.outerWidth(),
        sH = $small.outerHeight(),
        bW, bH;
        offsetX = options.width / 2;
        offsetY = options.width / 2;
        // hide and attach to DOM so we can get a proper
        // width and height
        $loupe.css('opacity', 0).show();
        bW = $big.width();
        bH = $big.height();
        $loupe.hide().css('opacity', 1);
        minX = os.left - options.sensitivity;
        maxX = sW + os.left + options.sensitivity;
        minY = os.top - options.sensitivity;
        maxY = sH + os.top + options.sensitivity;
        factorX = bW / sW;
        addX = ((os.left * bW)/sW) + 100;
        factorY = bH / sH;
        addY = ((os.top * bH)/sH) + 100;
      }

      // function followMove(e) {
      //   e.preventDefault();
      //   mouse.x += (e.pageX - mouse.x) / 24;
      //   mouse.y += (e.pageY - mouse.y) / 24;
      //   //(destination - position) / damping;
      // }

      function mouseMove(e) {
        // this function can run hundreds of times per second
        // this is about as thin as it can get
        e.preventDefault();
        mouseX = e.pageX;
        mouseY = e.pageY;
      }

      function touchMove(e) {
        e.preventDefault();
        var touch = e.originalEvent.touches && e.originalEvent.touches[0];
        if (typeof touch !== undefined) {
          mouseX = touch.pageX;
          mouseY = touch.pageY;
        }
      }

      function enter(e) {
        e.preventDefault();

        if (activated) return;
        activated = true;

        // Sets initial position, prevents a jumpy loupe
        move(e);
        animate();

        showLoupe();

        $win.on(options.moveFn, move)
          .on('scroll', debouncedOutOfBounds);

        // Start animation loop, save ID so we can cancel
        animateID = raf(animate);
      }

      function leave(e) {
        if(!activated) return;
        activated = false;

        // Cancel animation loop
        caf(animateID);

        // remove window listeners, $win.off() or $win.off('event') could
        // remove events from other js on the page
        $win.off('scroll', debouncedOutOfBounds)
          .off('mousemove', move);

        hideLoupe();
      }

      function outOfBounds() {
        if(!activated) return;
        if (mouseX > maxX || mouseX < minX ||
            mouseY > maxY || mouseY < minY) {
          $this.trigger('loupe.deactivate');
        }
      }

      function animate() {
        if (!activated) return;
        outOfBounds();
        $loupe.css({
          left: mouseX - offsetX,
          top: mouseY - offsetY
        });
        $big.css({
          left: (-mouseX * factorX + addX)|0,
          top: (-mouseY * factorY + addY)|0
        });
        raf(animate);
      }

      /*
       *  Setup Code
       */
      activated = false;

      move = isTouch ? touchMove : mouseMove;
      // necessary so we can properly unbind from window
      debouncedOutOfBounds = debounce(500, outOfBounds);

      $small = $this.is('img') ? $this : $this.find('img:first')

      $loupe = $('<div />')
        .addClass(options.loupe)
        .css({
          width: options.width,
          height: options.height,
          position: 'absolute',
          overflow: 'hidden'
        })
        .append(
          $big = $('<img />')
          .attr('src', $this.attr($this.is('img') ? 'src' : 'href'))
          .css('position', 'absolute')
        )
        .hide()
        .appendTo("body");

      // this must be run at least once before starting, but after the $loupe
      // item has been created
      computeOffsets();

      // a window resize could change things on a responsive website
      // it's debounced to accommodate drag resizing
      $win.resize(debounce(1000, computeOffsets));

      $this.data('loupe', true).on(options.onFn, enter)
        .on('loupe.deactivate', leave);

    }) : this;
  };
}(jQuery, window));
