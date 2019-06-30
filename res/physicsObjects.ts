import Ambient from './ambient';
import PhysicsProperty, * as PhysicsProperties from './physicsProperties';
import { CanvasRenderer, Sprite } from './rendering';
import Selectable from './selectable';
import { PhysicsPropertyType, PhysicsObjectType } from './types';
import Vector2 from './vector2';
import { PhysicsObjectJSON, PhysicsPropertyJSON } from './fileController';

export interface PhysicsObjectConfig{
    position: Vector2;
    size: Vector2;
}

export class PhysicsObject implements Selectable{
    private objectProperties: PhysicsProperty<any>[];

    private constructor(public readonly kind: PhysicsObjectType, public name: string, public readonly sprite: Sprite, protected ambient: Ambient){
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

    public static createPhysicsObject(type: PhysicsObjectType, canvasRenderer: CanvasRenderer, ambient: Ambient, properties?: PhysicsObjectConfig): PhysicsObject{
        switch(type){
            case PhysicsObjectType.Solid:
                const obj = new PhysicsObject(
                    type,
                    "Sólido", 
                    new Sprite(
                        canvasRenderer, 
                        "./assets/images/solid.png", 
                        new Vector2(0, 0), 
                        new Vector2(512, 512), 
                        Vector2.zero,
                        Vector2.zero
                    ),
                    ambient
                );

                obj.addProperties(new PhysicsProperties.ObjectPosition(properties ? properties.position : Vector2.zero, obj));
                obj.addProperties(new PhysicsProperties.ObjectSize(properties ? properties.size : Vector2.zero, obj));
                obj.addProperties(new PhysicsProperties.ObjectArea(obj));
                obj.addProperties(new PhysicsProperties.ObjectAcceleration(obj));
                obj.addProperties(new PhysicsProperties.ObjectVelocity(obj));
                obj.addProperties(new PhysicsProperties.ObjectDisplacement(obj));
                
                return obj;
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

    toJSON(): PhysicsObjectJSON {
        const properties: PhysicsPropertyJSON<any>[] = [];
        this.objectProperties.forEach(prop => properties.push(prop.toJSON()));
        return Object.assign({}, {
            kind: this.kind,
            properties: properties
        });
    }

    static fromJSON(json: PhysicsObjectJSON | string, canvasRenderer: CanvasRenderer, ambient: Ambient): PhysicsObject{
        if(typeof json === "string"){
            return JSON.parse(
                json, 
                function(key: string, value: any){
                    return key === "" ? PhysicsObject.fromJSON(value, canvasRenderer, ambient) : value
                }
            );
        }else{
            const physicsObj = this.createPhysicsObject(json.kind, canvasRenderer, ambient);
            json.properties.forEach(prop => {
                (<PhysicsProperty<any>>physicsObj.getProperty(prop.kind)!).initialValue = prop.iValue;
            });

            return physicsObj;
        }
    }
}