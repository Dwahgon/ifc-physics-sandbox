console.log("Loading types");

import PhysicsProperty from './physicsProperties';
import { Camera, CanvasRenderer } from './rendering';
import Vector2 from './vector2';

/* Enums */ 

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

/* Interfaces */

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
    draw(canvasRenderer: CanvasRenderer, step?: DOMHighResTimeStamp): void;
    onCanvasAdded?(canvasRenderer: CanvasRenderer): void;
    onCanvasRemoved?(canvasRenderer: CanvasRenderer): void;
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

export interface CartesianPlaneStyle {
    xAxisStyle: string;
    yAxisStyle: string;
    gridStyle: string;
    originStyle: string;
    measurementStyle?: string;

    axisLineThickness: number;
    gridThickness: number;
    
    axisMarkerFont: string;
    axisNameFont: string;
    measurementFont?: string;

    showMeasurements: boolean;
}

export interface VectorGizmosStyle{
    style: string;
    strokeStyle?: string;
    lineThickness: number;
    strokeThickness?:number;
    headLength: number;
}