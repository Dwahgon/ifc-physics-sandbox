import Ambient from "./ambient";
import * as Buttons from "./buttons";
import * as Document from "./document";
import * as Modal from "./modals";
import { PhysicsObject } from "./physicsObjects";
import PhysicsProperty from "./physicsProperties";
import { Camera, CanvasRenderer } from "./rendering";
import Simulator from "./simulator";
import { PhysicsPropertyType, Renderable, Simulatable, ValueGetter } from "./types";
import Vector2 from "./vector2";

/*
    Class definitions
*/

class PhysicsObjectValueGetter implements ValueGetter {
    public static readonly NUMBER_CALLBACK: number = 0;
    public static readonly VECTOR2X_CALLBACK: number = 1;
    public static readonly VECTOR2Y_CALLBACK: number = 2;
    public static readonly VECTOR2_MODULUS_CALLBACK: number = 3;

    private static getValueCallbacks: Function[];
    private ambient: Ambient | null;

    constructor(public name: string, public readonly propertyType: PhysicsPropertyType, private getValueCallbackIndex: number) {
        this.ambient = null;
        import("./main").then(
            (element) => { this.ambient = element.ambient; }
        ).catch(
            () => { throw "Could not import ambient"; }
        );
    }

    static initialize() {
        this.getValueCallbacks = [];
        this.getValueCallbacks[this.NUMBER_CALLBACK] = function (target: PhysicsObject, propertyType: PhysicsPropertyType) {
            const property = <PhysicsProperty<Number>>target.getProperty(propertyType);
            return property.value;
        }

        this.getValueCallbacks[this.VECTOR2X_CALLBACK] = function (target: PhysicsObject, propertyType: PhysicsPropertyType) {
            const property = <PhysicsProperty<Vector2>>target.getProperty(propertyType);
            return property.value.x;
        };

        this.getValueCallbacks[this.VECTOR2Y_CALLBACK] = function (target: PhysicsObject, propertyType: PhysicsPropertyType) {
            const property = <PhysicsProperty<Vector2>>target.getProperty(propertyType);
            return property.value.y;
        };

        this.getValueCallbacks[this.VECTOR2_MODULUS_CALLBACK] = function (target: PhysicsObject, propertyType: PhysicsPropertyType) {
            const property = <PhysicsProperty<Vector2>>target.getProperty(propertyType);
            return Vector2.distance(Vector2.zero, property.value);
        };
    }

    getTargetNames(): string[] {
        if (this.ambient) {
            const objectNames: string[] = [];

            this.ambient.objects.forEach(object => {
                if (object.getProperty(this.propertyType))
                    objectNames.push(object.name);
            });

            return objectNames;
        }

        throw "Ambient is null";
    }

    getValue(target: string): number {
        const targetObj = this.ambient!.objects.find(obj => { return obj.name == target });
        return PhysicsObjectValueGetter.getValueCallbacks[this.getValueCallbackIndex]!(targetObj, this.propertyType);
    }
}

class SimulatorValueGetter implements ValueGetter {
    public static readonly TIME_CALLBACK = 0;

    private static getValueCallbacks: Function[];
    private simulator: Simulator | null;

    constructor(public name: string, private readonly getValueCallback: number) {
        this.simulator = null;
        import("./main").then(
            (element) => { this.simulator = element.simulator; }
        ).catch(
            () => { throw "Could not import simulator"; }
        );
    }

    static initialize() {
        this.getValueCallbacks = [];
        this.getValueCallbacks[this.TIME_CALLBACK] = function (simulator: Simulator) {
            return simulator.time;
        };
    }

    getTargetNames(): string[] {
        return ["Simulador"];
    }

    getValue(target: string): number {
        return SimulatorValueGetter.getValueCallbacks[this.getValueCallback](this.simulator);
    }
}

export class Graph implements Renderable, Simulatable {
    private points: Vector2[];
    private onMouseMoved: ((ev: MouseEvent) => void) | null;

    constructor(private readonly targetX: string, private readonly targetY: string, public readonly valueGetterX: ValueGetter, public readonly valueGetterY: ValueGetter, private pointSize: number) {
        this.points = [];
        this.onMouseMoved = null;

        this.simulate(0);
    }
    
    simulate(step: number): void {
        const x = this.valueGetterX.getValue(this.targetX);
        const y = this.valueGetterY.getValue(this.targetY);
        const newPoint = new Vector2(x, y);

        //Remove last inserted point if the resulting line continues straight
        if (this.points.length > 1) {
            const lastIndex = this.points.length - 1;
            const vectorDeterminant = Vector2.getVectorDeterminant(this.points[lastIndex - 1], this.points[lastIndex], newPoint);
            if (vectorDeterminant < 0.00001 && vectorDeterminant > -0.00001)
                this.points.splice(lastIndex);
        }

        this.points.push(newPoint);
    }
    reset(): void {
        this.points = [];
        this.simulate(0);
    }
    draw(cam: Camera, con: CanvasRenderingContext2D): void {
        if (this.points.length > 0) {
            for (let index = 0; index < this.points.length; index++) {
                const pointStart = this.points[index];
                const pointFinish = this.points[index + 1];
                const canvasStart = cam.getCanvasPosFromWorld(pointStart);

                if (pointFinish) {
                    const canvasFinish = cam.getCanvasPosFromWorld(pointFinish);
                    this.drawLine(con, canvasStart, canvasFinish, 5, "black");
                    this.drawLine(con, canvasStart, canvasFinish, 3, "orange");
                }
            }

            this.drawCircle(con, cam.getCanvasPosFromWorld(this.points[0]), 4, 2, "orange", "black");
            this.drawCircle(con, cam.getCanvasPosFromWorld(this.points[this.points.length - 1]), 4, 2, "orange", "black");
        }
    }

    private drawLine(con: CanvasRenderingContext2D, canvasStart: Vector2, canvasFinish: Vector2, lineWidth: number, lineStyle: string) {
        con.lineWidth = lineWidth;
        con.strokeStyle = lineStyle;
        con.beginPath();
        //@ts-ignore
        con.moveTo(...canvasStart.toArray());
        //@ts-ignore
        con.lineTo(...canvasFinish.toArray());
        con.stroke();
    }

    private drawCircle(con: CanvasRenderingContext2D, centerPos: Vector2, radius: number, strokeWidth: number, fillStyle: string, strokeStyle: string) {
        con.lineWidth = strokeWidth;
        con.strokeStyle = strokeStyle;
        con.fillStyle = fillStyle;

        con.beginPath();
        //@ts-ignore
        con.arc(...centerPos.toArray(), radius, 0, 2 * Math.PI);
        con.fill();
        con.stroke();
    }
}

/*
    Constants
*/

const valueGetters: ValueGetter[] = [
    new SimulatorValueGetter("Tempo", SimulatorValueGetter.TIME_CALLBACK),
    new PhysicsObjectValueGetter("Posição (eixo X)", PhysicsPropertyType.ObjectPosition, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
    new PhysicsObjectValueGetter("Posição (eixo Y)", PhysicsPropertyType.ObjectPosition, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
    new PhysicsObjectValueGetter("Tamanho (eixo X)", PhysicsPropertyType.ObjectSize, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
    new PhysicsObjectValueGetter("Tamanho (eixo Y)", PhysicsPropertyType.ObjectSize, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
    new PhysicsObjectValueGetter("Área", PhysicsPropertyType.ObjectArea, PhysicsObjectValueGetter.NUMBER_CALLBACK),
    new PhysicsObjectValueGetter("Aceleração (eixo X)", PhysicsPropertyType.ObjectAcceleration, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
    new PhysicsObjectValueGetter("Aceleração (eixo Y)", PhysicsPropertyType.ObjectAcceleration, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
    new PhysicsObjectValueGetter("Aceleração (módulo)", PhysicsPropertyType.ObjectAcceleration, PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK),
    new PhysicsObjectValueGetter("Velocidade (eixo X)", PhysicsPropertyType.ObjectVelocity, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
    new PhysicsObjectValueGetter("Velocidade (eixo Y)", PhysicsPropertyType.ObjectVelocity, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
    new PhysicsObjectValueGetter("Velocidade (módulo)", PhysicsPropertyType.ObjectVelocity, PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK),
    new PhysicsObjectValueGetter("Deslocamento (eixo X)", PhysicsPropertyType.ObjectDisplacement, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
    new PhysicsObjectValueGetter("Deslocamento (eixo Y)", PhysicsPropertyType.ObjectDisplacement, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
    new PhysicsObjectValueGetter("Deslocamento (módulo)", PhysicsPropertyType.ObjectDisplacement, PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK)
];

const graphConfigModal = Modal.getModalById("graph-config-modal")!;
const graphConfigForm = <HTMLFormElement>Document.documentElements.get("graph-config-form")!;
const xAxisPropertySelect = <HTMLSelectElement>graphConfigForm.querySelector("#x-axis-property")!;
const yAxisPropertySelect = <HTMLSelectElement>graphConfigForm.querySelector("#y-axis-property")!;
const xAxisPropertyHolderSelect = <HTMLSelectElement>graphConfigForm.querySelector("#x-axis-property-holder")!;
const yAxisPropertyHolderSelect = <HTMLSelectElement>graphConfigForm.querySelector("#y-axis-property-holder")!;

/*
    Functions
*/

const addOptionToSelect = (select: HTMLSelectElement, optionText: string) => {
    const option = document.createElement("option");
    option.text = optionText;
    option.id = optionText;

    select.add(option);
}

const clearChildElements = (element: Element) => {
    while (element.firstChild)
        element.removeChild(element.firstChild);
}

const fillPropertySelect = (select: HTMLSelectElement) => {
    clearChildElements(select);

    valueGetters.forEach(valueGetter => addOptionToSelect(select, valueGetter.name));
}

const fillPropertyHolderSelect = (select: HTMLSelectElement, valueGetter: ValueGetter) => {
    clearChildElements(select);

    valueGetter.getTargetNames().forEach(targetName => addOptionToSelect(select, targetName));

    select.disabled = select.length < 1;
}

/*
    Event listeners
*/

graphConfigForm.addEventListener("change", ev => {
    const target = <HTMLSelectElement>ev.target;
    if (!target)
        return;

    const selectedOption = target.options[target.selectedIndex].text;

    if (target.id == "x-axis-property" || target.id == "y-axis-property")
        fillPropertyHolderSelect(
            target.id == "x-axis-property" ? xAxisPropertyHolderSelect : yAxisPropertyHolderSelect,
            valueGetters.find(vG => { return selectedOption == vG.name })!
        );
});

Buttons.getButtonById("create-graph-button")!.onClick = () => {
    const formData = new FormData(graphConfigForm);
    const vGX = valueGetters.find(vG => { return vG.name == formData.get("x-axis-property") })!;
    const vGY = valueGetters.find(vG => { return vG.name == formData.get("y-axis-property") })!;
    const targetX = <string>formData.get("x-axis-property-holder");
    const targetY = <string>formData.get("y-axis-property-holder");

    if(!targetX || !targetY){
        Document.Alert.throwAlert("Possuem campos não preenchidos!", Document.Alert.WARNING);
        return;
    }

    const graph = new Graph(targetX, targetY, vGX, vGY, 4);

    graphConfigModal.setVisible(false);

    Document.GraphPanel.setElementVisible(true, `Gráfico ${vGY.name} x ${vGX.name}`);

    import("./main").then(
        main => {
            main.simulator.add(graph);
            main.simulator.start();
        }
    )

    Document.GraphPanel.onClose = () => import("./main").then(main => main.simulator.remove(graph));

    Document.GraphPanel.renderGraph(graph);
};

/*
    Other code
*/

PhysicsObjectValueGetter.initialize();
SimulatorValueGetter.initialize();
fillPropertySelect(xAxisPropertySelect);
fillPropertySelect(yAxisPropertySelect);
graphConfigModal.onOpen = () => {
    xAxisPropertySelect.value = "Tempo";
    yAxisPropertySelect.value = "Velocidade (módulo)";
    xAxisPropertySelect.dispatchEvent(new Event("change", { bubbles: true }));
    yAxisPropertySelect.dispatchEvent(new Event("change", { bubbles: true }));
};
