class Camera {
    private targetObjectPosition: ObjectPosition | null;

    constructor(private canvasRenderer: CanvasRenderer, private _pos: Vector2, public zoom: number) {
        this.targetObjectPosition = null;
        
        let canvas = this.canvasRenderer.context.canvas;
        canvas.addEventListener("wheel", this.onWheelEvent.bind(this))
    }

    getWorldPosFromCanvas(canvasPos: Vector2): Vector2 {
        const canvas = this.canvasRenderer.context.canvas;

        const posX = ((canvas.width / 2) - this.pos.x - canvasPos.x) / -this.zoom;
        const posY = ((canvas.height / 2) + this.pos.y - canvasPos.y) / this.zoom;

        return new Vector2(posX, posY);
    }

    getCanvasPosFromWorld(worldPos: Vector2): Vector2 {
        const canvas = this.canvasRenderer.context.canvas;

        const posX = (canvas.width / 2) + worldPos.x * this.zoom - this.pos.x;
        const posY = (canvas.height / 2) - worldPos.y * this.zoom + this.pos.y;

        return new Vector2(posX, posY);
    }

    get pos(){
        if(this.targetObjectPosition){
            return Vector2.mult(this.targetObjectPosition.value, this.zoom);
        }
        
        return this._pos;
    }

    set pos(value: Vector2){
        if(this.targetObjectPosition)
            this.unfollowObject();
        
        this._pos = value;
    }

    get objectBeingFollowed(){
        if(this.targetObjectPosition)
            return this.targetObjectPosition.object;
        
        return null;
    }

    followObject(object: PhysicsObject){
        if(!object.isFollowable)
            throw "Attemting to follow an unfollowable object";
        
        this.targetObjectPosition = <ObjectPosition>object.getProperty("ObjectPosition");

        this.changeButtonText(false);
    }

    unfollowObject(){
        this.changeButtonText(true);

        this.targetObjectPosition = null;
    }

    centralize(){
        this.pos = Vector2.zero;
    }

    private changeButtonText(isFollowing: boolean){
        const documentUI = System.documentUI;
        const followButton = documentUI.getButton("follow-button");
        
        if(documentUI.selectedObject == this.objectBeingFollowed)
            followButton.element.innerHTML = (isFollowing) ? "Seguir" : "Parar de seguir";
    }

    private onWheelEvent(ev: WheelEvent){
        this.zoom += ev.deltaY / -100;

        if (this.zoom < 0.1)
            this.zoom = 0.1;
        else if (this.zoom > 200)
            this.zoom = 200;
    }
}