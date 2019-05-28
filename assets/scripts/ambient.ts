class Ambient implements Selectable {
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

    getName(): string {
        return "Ambiente";
    }

    appendPropertyListItems(ul: HTMLUListElement, enabled: boolean): PropertyLI<any>[] {
        let empty: PropertyLI<any>[] = [];
        return empty;
    }

    getObjectProperties(): PhysicsProperty<any>[] {
        let empty: PhysicsProperty<any>[] = [];
        return empty;
    }

    get isFollowable(){
        return false;
    }

    get isDeletable(){
        return false;
    }
    
    destroy(): void {
        throw new Error("Method not implemented.");
    }
}
