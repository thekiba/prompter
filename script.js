(function() {

    const fullScreenElement = document.fullScreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

    const exitFullscreenFn = document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullscreen ||
        document.msExitFullscreen;

    const requestFullscreenFn = Element.prototype.requestFullscreen ||
        Element.prototype.webkitRequestFullscreen ||
        Element.prototype.mozRequestFullScreen ||
        Element.prototype.msRequestFullscreen;


    const prompt = document.querySelector('.prompt');

    let animationLoop;
    let scrollingNow = false;

    const scrollStep = 3;
    const startSpeed = 1.8;
    let defaultSpeed = startSpeed;
    const minimumSpeed = 0.1;
    const maximumSpeed = 60;
    const stepSpeed = 0.1;
    const speechRecognitionLang = 'ru-RU';

    function renderRequest() {
        window.requestAnimationFrame(render);
    }

    function render() {
        window.scrollBy(0, +(scrollStep * defaultSpeed));
        scroll();
    }

    function scroll() {
        if (window.scrollY && scrollingNow) {
            animationLoop = setTimeout(renderRequest, 16);
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

    let textPromtsNow = '';
    const intersectedElements = new Set();
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const element = entry.target;

            return entry.isIntersecting
                ? intersectedElements.add(element)
                : intersectedElements.delete(element);
        });

        textPromtsNow = Array.from(intersectedElements).map(e => e.innerText).join(' ');
        console.log(textPromtsNow);
    });

    const elements = document.getElementsByTagName('p');
    Array.from(elements).forEach(element => {
        observer.observe(element);
    });

    const SpeechRecognition = 'SpeechRecognition' in window
        ? window.SpeechRecognition
        : window.webkitSpeechRecognition;

    let recognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = speechRecognitionLang;
        recognition.continuous = true;
        recognition.interimResults = true;
    }

    if (SpeechRecognition) {
        recognition.addEventListener("result", event => {
            if (typeof event.results === "undefined") return;
            const transcript = event.results[event.results.length - 1][0].transcript
                .toLowerCase()
                .trim();

            console.log({
                transcript,
                textPromtsNow,
                compareTwoStrings: compareTwoStrings(textPromtsNow, transcript)
            });

            const similar = compareTwoStrings(textPromtsNow, transcript);
            if (similar > 0.18) {
                if (!scrollingNow) {
                    toggle();
                }
            }

            if (similar < 0.04) {
                if (scrollingNow) {
                    toggle();
                }
            }
        });
    }

    if (SpeechRecognition) {
        recognition.start();
        recognition.onend = () => {
            console.log('рестарт', recognition);
            recognition.abort()
            setTimeout(() => {
                recognition.start()
            });
        }
    }

}());
