(function() {

    var fullScreenElement = document.fullScreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

    var exitFullscreenFn = document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullscreen ||
        document.msExitFullscreen;

    var requestFullscreenFn = Element.prototype.requestFullscreen ||
        Element.prototype.webkitRequestFullscreen ||
        Element.prototype.mozRequestFullScreen ||
        Element.prototype.msRequestFullscreen;


    var prompt = document.querySelector('.prompt');

    var animationLoop;
    var scrollingNow = false;

    var scrollStep = 3;
    var defaultSpeed = 30;
    var minimumSpeed = 10;
    var maximumSpeed = 60;
    var stepSpeed = 10;

    function renderRequest() {
        window.requestAnimationFrame(render);
    }

    function render() {
        window.scrollBy(0, -scrollStep);
        scroll();
    }

    function scroll() {
        if (window.scrollY && scrollingNow) {
            animationLoop = setTimeout(renderRequest, 1000 / defaultSpeed);
        }
    }

    function pause() {
        window.clearTimeout(animationLoop);
        scrollingNow = false;
    }

    function start() {
        scrollingNow = true;
        scroll();
    }

    function toggle() {
        if (scrollingNow) {
            pause();
        } else {
            start();
        }
    }

    function rewind() {
        window.scrollTo(0, document.body.clientHeight - window.innerHeight);
    }

    function resize(factor) {
        prompt.style.setProperty(
            '--size',
            parseFloat(
                prompt.style.getPropertyValue('--size')
            ) + factor
        );
    }

    function fullscreen(element) {
        if (fullScreenElement) {
          exitFullscreenFn();
        } else {
          requestFullscreenFn.call(element);
        }
    }

    document.addEventListener('keydown', function(event) {
        if (event.metaKey || event.ctrlKey) {
            switch (event.key) {
                case '-':
                    event.preventDefault();
                    resize(-0.1);
                break;
                case '=':
                    event.preventDefault();
                    resize(+0.1);
                break;
            }
        } else {
            switch (event.key) {
                case ' ':
                    event.preventDefault();
                    toggle();
                break;
                case 'h':
                    event.preventDefault();
                    pause();
                    rewind();
                break;
                case '-':
                    if (defaultSpeed > minimumSpeed) {
                        defaultSpeed -= stepSpeed;
                        console.log(defaultSpeed);
                    }
                break;
                case '=':
                    if (defaultSpeed < maximumSpeed) {
                        defaultSpeed += stepSpeed;
                        console.log(defaultSpeed);
                    }
                break;
                case 'f':
                    event.preventDefault();
                    fullscreen(prompt);
                break;
            }
        }
    });

    document.addEventListener('touchstart', toggle);
    document.addEventListener('DOMContentLoaded', rewind);

}());
