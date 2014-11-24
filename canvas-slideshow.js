function CanvasSlideshow(element, images, audios) {
    this.element = element;
    this.imageUrls = images;
    this.audioUrls = audios;

    this.parameters = {
        slideTime: 3000,
        transitionTime: 1000,
        scale: 1.3
    };
    this.init();
}

CanvasSlideshow.prototype = {
    init: function(){
        var canvases = this.element.getElementsByTagName('canvas');
        var canvas;

        if (canvases.length === 0) {
            canvas = document.createElement('canvas');
            this.element.appendChild(canvas);
        } else {
            canvas = canvases[0];
        }

        this.canvas = canvas;
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.ctx = canvas.getContext('2d');
        this.state = {
            currentFrame: 0
        };

        this.images = [];
        this.imagePromises = [];

        for (var i = 0; i<this.imageUrls.length; i++) {
            this.images.push(new Image());
            this.images[i].src = this.imageUrls[i];
            this.imagePromises.push(this._loadPromise(this.images[i]));
        }

        Promise.all(this.imagePromises).then(this._draw.bind(this, this.images[0], 1, 1));

        this.audios = [];

        for (i = 0; i<this.audioUrls.length; i++) {
            this.audios.push(document.createElement('audio'));
            this.audios[i].src = this.audioUrls[i];
        }

        this.animationState = {
            index: 0,
            startTime: 0,
            current: {
                opacity: 1,
                scale: 1
            },
            prev: {
                animated: false,
                opacity: 0,
                scale: this.parameters.scale
            }
        };

        this.paused = 0;
        this.played = false;

        this.parameters.totalTime = this.parameters.slideTime + this.parameters.transitionTime;

        this.bindEvents();
    },

    _render: function(){
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        if (this.animationState.prev.animated) {
            this._draw(this.images[this.animationState.index - 1], this.animationState.prev.opacity, this.animationState.prev.scale);
        }

        this._draw(this.images[this.animationState.index], this.animationState.current.opacity, this.animationState.current.scale);
    },

    _step: function(time) {
        this._render();

        var timeDif = (time - this.animationState.startTime);
        if (timeDif/this.parameters.slideTime >= this.animationState.index + 1) {
            this.animationState.index ++;
            if (this.animationState.index === this.images.length) {
                return false;
            }
            this.animationState.prev.animated = true;
        }

        var slideTime = timeDif % this.parameters.slideTime;

        if (slideTime > this.parameters.transitionTime) {
            this.animationState.prev.animated = false;
        }

        if (this.animationState.prev.animated) {
            this.animationState.prev.opacity = this._timingValue(slideTime, this.parameters.transitionTime, 1, 0);
            this.animationState.prev.scale = this._timingValue(slideTime + this.parameters.slideTime, this.parameters.totalTime, 1, this.parameters.scale);
            this.animationState.current.opacity = this._timingValue(slideTime, this.parameters.transitionTime, 0, 1);
        }

        this.animationState.current.scale = this._timingValue(slideTime, this.parameters.totalTime, 1, this.parameters.scale);

        this.requestAnimationFrameId = window.requestAnimationFrame(this._step.bind(this));
    },

    _timingValue: function(currentTime, endTime, startValue, endValue) {
        return startValue + currentTime/endTime * (endValue - startValue);
    },

    _draw: function(image, opacity, scale){
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.scale(scale, scale);
        this.ctx.drawImage(image, (this.canvas.width/scale - image.width)/2, (this.canvas.height/scale - image.height)/2);
        //this.ctx.drawImage(image, 0, 0, image.width, image.height, (this.canvas.width/scale - this.canvas.width)/2, (this.canvas.height/scale - this.canvas.height)/2, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    },

    bindEvents: function(){
        var _this = this;
        this.element.getElementsByClassName('cs-play')[0].onclick = function(){
            _this.play();
        };
        this.element.getElementsByClassName('cs-pause')[0].onclick = function(){
            _this.pause();
        };
    },

    pause: function(){
        if (!this.played)
            return false;

        window.cancelAnimationFrame(this.requestAnimationFrameId);
        this.paused = performance.now() - this.animationState.startTime;
        this.played = false;
        this.audios[0].pause();
    },

    play: function() {
        if (this.played)
            return false;

        this.animationState.startTime = performance.now() - this.paused;
        window.requestAnimationFrame(this._step.bind(this));
        this.played = true;
        this.audios[0].play();
    },

    _loadPromise: function(image) {
        return new Promise(function(resolve){
            image.onload = function(){
                resolve();
            };
        });
    }
};