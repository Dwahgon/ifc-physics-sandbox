console.log("Loading physicsobjects");

import Ambient from './ambient';
import { PhysicsObjectJSON, PhysicsPropertyJSON } from './fileController';
import PhysicsProperty, * as PhysicsProperties from './physicsProperties';
import { Sprite } from './rendering';
import { PhysicsObjectConfig, PhysicsObjectType, PhysicsPropertyType, Selectable, Simulatable } from './types';
import Vector2 from './vector2';

export class PhysicsObject implements Selectable, Simulatable{
    private objectProperties: PhysicsProperty<any>[];

    constructor(public readonly kind: PhysicsObjectType, public name: string, public readonly sprite: Sprite, protected ambient: Ambient){
        this.objectProperties = [];
        this.ambient.addObject(this);
    }

    addProperties(...properties: PhysicsProperty<any>[]): void{
        properties.forEach(property => this.objectProperties.push(property));
    }

    simulate(step: number): void{
        this.objectProperties.forEach(property => property.simulate(step))
    }

    reset(): void{
        this.objectProperties.forEach(property => property.reset())
    }

    /**
     * Returns rather the position(world position) parameter is located inside the object
     * @param position 
     */
    isPositionInsideObject(position: Vector2): boolean{
        const objPos = (<PhysicsProperties.ObjectPosition>this.getProperty(PhysicsPropertyType.ObjectPosition)).value;
        let objSize = (<PhysicsProperties.ObjectSize>this.getProperty(PhysicsPropertyType.ObjectSize)).value;
        objSize = Vector2.div(objSize, 2);

        return position.x >= objPos.x  - objSize.x && 
                position.x <= objPos.x + objSize.x && 
                position.y >= objPos.y - objSize.y &&
                position.y <= objPos.y + objSize.y
    }

    
    getProperty (type: PhysicsPropertyType): PhysicsProperty<any>[] |PhysicsProperty<any> | undefined {
        switch(type){
            case PhysicsPropertyType.All:
                return this.objectProperties;
            default:
                return this.objectProperties.find(physicsProperty => {return physicsProperty.kind == type});
        }
    }

    public static createPhysicsObject(type: PhysicsObjectType, ambient: Ambient, properties?: PhysicsObjectConfig): PhysicsObject{
        switch(type){
            case PhysicsObjectType.Solid:
                const solids = ambient.objects.filter(obj => { return obj.kind == type });
                return new Solid(`Sólido ${solids.length + 1}`, ambient, properties);
        }
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

    static fromJSON(json: PhysicsObjectJSON | string, ambient: Ambient): PhysicsObject{
        if(typeof json === "string"){
            return JSON.parse(
                json, 
                function(key: string, value: any){
                    return key === "" ? PhysicsObject.fromJSON(value, ambient) : value
                }
            );
        }else{
            const physicsObj = this.createPhysicsObject(json.kind, ambient);
            json.properties.forEach(prop => {
                (<PhysicsProperty<any>>physicsObj.getProperty(prop.kind)!).initialValue = prop.iValue;
            });

            return physicsObj;
        }
    }
}

class Solid extends PhysicsObject{
    constructor(name: string, ambient: Ambient, properties?: PhysicsObjectConfig){
        super(
            PhysicsObjectType.Solid, 
            name, 
            new Sprite(
                "./assets/images/solid.svg", 
                new Vector2(0, 0), 
                new Vector2(512, 512), 
                Vector2.zero,
                Vector2.zero
            ), 
            ambient);

        this.addProperties(new PhysicsProperties.ObjectPosition(properties ? properties.position : Vector2.zero, this));
        this.addProperties(new PhysicsProperties.ObjectSize(properties ? properties.size : Vector2.zero, this));
        this.addProperties(new PhysicsProperties.ObjectArea(this));
        this.addProperties(new PhysicsProperties.ObjectAcceleration(this));
        this.addProperties(new PhysicsProperties.ObjectVelocity(this));
        this.addProperties(new PhysicsProperties.ObjectDisplacement(this));
    }
}