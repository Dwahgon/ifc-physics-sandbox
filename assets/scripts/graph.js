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
define(["require", "exports", "./buttons", "./document", "./modals", "./types", "./vector2"], function (require, exports, Buttons, Document, Modal, types_1, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Buttons = __importStar(Buttons);
    Document = __importStar(Document);
    Modal = __importStar(Modal);
    vector2_1 = __importDefault(vector2_1);
    /*
        Class definitions
    */
    class PhysicsObjectValueGetter {
        constructor(name, propertyType, getValueCallbackIndex) {
            this.name = name;
            this.propertyType = propertyType;
            this.getValueCallbackIndex = getValueCallbackIndex;
            this.ambient = null;
            new Promise((resolve_1, reject_1) => { require(["./main"], resolve_1, reject_1); }).then(__importStar).then((element) => { this.ambient = element.ambient; }).catch(() => { throw "Could not import ambient"; });
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
                return vector2_1.default.distance(vector2_1.default.zero, property.value);
            };
        }
        getTargetNames() {
            if (this.ambient) {
                const objectNames = [];
                this.ambient.objects.forEach(object => {
                    if (object.getProperty(this.propertyType))
                        objectNames.push(object.name);
                });
                return objectNames;
            }
            throw "Ambient is null";
        }
        getValue(target) {
            const targetObj = this.ambient.objects.find(obj => { return obj.name == target; });
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
            new Promise((resolve_2, reject_2) => { require(["./main"], resolve_2, reject_2); }).then(__importStar).then((element) => { this.simulator = element.simulator; }).catch(() => { throw "Could not import simulator"; });
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
            this.simulate(0);
        }
        simulate(step) {
            const x = this.valueGetterX.getValue(this.targetX);
            const y = this.valueGetterY.getValue(this.targetY);
            const v2 = new vector2_1.default(x, y);
            //Remove last inserted point if the resulting line continues straight
            if (this.points.length > 3) {
                const currentIndex = this.points.length - 1;
                if (vector2_1.default.areColinear(this.points[currentIndex], this.points[currentIndex - 1], this.points[currentIndex - 2]))
                    this.points.splice(currentIndex - 1);
            }
            this.points.push(new vector2_1.default(x, y));
        }
        reset() {
            this.points = [];
            this.simulate(0);
        }
        draw(cam, con) {
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
        drawLine(con, canvasStart, canvasFinish, lineWidth, lineStyle) {
            con.lineWidth = lineWidth;
            con.strokeStyle = lineStyle;
            con.beginPath();
            //@ts-ignore
            con.moveTo(...canvasStart.toArray());
            //@ts-ignore
            con.lineTo(...canvasFinish.toArray());
            con.stroke();
        }
        drawCircle(con, centerPos, radius, strokeWidth, fillStyle, strokeStyle) {
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
    exports.Graph = Graph;
    /*
        Constants
    */
    const valueGetters = [
        new SimulatorValueGetter("Tempo", SimulatorValueGetter.TIME_CALLBACK),
        new PhysicsObjectValueGetter("Posição (eixo X)", types_1.PhysicsPropertyType.ObjectPosition, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Posição (eixo Y)", types_1.PhysicsPropertyType.ObjectPosition, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Tamanho (eixo X)", types_1.PhysicsPropertyType.ObjectSize, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Tamanho (eixo Y)", types_1.PhysicsPropertyType.ObjectSize, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Área", types_1.PhysicsPropertyType.ObjectArea, PhysicsObjectValueGetter.NUMBER_CALLBACK),
        new PhysicsObjectValueGetter("Aceleração (eixo X)", types_1.PhysicsPropertyType.ObjectAcceleration, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Aceleração (eixo Y)", types_1.PhysicsPropertyType.ObjectAcceleration, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Aceleração (módulo)", types_1.PhysicsPropertyType.ObjectAcceleration, PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK),
        new PhysicsObjectValueGetter("Velocidade (eixo X)", types_1.PhysicsPropertyType.ObjectVelocity, PhysicsObjectValueGetter.VECTOR2X_CALLBACK),
        new PhysicsObjectValueGetter("Velocidade (eixo Y)", types_1.PhysicsPropertyType.ObjectVelocity, PhysicsObjectValueGetter.VECTOR2Y_CALLBACK),
        new PhysicsObjectValueGetter("Velocidade (módulo)", types_1.PhysicsPropertyType.ObjectVelocity, PhysicsObjectValueGetter.VECTOR2_MODULUS_CALLBACK),
        new PhysicsObjectValueGetter("Deslocamento", types_1.PhysicsPropertyType.ObjectDisplacement, PhysicsObjectValueGetter.NUMBER_CALLBACK)
    ];
    const graphConfigModal = Modal.getModalById("graph-config-modal");
    const graphConfigForm = Document.documentElements.get("graph-config-form");
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
        const graph = new Graph(targetX, targetY, vGX, vGY, 4);
        graphConfigModal.setVisible(false);
        Document.GraphPanel.setElementVisible(true);
        new Promise((resolve_3, reject_3) => { require(["./main"], resolve_3, reject_3); }).then(__importStar).then(main => {
            main.simulator.add(graph);
            main.simulator.start();
        });
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
