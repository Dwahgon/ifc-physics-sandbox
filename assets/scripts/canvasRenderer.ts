class CanvasRenderer{
    private isRunning: boolean;
    private functions: Function[];
    public readonly camera: Camera;

    constructor(public readonly context: CanvasRenderingContext2D, cameraPos: Vector2, cameraZoom: number){
        this.isRunning = false;
        this.functions = [];
        this.camera = new Camera(this, cameraPos, cameraZoom);
    }

    start(){
        this.isRunning = true;
        this.render();
    }

    stop(){
        this.isRunning = false;
    }

    add(fn: Function){
        this.functions.push(fn);
    }

    remove(fn: Function){
        const index = this.functions.indexOf(fn);
        if(index > -1) 
            this.functions.splice(index, 1);
    }

    render(){
        const cam = this.camera;
        const con = this.context;
        const canvas = this.context.canvas;
        const canvasParent = canvas.parentElement!;
        
        canvas.height = canvasParent.offsetHeight;
        canvas.width = canvasParent.offsetWidth;

        this.functions.forEach(fn => fn(cam, con));
        
        if(this.isRunning)
            window.requestAnimationFrame(this.render.bind(this));
    }
}