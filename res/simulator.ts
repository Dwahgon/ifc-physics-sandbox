import { ambient } from './main';
import { DocumentButton, miscButtons, ObjectSelectionController, ObjectCreationController } from './document';


export default class Simulator {
    private static playSrc: string = "./assets/images/play.png";
    private static pauseSrc: string = "./assets/images/pause.png";

    private _time: number;
    private _isPlaying: boolean;
    private domInput: HTMLInputElement;
    private playButton: DocumentButton;
    private resetButton: DocumentButton;

    constructor(){
        this._time = 0;
        this._isPlaying = false;
        
        const bottomBar = document.querySelector("#mid-menu>div:last-child");
        const queryInput = bottomBar!.querySelector("input");

        if(!queryInput)
            throw "time input, play button or reset button not found";
        
        this.domInput = <HTMLInputElement>queryInput;
        this.domInput.value = this._time.toFixed(2);
        this.playButton = miscButtons.get("play-button")!;
        this.resetButton = miscButtons.get("reset-button")!;

        this.domInput.addEventListener("change", () => {
            if(this.isPlaying)
                return;
            
            this.fastForwardTo(Number(this.domInput.value));
        });

        this.playButton.onClick = () => {
            if(!this.isPlaying)
                this.start();
            else
                this.stop();
        };

        this.resetButton.onClick = this.reset.bind(this);
    }

    get time(): number{
        return this._time;
    }

    set time(value: number){
        this._time = value;
        this.domInput.value = value.toFixed(2);

        ObjectSelectionController.propertiesEnabled = value == 0;
        ObjectCreationController.objectCreatable = value == 0;

        this.resetButton.enabled = value > 0 && !this._isPlaying;
        miscButtons.get("destroy-button")!.enabled = value == 0 && ObjectSelectionController.selectedObject != null && ObjectSelectionController.selectedObject.isFollowable;
    }

    get isPlaying(){
        return this._isPlaying;
    }

    set isPlaying(value: boolean){
        this._isPlaying = value;
        this.domInput.disabled = value;

        if(!value && this.time > 0)
            this.resetButton.enabled = false
    }

    private changeButtonImage(src: string): void{
        let img = this.playButton.element.querySelector("img");
        if(!img)
            throw "img not found in play button"
        
        img.src = src;
    }

    start(): void{
        this.isPlaying = true;
        this.changeButtonImage(Simulator.pauseSrc);
        this.simulate();
    }

    stop(): void{
        this.isPlaying = false;
        this.changeButtonImage(Simulator.playSrc);
    }

    reset(): void{
        if(this.isPlaying || this.time == 0)
            return;

        this.time = 0;
        ambient.objects.forEach(object => object.reset())
    }
    
    fastForwardTo(time: number){
        this.reset();
        this.passTime(time);
    }

    private passTime(step: number){
        ambient.objects.forEach(object => object.simulate(step))
        this.time += step;
    }

    private simulate(): void{
        this.passTime(0.016);

        if(this.isPlaying)
            window.requestAnimationFrame(this.simulate.bind(this));
    }
}