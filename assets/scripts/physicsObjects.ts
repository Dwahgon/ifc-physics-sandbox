abstract class PhysicsObject implements Selectable{
    private objectProperties: PhysicsProperty<any>[];

    constructor(public name: string, public readonly sprite: Sprite, protected ambient: Ambient){
        this.objectProperties = [];
        this.ambient.addObject(this);
    }

    addProperties(...properties: PhysicsProperty<any>[]): void{
        properties.forEach(property => this.objectProperties.push(property));
    }

    simulate(step: number): void{
        this.objectProperties.forEach(property => property.simulateStep(step))
    }

    reset(): void{
        this.objectProperties.forEach(property => property.reset())
    }

    
    getProperty (propertyName: string): PhysicsProperty<any> | undefined {
        for (const property of this.objectProperties) {
            if (property.name == propertyName)
            return property;
        }
        
        return undefined;
    }
    
    /* Selectable */
    
    getName(): string {
        return this.name;
    }
    
    appendPropertyListItems(): void{
        this.objectProperties.forEach(property=>{
            if(property.propertyLI)
            property.propertyLI.appendToPropertyUL();
        });
    }
    
    getObjectProperties(): PhysicsProperty<any>[] {
        return this.objectProperties;
    }
    
    get isFollowable(){
        return true;
    }
    
    get isDeletable(){
        return true;
    }
    
    destroy(): void{
        this.sprite.stopDrawing();
    
        const index = this.ambient.objects.indexOf(this);
        this.ambient.objects.splice(index, 1);
    }
}

class Solid extends PhysicsObject{
    public static readonly button: ObjectLI = new ObjectLI(
        "Sólido", 
        "./assets/images/dwagao.png", 
        function(canvasRenderer: CanvasRenderer, ambient: Ambient){
            new Solid(
                canvasRenderer, 
                ambient,
                canvasRenderer.camera.getWorldPosFromCanvas(
                    new Vector2(canvasRenderer.context.canvas.width / 2, canvasRenderer.context.canvas.height / 2)
                ),
                new Vector2(1, 1)
            )
        }
    );

    constructor(canvasRenderer: CanvasRenderer, ambient: Ambient, position: Vector2, size: Vector2){
        super(
            "Sólido",
            new Sprite(
                canvasRenderer,
                "./assets/images/dwagao.png",
                new Vector2(0, 0),
                new Vector2(512, 512),
                position,
                size
            ),
            ambient         
        ); 

        this.addProperties(new ObjectPosition(position, this));
        this.addProperties(new ObjectSize(size, this));
        this.addProperties(new ObjectArea(this));
        this.addProperties(new ObjectAcceleration(this));
        this.addProperties(new ObjectVelocity(this));
        this.addProperties(new ObjectDisplacement(this));
    }
}