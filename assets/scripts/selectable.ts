interface Selectable {
    isFollowable: boolean;
    name: string;
    appendPropertyListItems(ul: HTMLUListElement, enabled: boolean): void;
    getProperty(type: PropertyTypes): PhysicsProperty<any>[] | PhysicsProperty<any> | undefined;
    destroy?(): void;
}