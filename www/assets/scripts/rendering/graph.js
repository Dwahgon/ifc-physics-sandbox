var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../document/buttons", "../document/documentUtilities", "../document/modals", "../main", "../vector2", "../document/documentElements"], function (require, exports, Buttons, Document, Modal, Main, vector2_1, documentElements_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Buttons = __importStar(Buttons);
    Document = __importStar(Document);
    Modal = __importStar(Modal);
    Main = __importStar(Main);
    vector2_1 = __importDefault(vector2_1);
    documentElements_1 = __importDefault(documentElements_1);
    console.log("Loading graph...");
    /*
        Class definitions
    */
    class PhysicsObjectValueGetter {
        constructor(name, propertyType, getValueCallbackIndex) {
            this.name = name;
            this.propertyType = propertyType;
            this.getValueCallbackIndex = getValueCallbackIndex;
        }
        static initialize() {
            this.getValueCallbacks = [];
            this.getValueCallbacks[this.NUMBER_CALLBACK] = function (target, propertyType) {
                const property = target.getProperty(propertyType);
                return property.value;
            };
            this.getValueCallbacks[this.VECTOR2X_CALLBACK] = function (target, propertyType) {
                const property = target.getProperty(propertyType);
                return property.value.x;
            };
            this.getValueCallbacks[this.VECTOR2Y_CALLBACK] = function (target, propertyType) {
                const property = target.getProperty(propertyType);
                return property.value.y;
            };
            this.getValueCallbacks[this.VECTOR2_MODULUS_CALLBACK] = function (target, propertyType) {
                const property = target.getProperty(propertyType);
                return property.value.magnitude();
            };
        }
        getTargetNames() {
            const objectNames = [];
            Main.ambient.objects.forEach(object => {
                if (object.getProperty(this.propertyType))
                    objectNames.push(object.name);
            });
            return objectNames;
        }
        getValue(target) {
            const targetObj = Main.ambient.objects.find(obj => { return obj.name == target; });
            return PhysicsObjectValueGetter.getValueCallbacks[this.getValueCallbackIndex](targetObj, this.propertyType);
        }
    }
    PhysicsObjectValueGetter.NUMBER_CALLBACK = 0;
    PhysicsObjectValueGetter.VECTOR2X_CALLBACK = 1;
    PhysicsObjectValueGetter.VECTOR2Y_CALLBACK = 2;
    PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK = 3;
    class SimulatorValueGetter {
        constructor(name, getValueCallback) {
            this.name = name;
            this.getValueCallback = getValueCallback;
            this.simulator = null;
            new Promise((resolve_1, reject_1) => { require(["../main"], resolve_1, reject_1); }).then(__importStar).then((element) => { this.simulator = element.simulator; }).catch(() => { throw "Could not import simulator"; });
        }
        static initialize() {
            this.getValueCallbacks = [];
            this.getValueCallbacks[this.TIME_CALLBACK] = function (simulator) {
                return simulator.time;
            };
        }
        getTargetNames() {
            return ["Simulador"];
        }
        getValue(target) {
            return SimulatorValueGetter.getValueCallbacks[this.getValueCallback](this.simulator);
        }
    }
    SimulatorValueGetter.TIME_CALLBACK = 0;
    class Graph {
        constructor(targetX, targetY, valueGetterX, valueGetterY, pointSize) {
            this.targetX = targetX;
            this.targetY = targetY;
            this.valueGetterX = valueGetterX;
            this.valueGetterY = valueGetterY;
            this.pointSize = pointSize;
            this.points = [];
            this.onMouseMoved = null;
            this.highlightedPoint = null;
            this.simulate(0);
        }
        simulate(step) {
            const x = this.valueGetterX.getValue(this.targetX);
            const y = this.valueGetterY.getValue(this.targetY);
            const newPoint = new vector2_1.default(x, y);
            //Remove last inserted point if the resulting line continues straight
            if (this.points.length > 1) {
                const lastIndex = this.points.length - 1;
                const vectorDeterminant = vector2_1.default.getVectorDeterminant(this.points[lastIndex - 1], this.points[lastIndex], newPoint);
                if (vectorDeterminant < 0.00001 && vectorDeterminant > -0.00001)
                    this.points.splice(lastIndex);
            }
            this.points.push(newPoint);
        }
        reset() {
            //this.simulate(0);
            this.points = [];
        }
        draw(canvasRenderer) {
            const cam = canvasRenderer.camera;
            const ctx = canvasRenderer.context;
            const dT = canvasRenderer.drawingTools;
            if (this.points.length > 0) {
                ctx.beginPath();
                dT.worldMoveTo(this.points[0]);
                for (let index = 1; index < this.points.length; index++)
                    dT.worldLineTo(this.points[index]);
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.lineWidth = 3;
                ctx.strokeStyle = "orange";
                ctx.stroke();
                ctx.closePath();
                this.drawCircle(dT, ctx, this.points[0], 4, "orange");
                this.drawCircle(dT, ctx, this.points[this.points.length - 1], 4, "orange");
            }
            if (this.highlightedPoint) {
                this.drawCircle(dT, ctx, this.highlightedPoint, 4, "red");
                const text = `P(${this.highlightedPoint.x.toFixed(2)}, ${this.highlightedPoint.y.toFixed(2)})`;
                const textPos = cam.getCanvasPosFromWorld(this.highlightedPoint).add(new vector2_1.default(10, -10)); //textPos = canvasHighlightedPos + V2(10, -10)
                ctx.font = "italic 15px CMU Serif";
                ctx.fillStyle = "red";
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                //@ts-ignore
                ctx.strokeText(text, ...textPos.toArray());
                //@ts-ignore
                ctx.fillText(text, ...textPos.toArray());
            }
        }
        onCanvasAdded(cR) {
            this.onMouseMoved = (ev) => this.highlightPoint(cR, ev);
            cR.context.canvas.addEventListener("mousemove", this.onMouseMoved);
        }
        onCanvasRemoved(cR) {
            if (this.onMouseMoved) {
                cR.context.canvas.removeEventListener("mousemove", this.onMouseMoved);
                this.onMouseMoved = null;
            }
        }
        drawCircle(dT, ctx, centerPos, radius, fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.beginPath();
            dT.worldArc(centerPos, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
        highlightPoint(cR, ev) {
            if (this.points.length <= 1)
                return;
            const cam = cR.camera;
            const cMousePos = new vector2_1.default(ev.offsetX, ev.offsetY);
            const wMousePos = cam.getWorldPosFromCanvas(new vector2_1.default(ev.offsetX, ev.offsetY));
            const pointListCopy = this.points.slice();
            const orderedPointList = pointListCopy.sort((a, b) => vector2_1.default.distanceSquared(wMousePos, a) - vector2_1.default.distanceSquared(wMousePos, b));
            const A = orderedPointList[0];
            const indexA = this.points.indexOf(A);
            const afterA = indexA < this.points.length ? this.points[indexA + 1] : null;
            const beforeA = indexA > 0 ? this.points[indexA - 1] : null;
            const distMouseAfterA = afterA ? vector2_1.default.distanceSquared(wMousePos, afterA) : Infinity;
            const distMouseBeforeA = beforeA ? vector2_1.default.distanceSquared(wMousePos, beforeA) : Infinity;
            const B = distMouseAfterA < distMouseBeforeA ? afterA : beforeA;
            if (!B)
                throw "B is null";
            const AB = B.sub(A);
            const AP = wMousePos.sub(A);
            const magAB = AB.magnitude() * AB.magnitude();
            const ABAPProduct = vector2_1.default.dotProduct(AP, AB);
            const dist = ABAPProduct / magAB;
            let closestPointOnLineSegment;
            if (dist < 0)
                closestPointOnLineSegment = A;
            else if (dist > 1)
                closestPointOnLineSegment = B;
            else
                closestPointOnLineSegment = A.add(AB.mult(dist)); //closestPointOnLineSegment = A + AB * dist
            this.highlightedPoint = vector2_1.default.distanceSquared(cam.getCanvasPosFromWorld(closestPointOnLineSegment), cMousePos) < 1000 ? closestPointOnLineSegment : null;
        }
    }
    exports.Graph = Graph;
    /*
        Constants
    */
    const valueGetters = [
        new SimulatorValueGetter("Tempo", SimulatorValueGetter.TIME_CALLBACK),
        new PhysicsObjectValueGetter("Posição (eixo X)", "position", PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Posição (eixo Y)", "position", PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Tamanho (eixo X)", "size", PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Tamanho (eixo Y)", "size", PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Área", "area", PhysicsObjectValueGetter.NUMBER_CALLBACK),
        new PhysicsObjectValueGetter("Aceleração (eixo X)", "acceleration", PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Aceleração (eixo Y)", "acceleration", PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Aceleração (módulo)", "acceleration", PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK),
        new PhysicsObjectValueGetter("Velocidade (eixo X)", "velocity", PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Velocidade (eixo Y)", "velocity", PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Velocidade (módulo)", "velocity", PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK),
        new PhysicsObjectValueGetter("Deslocamento (eixo X)", "displacement", PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Deslocamento (eixo Y)", "displacement", PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Deslocamento (módulo)", "displacement", PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK)
    ];
    const graphConfigModal = Modal.getModalById("graph-config-modal");
    const graphConfigForm = documentElements_1.default.get("graph-config-form");
    const xAxisPropertySelect = graphConfigForm.querySelector("#x-axis-property");
    const yAxisPropertySelect = graphConfigForm.querySelector("#y-axis-property");
    const xAxisPropertyHolderSelect = graphConfigForm.querySelector("#x-axis-property-holder");
    const yAxisPropertyHolderSelect = graphConfigForm.querySelector("#y-axis-property-holder");
    /*
        Functions
    */
    const addOptionToSelect = (select, optionText) => {
        const option = document.createElement("option");
        option.text = optionText;
        option.id = optionText;
        select.add(option);
    };
    const clearChildElements = (element) => {
        while (element.firstChild)
            element.removeChild(element.firstChild);
    };
    const fillPropertySelect = (select) => {
        clearChildElements(select);
        valueGetters.forEach(valueGetter => addOptionToSelect(select, valueGetter.name));
    };
    const fillPropertyHolderSelect = (select, valueGetter) => {
        clearChildElements(select);
        valueGetter.getTargetNames().forEach(targetName => addOptionToSelect(select, targetName));
        select.disabled = select.length < 1;
    };
    /*
        Event listeners
    */
    graphConfigForm.addEventListener("change", ev => {
        const target = ev.target;
        if (!target)
            return;
        const selectedOption = target.options[target.selectedIndex].text;
        if (target.id == "x-axis-property" || target.id == "y-axis-property")
            fillPropertyHolderSelect(target.id == "x-axis-property" ? xAxisPropertyHolderSelect : yAxisPropertyHolderSelect, valueGetters.find(vG => { return selectedOption == vG.name; }));
    });
    Buttons.getButtonById("create-graph-button").onClick = () => {
        const formData = new FormData(graphConfigForm);
        const vGX = valueGetters.find(vG => { return vG.name == formData.get("x-axis-property"); });
        const vGY = valueGetters.find(vG => { return vG.name == formData.get("y-axis-property"); });
        const targetX = formData.get("x-axis-property-holder");
        const targetY = formData.get("y-axis-property-holder");
        if (!targetX || !targetY) {
            Document.Alert.throwAlert("Há campos não preenchidos!", Document.Alert.WARNING);
            return;
        }
        const graph = new Graph(targetX, targetY, vGX, vGY, 4);
        graphConfigModal.setVisible(false);
        Document.GraphPanel.setElementVisible(true, `Gráfico ${vGY.name} x ${vGX.name}`);
        new Promise((resolve_2, reject_2) => { require(["../main"], resolve_2, reject_2); }).then(__importStar).then(main => {
            main.simulator.add(graph);
            main.simulator.start();
        });
        Document.GraphPanel.onClose = () => new Promise((resolve_3, reject_3) => { require(["../main"], resolve_3, reject_3); }).then(__importStar).then(main => main.simulator.remove(graph));
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
});
