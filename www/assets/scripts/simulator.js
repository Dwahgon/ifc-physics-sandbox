define(["require", "exports", "./main", "./document"], function (require, exports, main_1, document_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loading simulator");
    class Simulator {
        constructor() {
            this._time = 0;
            this._isPlaying = false;
            const bottomBar = document.querySelector("#mid-menu>div:last-child");
            const queryInput = bottomBar.querySelector("input");
            if (!queryInput)
                throw "time input, play button or reset button not found";
            this.domInput = queryInput;
            this.domInput.value = this._time.toFixed(2);
            this.playButton = document_1.miscButtons.get("play-button");
            this.resetButton = document_1.miscButtons.get("reset-button");
            this.resetButton.enabled = false;
            this.domInput.addEventListener("change", () => {
                if (this.isPlaying)
                    return;
                this.fastForwardTo(Number(this.domInput.value));
            });
            this.playButton.onClick = () => {
                if (!this.isPlaying)
                    this.start();
                else
                    this.stop();
            };
            this.resetButton.onClick = this.reset.bind(this);
        }
        get time() {
            return this._time;
        }
        set time(value) {
            this._time = value;
            this.domInput.value = value.toFixed(2);
            document_1.ObjectSelectionController.propertiesEnabled = value == 0;
            document_1.ObjectCreationController.objectCreatable = value == 0;
            this.resetButton.enabled = value > 0 && !this._isPlaying;
            document_1.miscButtons.get("destroy-button").enabled = value == 0 && document_1.ObjectSelectionController.selectedObject != null && document_1.ObjectSelectionController.selectedObject.isFollowable;
        }
        get isPlaying() {
            return this._isPlaying;
        }
        set isPlaying(value) {
            this._isPlaying = value;
            this.domInput.disabled = value;
            if (!value && this.time > 0)
                this.resetButton.enabled = false;
        }
        changeButtonImage(src) {
            let img = this.playButton.element.querySelector("img");
            if (!img)
                throw "img not found in play button";
            img.src = src;
        }
        start() {
            this.isPlaying = true;
            this.changeButtonImage(Simulator.pauseSrc);
            this.simulate();
        }
        stop() {
            this.isPlaying = false;
            this.changeButtonImage(Simulator.playSrc);
        }
        reset() {
            if (this.isPlaying || this.time == 0)
                return;
            this.time = 0;
            main_1.ambient.objects.forEach(object => object.reset());
        }
        fastForwardTo(time) {
            this.reset();
            this.passTime(time);
        }
        passTime(step) {
            main_1.ambient.objects.forEach(object => object.simulate(step));
            this.time += step;
        }
        simulate() {
            this.passTime(0.016);
            if (this.isPlaying)
                window.requestAnimationFrame(this.simulate.bind(this));
        }
    }
    Simulator.playSrc = "./assets/images/play.png";
    Simulator.pauseSrc = "./assets/images/pause.png";
    exports.default = Simulator;
});
