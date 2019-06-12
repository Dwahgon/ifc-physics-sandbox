import Ambient from 'ambient';
import PhysicsProperty, * as PhysicsProperties from 'physicsProperties';
import { CanvasRenderer, Sprite } from 'rendering';
import Selectable from 'selectable';
import { PhysicsPropertyType } from 'types';
import Vector2 from 'vector2';

export default abstract class PhysicsObject implements Selectable{
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

    
    getProperty (type: PhysicsPropertyType): PhysicsProperty<any>[] |PhysicsProperty<any> | undefined {
        switch(type){
            case PhysicsPropertyType.All:
                return this.objectProperties;
            default:
                return this.objectProperties.find(physicsProperty => {return physicsProperty.kind == type});
        }
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

export class Solid extends PhysicsObject{
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

        this.addProperties(new PhysicsProperties.ObjectPosition(position, this));
        this.addProperties(new PhysicsProperties.ObjectSize(size, this));
        this.addProperties(new PhysicsProperties.ObjectArea(this));
        this.addProperties(new PhysicsProperties.ObjectAcceleration(this));
        this.addProperties(new PhysicsProperties.ObjectVelocity(this));
        this.addProperties(new PhysicsProperties.ObjectDisplacement(this));
    }
}