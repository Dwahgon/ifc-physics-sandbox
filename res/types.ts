console.log("Loading types");

import PhysicsProperty from './physicsProperties';
import { Camera } from './rendering';
import Vector2 from './vector2';

export enum ButtonColor {
    Dark = "dark-button",
    White = "white-button",
    InvisibleBackground = "invisible-bg-button"
}

export enum PhysicsPropertyType {
    All = 0,
    ObjectPosition = 1,
    ObjectAcceleration = 2,
    ObjectSize = 3,
    ObjectArea = 4,
    ObjectVelocity = 5,
    ObjectDisplacement = 6
}

export enum PhysicsObjectType {
    Solid = 0
}

export interface Selectable {
    isFollowable: boolean;
    name: string;
    appendPropertyListItems?(ul: HTMLUListElement, enabled: boolean): void;
    getProperty(type: PhysicsPropertyType): PhysicsProperty<any>[] | PhysicsProperty<any> | undefined;
    destroy?(): void;
}

export interface PhysicsObjectConfig {
    position: Vector2;
    size: Vector2;
}

export interface Simulatable {
    simulate(step: number): void;
    reset(): void;
}

export interface Renderable {
    draw(cam: Camera, con: CanvasRenderingContext2D): void;
}

export interface ButtonConfig {
    buttonName: string;
    buttonColor: ButtonColor;
    enabled: boolean;
    imgSrc?: string;
    altImgSrc?: string;
    title?: string;
    altTitle?: string;
    func?: string;
    args?: string;
}

export interface ValueGetter {
    name: string;
    getTargetNames(): string[];
    getValue(target: string): number;
}