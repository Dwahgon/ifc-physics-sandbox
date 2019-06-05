import PhysicsObject from 'physicsObjects';
import PropertyLI from 'propertyLI';
import Selectable from 'selectable';

export default class Ambient implements Selectable {
    public readonly objects: PhysicsObject[];

    constructor() {
        this.objects = [];
    }

    getObjectOnPosition(pos: Vector2): PhysicsObject | null {
        for (const obj of this.objects) {
            if (obj.sprite.positionIsInsideSprite(pos))
                return obj;
        }

        return null;
    }

    addObject(obj: PhysicsObject): void{
        this.objects.push(obj);
    }

    /* Selectable */

    get name(): string {
        return "Ambiente";
    }

    appendPropertyListItems(ul: HTMLUListElement, enabled: boolean): PropertyLI<any>[] {
        let empty: PropertyLI<any>[] = [];
        return empty;
    }

    getProperty(): undefined {
        return undefined;
    }

    get isFollowable(){
        return false;
    }
}
