class Sprite {
    public drawSize: Vector2;
    private image: HTMLImageElement;
    private drawFunction: Function;

    constructor(private renderer: CanvasRenderer, imageSrc: string, public copyPosition: Vector2, public copySize: Vector2, public drawPosition: Vector2, drawSize: Vector2) {
        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        this.image = imgElement;

        this.drawSize = drawSize;
        this.drawFunction = this.draw.bind(this);

        renderer.add(this.drawFunction);
    }

    getZoomedSize(zoom: number): Vector2{
        return Vector2.mult(this.drawSize, zoom);
    }

    draw(): void{
        // @ts-ignore
        this.renderer.context.drawImage(this.image, 
            ...this.copyPosition.toArray(), 
            ...this.copySize.toArray(), 
            ...this.getPositionInCanvas().toArray(), 
            ...this.getZoomedSize(this.renderer.camera.zoom).toArray()
        );
    }

    stopDrawing(): void{
        this.renderer.remove(this.drawFunction);
    }

    getPositionInCanvas(): Vector2{
        const camera = this.renderer.camera;
        
        return Vector2.sub(camera.getCanvasPosFromWorld(this.drawPosition), Vector2.div(this.getZoomedSize(camera.zoom), 2));
    }

    positionIsInsideSprite(pos: Vector2){
        const posInCan = this.getPositionInCanvas();
        const cam = this.renderer.camera;

        if(pos.x > posInCan.x && pos.x < posInCan.x + this.getZoomedSize(cam.zoom).x && pos.y > posInCan.y && pos.y < posInCan.y + this.getZoomedSize(cam.zoom).y)
            return true;

        return false;
    }
}