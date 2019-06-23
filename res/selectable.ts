import PhysicsProperty from 'physicsProperties';
import { PhysicsPropertyType } from 'types';

export default interface Selectable {
    isFollowable: boolean;
    name: string;
    appendPropertyListItems?(ul: HTMLUListElement, enabled: boolean): void;
    getProperty(type: PhysicsPropertyType): PhysicsProperty<any>[] | PhysicsProperty<any> | undefined;
    destroy?(): void;
}