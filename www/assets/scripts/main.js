var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define("vector2", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Vector2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        toArray() {
            return [this.x, this.y];
        }
        clone() {
            return new Vector2(this.x, this.y);
        }
        toString() {
            return "(" + this.x + ", " + this.y + ")";
        }
        static get zero() {
            return new Vector2(0, 0);
        }
        static distance(a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }
        static sum(a, b) {
            return new Vector2(a.x + b.x, a.y + b.y);
        }
        static sub(a, b) {
            return new Vector2(a.x - b.x, a.y - b.y);
        }
        static mult(a, b) {
            if (typeof (a) == "number" && typeof (b) == "object")
                return new Vector2(a * b.x, a * b.y);
            if (typeof (a) == "object" && typeof (b) == "number")
                return new Vector2(a.x * b, a.y * b);
            if (typeof (a) == "object" && typeof (b) == "object")
                return new Vector2(a.x * b.x, a.y * b.y);
            throw "arguments 'a' and 'b' are either both numbers";
        }
        static div(a, b) {
            if (typeof (a) == "number" && typeof (b) == "object")
                return new Vector2(a / b.x, a / b.y);
            if (typeof (a) == "object" && typeof (b) == "number")
                return new Vector2(a.x / b, a.y / b);
            if (typeof (a) == "object" && typeof (b) == "object")
                return new Vector2(a.x / b.x, a.y / b.y);
            throw "arguments 'a' and 'b' are either both numbers";
        }
        static equals(a, b) {
            return a.x == b.x && a.y == b.y;
        }
    }
    exports.default = Vector2;
});
define("genericCalulator", ["require", "exports", "vector2"], function (require, exports, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    class Vector2Calculator {
        constructor() { }
        sum(a, b) {
            return vector2_1.default.sum(a, b);
        }
        sub(a, b) {
            return vector2_1.default.sub(a, b);
        }
        mult(a, b) {
            return vector2_1.default.mult(a, b);
        }
        div(a, b) {
            return vector2_1.default.div(a, b);
        }
    }
    Vector2Calculator.instance = new Vector2Calculator();
    exports.Vector2Calculator = Vector2Calculator;
    class NumberCalculator {
        constructor() { }
        sum(a, b) {
            return a + b;
        }
        sub(a, b) {
            return a - b;
        }
        mult(a, b) {
            return a * b;
        }
        div(a, b) {
            return a / b;
        }
    }
    NumberCalculator.instance = new NumberCalculator();
    exports.NumberCalculator = NumberCalculator;
});
define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ButtonColor;
    (function (ButtonColor) {
        ButtonColor["Dark"] = "dark-button";
        ButtonColor["White"] = "white-button";
    })(ButtonColor = exports.ButtonColor || (exports.ButtonColor = {}));
    var DocumentButtonKind;
    (function (DocumentButtonKind) {
        DocumentButtonKind["MiscButton"] = "misc-button";
        DocumentButtonKind["CreateObjectButton"] = "create-object-button";
        DocumentButtonKind["PropertyButton"] = "property-button";
    })(DocumentButtonKind = exports.DocumentButtonKind || (exports.DocumentButtonKind = {}));
    var PhysicsPropertyType;
    (function (PhysicsPropertyType) {
        PhysicsPropertyType[PhysicsPropertyType["All"] = 0] = "All";
        PhysicsPropertyType[PhysicsPropertyType["ObjectPosition"] = 1] = "ObjectPosition";
        PhysicsPropertyType[PhysicsPropertyType["ObjectAcceleration"] = 2] = "ObjectAcceleration";
        PhysicsPropertyType[PhysicsPropertyType["ObjectSize"] = 3] = "ObjectSize";
        PhysicsPropertyType[PhysicsPropertyType["ObjectArea"] = 4] = "ObjectArea";
        PhysicsPropertyType[PhysicsPropertyType["ObjectVelocity"] = 5] = "ObjectVelocity";
        PhysicsPropertyType[PhysicsPropertyType["ObjectDisplacement"] = 6] = "ObjectDisplacement";
    })(PhysicsPropertyType = exports.PhysicsPropertyType || (exports.PhysicsPropertyType = {}));
    var PhysicsObjectType;
    (function (PhysicsObjectType) {
        PhysicsObjectType[PhysicsObjectType["Solid"] = 0] = "Solid";
    })(PhysicsObjectType = exports.PhysicsObjectType || (exports.PhysicsObjectType = {}));
});
define("rendering", ["require", "exports", "types", "vector2", "document"], function (require, exports, types_1, vector2_2, document_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_2 = __importDefault(vector2_2);
    class CanvasRenderer {
        constructor(context, cameraPos, cameraZoom) {
            this.context = context;
            this.isRunning = false;
            this.functions = [];
            this.camera = new Camera(this, cameraPos, cameraZoom);
        }
        start() {
            this.isRunning = true;
            this.render();
        }
        stop() {
            this.isRunning = false;
        }
        add(fn) {
            this.functions.push(fn);
        }
        remove(fn) {
            const index = this.functions.indexOf(fn);
            if (index > -1)
                this.functions.splice(index, 1);
        }
        render() {
            const cam = this.camera;
            const con = this.context;
            const canvas = this.context.canvas;
            const canvasParent = canvas.parentElement;
            canvas.height = canvasParent.offsetHeight;
            canvas.width = canvasParent.offsetWidth;
            this.functions.forEach(fn => fn(cam, con));
            if (this.isRunning)
                window.requestAnimationFrame(this.render.bind(this));
        }
    }
    exports.CanvasRenderer = CanvasRenderer;
    class Camera {
        constructor(canvasRenderer, _pos, zoom) {
            this.canvasRenderer = canvasRenderer;
            this._pos = _pos;
            this.zoom = zoom;
            this.targetObjectPosition = null;
            document_1.miscButtons.get("centralize-camera").onClick = this.centralize.bind(this);
            let canvas = this.canvasRenderer.context.canvas;
            canvas.addEventListener("wheel", this.onWheelEvent.bind(this));
        }
        getWorldPosFromCanvas(canvasPos) {
            const canvas = this.canvasRenderer.context.canvas;
            const posX = ((canvas.width / 2) - this.pos.x - canvasPos.x) / -this.zoom;
            const posY = ((canvas.height / 2) + this.pos.y - canvasPos.y) / this.zoom;
            return new vector2_2.default(posX, posY);
        }
        getCanvasPosFromWorld(worldPos) {
            const canvas = this.canvasRenderer.context.canvas;
            const posX = (canvas.width / 2) + worldPos.x * this.zoom - this.pos.x;
            const posY = (canvas.height / 2) - worldPos.y * this.zoom + this.pos.y;
            return new vector2_2.default(posX, posY);
        }
        get pos() {
            if (this.targetObjectPosition) {
                return vector2_2.default.mult(this.targetObjectPosition.value, this.zoom);
            }
            return this._pos;
        }
        set pos(value) {
            if (this.targetObjectPosition)
                this.unfollowObject();
            this._pos = value;
        }
        get objectBeingFollowed() {
            if (this.targetObjectPosition)
                return this.targetObjectPosition.object;
            return null;
        }
        followObject(object) {
            if (!object.isFollowable)
                throw "Attemting to follow an unfollowable object";
            this.targetObjectPosition = object.getProperty(types_1.PhysicsPropertyType.ObjectPosition);
            this.changeButtonText(false);
        }
        unfollowObject() {
            this.changeButtonText(true);
            this.targetObjectPosition = null;
        }
        centralize() {
            this.pos = vector2_2.default.zero;
        }
        changeButtonText(isFollowing) {
            const followButton = document_1.miscButtons.get("follow-button");
            if (document_1.ObjectSelectionController.selectedObject == this.objectBeingFollowed)
                followButton.element.innerHTML = (isFollowing) ? "Seguir" : "Parar de seguir";
        }
        onWheelEvent(ev) {
            this.zoom += ev.deltaY / -100;
            if (this.zoom < 0.1)
                this.zoom = 0.1;
            else if (this.zoom > 200)
                this.zoom = 200;
        }
    }
    exports.Camera = Camera;
    class Sprite {
        constructor(renderer, imageSrc, copyPosition, copySize, drawPosition, drawSize) {
            this.renderer = renderer;
            this.copyPosition = copyPosition;
            this.copySize = copySize;
            this.drawPosition = drawPosition;
            const imgElement = document.createElement('img');
            imgElement.src = imageSrc;
            this.image = imgElement;
            this.drawSize = drawSize;
            this.drawFunction = this.draw.bind(this);
            renderer.add(this.drawFunction);
        }
        getZoomedSize(zoom) {
            return vector2_2.default.mult(this.drawSize, zoom);
        }
        draw() {
            // @ts-ignore
            this.renderer.context.drawImage(this.image, ...this.copyPosition.toArray(), ...this.copySize.toArray(), ...this.getPositionInCanvas().toArray(), ...this.getZoomedSize(this.renderer.camera.zoom).toArray());
        }
        stopDrawing() {
            this.renderer.remove(this.drawFunction);
        }
        getPositionInCanvas() {
            const camera = this.renderer.camera;
            return vector2_2.default.sub(camera.getCanvasPosFromWorld(this.drawPosition), vector2_2.default.div(this.getZoomedSize(camera.zoom), 2));
        }
        positionIsInsideSprite(pos) {
            const posInCan = this.getPositionInCanvas();
            const cam = this.renderer.camera;
            if (pos.x > posInCan.x && pos.x < posInCan.x + this.getZoomedSize(cam.zoom).x && pos.y > posInCan.y && pos.y < posInCan.y + this.getZoomedSize(cam.zoom).y)
                return true;
            return false;
        }
    }
    exports.Sprite = Sprite;
    class Grid {
        constructor(gridSize, canvasRenderer) {
            this.gridSize = gridSize;
            this.canvasRenderer = canvasRenderer;
            this.canvasRenderer.add(this.draw.bind(this));
        }
        draw() {
            let ctx = this.canvasRenderer.context;
            let canvas = ctx.canvas;
            let camera = this.canvasRenderer.camera;
            let startPos = this.canvasRenderer.camera.getWorldPosFromCanvas(new vector2_2.default(0, 0));
            let finishPos = this.canvasRenderer.camera.getWorldPosFromCanvas(new vector2_2.default(canvas.width, canvas.height));
            let startX = Math.ceil(startPos.x / this.gridSize) * this.gridSize;
            let startY = Math.floor(startPos.y / this.gridSize) * this.gridSize;
            for (let i = startX; i < finishPos.x; i += this.gridSize) {
                let x = (canvas.width / 2) + i * camera.zoom - camera.pos.x;
                ctx.strokeStyle = (i == 0) ? "green" : "gray";
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let i = startY; i > finishPos.y; i -= this.gridSize) {
                let y = (canvas.height / 2) - i * camera.zoom + camera.pos.y;
                ctx.strokeStyle = (i == 0) ? "red" : "gray";
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
    }
    exports.Grid = Grid;
});
define("input", ["require", "exports", "main", "vector2", "document"], function (require, exports, main_1, vector2_3, document_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_3 = __importDefault(vector2_3);
    class Input {
        constructor(canvasRenderer) {
            let canvas = canvasRenderer.context.canvas;
            this.isMouseDown = false;
            this.clickedPos = vector2_3.default.zero;
            this.cameraPosOnMouseDown = vector2_3.default.zero;
            this.mouseMoved = false;
            this.camera = canvasRenderer.camera;
            canvas.addEventListener("mousedown", ev => { this.onInputStart(new vector2_3.default(ev.offsetX, -ev.offsetY)); });
            canvas.addEventListener("touchstart", ev => { this.onInputStart(this.getOffsetVector2(ev)); });
            canvas.addEventListener("mousemove", ev => { this.onMove(new vector2_3.default(ev.offsetX, -ev.offsetY)); });
            canvas.addEventListener("touchmove", ev => { this.onMove(this.getOffsetVector2(ev)); });
            document.addEventListener("mouseup", this.onMouseUp.bind(this));
        }
        getOffsetVector2(ev) {
            const touchTarget = ev.targetTouches[0].target;
            const rect = touchTarget.getBoundingClientRect();
            const x = ev.targetTouches[0].pageX - rect.left;
            const y = ev.targetTouches[0].pageY - rect.top;
            return new vector2_3.default(x, -y);
        }
        onInputStart(cursorCoordinates) {
            this.isMouseDown = true;
            this.mouseMoved = false;
            this.clickedPos = cursorCoordinates;
            this.cameraPosOnMouseDown = this.camera.pos;
            console.log("click");
        }
        onMove(cursorCoordinates) {
            if (!this.isMouseDown)
                return;
            this.camera.pos = vector2_3.default.sum(this.cameraPosOnMouseDown, vector2_3.default.sub(this.clickedPos, cursorCoordinates));
            if (!vector2_3.default.equals(this.cameraPosOnMouseDown, this.camera.pos)) {
                this.mouseMoved = true;
                this.camera.unfollowObject();
            }
        }
        onMouseUp(ev) {
            if (!this.isMouseDown)
                return;
            this.isMouseDown = false;
            console.log("mouseup");
            if (!this.mouseMoved) {
                let clickedPos = new vector2_3.default(ev.offsetX, ev.offsetY);
                let obj = main_1.ambient.getObjectOnPosition(clickedPos);
                document_2.ObjectSelectionController.selectObject((obj) ? obj : main_1.ambient);
            }
        }
    }
    exports.default = Input;
});
define("simulator", ["require", "exports", "main", "document"], function (require, exports, main_2, document_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Simulator {
        constructor() {
            this._time = 0;
            this._isPlaying = false;
            const bottomBar = document.querySelector("#mid-menu>div:last-child");
            const queryInput = bottomBar.querySelector("input");
            if (!queryInput)
                throw "time input, play button or reset button not found";
            this.domInput = queryInput;
            this.domInput.value = this._time.toFixed(2);
            this.playButton = document_3.miscButtons.get("play-button");
            this.resetButton = document_3.miscButtons.get("reset-button");
            this.domInput.addEventListener("change", () => {
                if (this.isPlaying)
                    return;
                this.fastForwardTo(Number(this.domInput.value));
            });
            this.playButton.onClick = () => {
                if (!this.isPlaying)
                    this.start();
                else
                    this.stop();
            };
            this.resetButton.onClick = this.reset.bind(this);
        }
        get time() {
            return this._time;
        }
        set time(value) {
            this._time = value;
            this.domInput.value = value.toFixed(2);
            document_3.ObjectSelectionController.propertiesEnabled = value == 0;
            document_3.ObjectCreationController.objectCreatable = value == 0;
            this.resetButton.enabled = value > 0 && !this._isPlaying;
            document_3.miscButtons.get("destroy-button").enabled = value == 0 && document_3.ObjectSelectionController.selectedObject != null && document_3.ObjectSelectionController.selectedObject.isFollowable;
        }
        get isPlaying() {
            return this._isPlaying;
        }
        set isPlaying(value) {
            this._isPlaying = value;
            this.domInput.disabled = value;
            if (!value && this.time > 0)
                this.resetButton.enabled = false;
        }
        changeButtonImage(src) {
            let img = this.playButton.element.querySelector("img");
            if (!img)
                throw "img not found in play button";
            img.src = src;
        }
        start() {
            this.isPlaying = true;
            this.changeButtonImage(Simulator.pauseSrc);
            this.simulate();
        }
        stop() {
            this.isPlaying = false;
            this.changeButtonImage(Simulator.playSrc);
        }
        reset() {
            if (this.isPlaying || this.time == 0)
                return;
            this.time = 0;
            main_2.ambient.objects.forEach(object => object.reset());
        }
        fastForwardTo(time) {
            this.reset();
            this.passTime(time);
        }
        passTime(step) {
            main_2.ambient.objects.forEach(object => object.simulate(step));
            this.time += step;
        }
        simulate() {
            this.passTime(0.016);
            if (this.isPlaying)
                window.requestAnimationFrame(this.simulate.bind(this));
        }
    }
    Simulator.playSrc = "./assets/images/play.png";
    Simulator.pauseSrc = "./assets/images/pause.png";
    exports.default = Simulator;
});
define("main", ["require", "exports", "ambient", "input", "rendering", "simulator", "vector2", "document"], function (require, exports, ambient_1, input_1, rendering_1, simulator_1, vector2_4, document_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ambient_1 = __importDefault(ambient_1);
    input_1 = __importDefault(input_1);
    simulator_1 = __importDefault(simulator_1);
    vector2_4 = __importDefault(vector2_4);
    let can = document.createElement('canvas');
    let ctx = can.getContext('2d');
    can.width = 500;
    can.height = 500;
    document.body.querySelector("#mid-menu>div").appendChild(can);
    exports.canvasRenderer = new rendering_1.CanvasRenderer(ctx, vector2_4.default.zero, 100);
    exports.ambient = new ambient_1.default();
    exports.simulator = new simulator_1.default();
    document_4.ObjectSelectionController.selectObject(exports.ambient);
    new input_1.default(exports.canvasRenderer);
    exports.canvasRenderer.add(() => ctx.clearRect(0, 0, can.width, can.height));
    new rendering_1.Grid(1, exports.canvasRenderer);
    exports.canvasRenderer.start();
});
define("propertyDescriptions", ["require", "exports", "types"], function (require, exports, types_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.propertyDescriptions = new Map();
    exports.propertyDescriptions.set(types_2.PhysicsPropertyType.ObjectPosition, `
    <h1>
        Posição
    </h1>
    <p>
        Em física, a posição de um corpo é a especificação de seu lugar no espaço. A identificação da posição é feita a partir de um vetor, denominado vetor posição, que pode ser escrito em função de um sistema de coordenadas de um certo referencial. A unidade de medida da posição no Sistema Internacional de Unidades é o metro.
    </p>
    `);
});
define("selectable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("document", ["require", "exports", "main", "physicsObjects", "propertyDescriptions", "types", "vector2"], function (require, exports, main_3, physicsObjects_1, propertyDescriptions_1, types_3, vector2_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_5 = __importDefault(vector2_5);
    class DocumentButton {
        constructor(parent, id, kind, _enabled, onClick, buttonColor) {
            this.id = id;
            this.kind = kind;
            this._enabled = _enabled;
            this.onClick = onClick;
            this.buttonColor = buttonColor;
            this.element = document.createElement("button");
            parent.appendChild(this.element);
            this.element.setAttribute("id", id);
            this.element.setAttribute("class", (this._enabled) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);
            this.setButtonKindToDescendants();
        }
        setButtonKindToDescendants() {
            this.element.setAttribute("button-kind", this.kind);
            this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-kind", this.kind));
        }
        setButtonIdToDescendants() {
            this.element.setAttribute("button-id", this.id);
            this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-id", this.id));
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._enabled = value;
            this.element.setAttribute("class", (value) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);
        }
    }
    exports.DocumentButton = DocumentButton;
    class MiscImageButton extends DocumentButton {
        constructor(parent, id, thumbSrc, buttonColor, onClick, title) {
            super(parent, id, types_3.DocumentButtonKind.MiscButton, true, (onClick) ? onClick : null, buttonColor);
            if (title)
                this.element.setAttribute("title", title);
            const thumbImg = document.createElement("img");
            thumbImg.src = thumbSrc;
            this.element.appendChild(thumbImg);
            this.setButtonIdToDescendants();
            this.setButtonKindToDescendants();
        }
    }
    exports.MiscImageButton = MiscImageButton;
    class MiscTextButton extends DocumentButton {
        constructor(parent, id, text, buttonColor, onClick, title) {
            super(parent, id, types_3.DocumentButtonKind.MiscButton, true, (onClick) ? onClick : null, buttonColor);
            this.element.innerHTML = text;
            if (title)
                this.element.setAttribute("title", title);
            this.setButtonIdToDescendants();
            this.setButtonKindToDescendants();
        }
    }
    exports.MiscTextButton = MiscTextButton;
    class CreateObjectButton extends DocumentButton {
        constructor(name, thumbSrc, createObject) {
            super(exports.documentElements.get("object-list"), `create-${name}-button`, types_3.DocumentButtonKind.CreateObjectButton, true, createObject, types_3.ButtonColor.Dark);
            this.name = name;
            const parent = this.element.parentElement;
            const li = document.createElement("li");
            const thumbImg = document.createElement("img");
            li.setAttribute("title", `Criar um ${name.toLowerCase()}`);
            thumbImg.src = thumbSrc;
            this.element.appendChild(thumbImg);
            parent.appendChild(li);
            li.appendChild(this.element);
            this.setButtonIdToDescendants();
            this.setButtonKindToDescendants();
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this.element.setAttribute("class", (!value) ? "dark-button inactive-button" : "dark-button button");
        }
    }
    exports.CreateObjectButton = CreateObjectButton;
    class PropertyDescriptionUI {
        static setElementVisible(isVisible) {
            this.element.style.display = (isVisible) ? "flex" : "none";
        }
        static show(propertyKind) {
            this.setElementVisible(true);
            const description = propertyDescriptions_1.propertyDescriptions.get(propertyKind);
            if (description)
                this.element.querySelector("article").innerHTML = description;
            else
                this.hide();
        }
        static hide() {
            this.setElementVisible(false);
        }
    }
    PropertyDescriptionUI.element = document.querySelector("#property-description-interface");
    exports.PropertyDescriptionUI = PropertyDescriptionUI;
    class ObjectCreationController {
        static set objectCreatable(value) {
            this._objectCreatable = value;
            exports.objectCreationButtons.forEach(button => button.enabled = value);
        }
        static get objectCreatable() {
            return this._objectCreatable;
        }
    }
    ObjectCreationController._objectCreatable = true;
    exports.ObjectCreationController = ObjectCreationController;
    /**
     * Controlls the selection of Selectable objects
     */
    class ObjectSelectionController {
        /**
         * @returns the currently selected object
         */
        static get selectedObject() {
            return this._selectedObject;
        }
        /**
         * Selects an object, displaying it's properties in the properties list
         * @param object the object to be selected
         */
        static selectObject(object) {
            console.log(`Selected ${object.name}`);
            const domPropertyUL = exports.documentElements.get("property-list");
            const domPropertyH1 = exports.documentElements.get("property-list-title");
            this._selectedObject = object;
            while (domPropertyUL.firstChild)
                domPropertyUL.removeChild(domPropertyUL.firstChild);
            domPropertyH1.innerHTML = `Propriedades do ${object.name}`;
            this.propertiesEnabled = this.propertiesEnabled;
            if (object.appendPropertyListItems)
                object.appendPropertyListItems(domPropertyUL, this.propertiesEnabled);
            const followButton = exports.miscButtons.get("follow-button");
            const destroyButton = exports.miscButtons.get("destroy-button");
            followButton.enabled = object.isFollowable;
            followButton.element.innerHTML = (main_3.canvasRenderer.camera.objectBeingFollowed != this._selectedObject) ? "Seguir" : "Parar de seguir";
            destroyButton.enabled = object.destroy != undefined && main_3.simulator.time == 0;
        }
        static get propertiesEnabled() {
            return this._propertiesEnabled;
        }
        static set propertiesEnabled(value) {
            if (!this._selectedObject)
                return;
            this._propertiesEnabled = value;
            const physicsProperties = this._selectedObject.getProperty(types_3.PhysicsPropertyType.All);
            if (physicsProperties) {
                physicsProperties.forEach(objectProperty => {
                    if (objectProperty.propertyLI)
                        objectProperty.propertyLI.enabled = value;
                });
            }
        }
    }
    ObjectSelectionController._selectedObject = null;
    ObjectSelectionController._propertiesEnabled = true;
    exports.ObjectSelectionController = ObjectSelectionController;
    /**
     * A map that contains various Elements in the application HTML document.
     */
    exports.documentElements = new Map();
    exports.documentElements.set("header", document.querySelector("#buttons-header"));
    exports.documentElements.set("file-buttons", exports.documentElements.get("header").querySelector("#header-file-buttons"));
    exports.documentElements.set("camera-buttons", exports.documentElements.get("header").querySelector("#header-camera-buttons"));
    exports.documentElements.set("property-panel", document.querySelector(".side-panel:first-child > div"));
    exports.documentElements.set("object-interactor", document.querySelector("#object-interactor"));
    exports.documentElements.set("property-list-title", exports.documentElements.get("property-panel").querySelector("h1"));
    exports.documentElements.set("property-list", document.querySelector("#property-list"));
    exports.documentElements.set("simulation-controller-buttons", document.querySelector("#simulation-controller-buttons"));
    exports.documentElements.set("object-list", document.querySelector("#object-list"));
    exports.documentElements.set("property-description-interface", document.querySelector("#property-description-interface"));
    exports.documentElements.set("property-description-header", exports.documentElements.get("property-description-interface").querySelector("header"));
    /**
     * A map that contains all of the buttons that creates objects
     */
    exports.objectCreationButtons = new Map();
    exports.objectCreationButtons.set(types_3.PhysicsObjectType.Solid, new CreateObjectButton("Sólido", "./assets/images/dwagao.png", function (canvasRenderer, ambient) {
        new physicsObjects_1.Solid(canvasRenderer, ambient, canvasRenderer.camera.getWorldPosFromCanvas(new vector2_5.default(canvasRenderer.context.canvas.width / 2, canvasRenderer.context.canvas.height / 2)), new vector2_5.default(1, 1));
    }));
    /**
     * A map that contains all of the buttons that do various functions on the application
     */
    exports.miscButtons = new Map();
    exports.miscButtons.set("play-button", new MiscImageButton(exports.documentElements.get("simulation-controller-buttons"), "play-button", "./assets/images/play.png", types_3.ButtonColor.Dark, undefined, "Iniciar simulação"));
    exports.miscButtons.set("reset-button", new MiscTextButton(exports.documentElements.get("simulation-controller-buttons"), "reset-button", "t=0", types_3.ButtonColor.Dark, undefined, "Definir tempo igual a 0"));
    exports.miscButtons.set("follow-button", new MiscTextButton(exports.documentElements.get("object-interactor"), "follow-button", "Seguir", types_3.ButtonColor.Dark));
    exports.miscButtons.set("destroy-button", new MiscTextButton(exports.documentElements.get("object-interactor"), "destroy-button", "Destruir", types_3.ButtonColor.Dark));
    exports.miscButtons.set("centralize-camera", new MiscImageButton(exports.documentElements.get("camera-buttons"), "centralize-camera", "./assets/images/cameracenter.png", types_3.ButtonColor.White, undefined, "Posicionar câmera no centro do cenário"));
    exports.miscButtons.set("close-property-description", new MiscImageButton(exports.documentElements.get("property-description-header"), "close-property-description", "./assets/images/closeicon.png", types_3.ButtonColor.White));
    exports.miscButtons.set("new-button", new MiscImageButton(exports.documentElements.get("file-buttons"), "new-button", "./assets/images/newfile.png", types_3.ButtonColor.White, undefined, "Novo ambiente"));
    exports.miscButtons.set("save-button", new MiscImageButton(exports.documentElements.get("file-buttons"), "save-button", "./assets/images/save.png", types_3.ButtonColor.White, undefined, "Salvar ambiente"));
    exports.miscButtons.set("load-button", new MiscImageButton(exports.documentElements.get("file-buttons"), "load-button", "./assets/images/load.png", types_3.ButtonColor.White, undefined, "Abrir ambiente"));
    //Event listeners
    document.addEventListener("click", e => {
        const target = e.target;
        const buttonId = target.getAttribute("button-id");
        switch (target.getAttribute("button-kind")) {
            case types_3.DocumentButtonKind.MiscButton:
                const button = exports.miscButtons.get(buttonId);
                if (button && button.onClick)
                    button.onClick();
                break;
            case types_3.DocumentButtonKind.CreateObjectButton:
                if (!ObjectCreationController.objectCreatable)
                    return;
                const objectCreationArray = Array.from(exports.objectCreationButtons);
                const objectButton = objectCreationArray.find(el => { return el[1].element.getAttribute("button-id") == buttonId; })[1];
                objectButton.onClick(main_3.canvasRenderer, main_3.ambient);
                break;
            case types_3.DocumentButtonKind.PropertyButton:
                const propertyKind = e.target.getAttribute("property-kind");
                if (propertyKind)
                    PropertyDescriptionUI.show(parseInt(propertyKind));
                return;
        }
    });
    //Configuration
    exports.miscButtons.get("destroy-button").onClick = function () {
        const selectedObject = ObjectSelectionController.selectedObject;
        if (!selectedObject || !selectedObject.destroy || main_3.simulator.time != 0)
            return;
        selectedObject.destroy();
        ObjectSelectionController.selectObject(main_3.ambient);
    };
    exports.miscButtons.get("follow-button").onClick = function () {
        const selectedObject = ObjectSelectionController.selectedObject;
        if (!selectedObject || !selectedObject.isFollowable)
            return;
        const camera = main_3.canvasRenderer.camera;
        if (camera.objectBeingFollowed != selectedObject)
            camera.followObject(selectedObject);
        else
            camera.unfollowObject();
    };
    exports.miscButtons.get("close-property-description").onClick = PropertyDescriptionUI.hide.bind(PropertyDescriptionUI);
});
define("propertyLI", ["require", "exports", "vector2", "document", "types"], function (require, exports, vector2_6, document_5, types_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_6 = __importDefault(vector2_6);
    class PropertyLI {
        constructor(property, title, propertyUnit, regExp, initialValue) {
            this.property = property;
            this.regExp = regExp;
            this.li = document.createElement("li");
            this.input = document.createElement("input");
            this.domNameLabel = document.createElement("label");
            this.domUnitLabel = document.createElement("label");
            const descriptionButton = document.createElement("button");
            const descriptionIcon = document.createElement("img");
            descriptionIcon.src = "./assets/images/description.png";
            this.domNameLabel.innerHTML = title;
            this.domUnitLabel.innerHTML = propertyUnit;
            descriptionButton.appendChild(descriptionIcon);
            this.li.appendChild(descriptionButton);
            this.li.appendChild(this.domNameLabel);
            this.li.appendChild(this.input);
            this.li.appendChild(this.domUnitLabel);
            this.input.setAttribute("id", `${title}-property-input`);
            this.domNameLabel.setAttribute("for", `${title}-property-input`);
            descriptionButton.setAttribute("class", "button dark-button");
            descriptionButton.setAttribute("title", "Descrição");
            this.input.setAttribute("type", "text");
            descriptionButton.setAttribute("property-kind", this.property.kind.toString());
            descriptionButton.setAttribute("button-kind", types_4.DocumentButtonKind.PropertyButton);
            descriptionButton.querySelectorAll("*").forEach(el => {
                el.setAttribute("button-kind", types_4.DocumentButtonKind.PropertyButton);
                el.setAttribute("property-kind", this.property.kind.toString());
            });
            this.lastValue = "";
            this.enabled = this.property.changeable;
            this.setValue(initialValue);
            this.input.addEventListener("change", this.onInputChanged.bind(this));
        }
        setValue(value) {
            const formattedValue = this.formatValue(value);
            this.input.value = formattedValue;
            this.lastValue = formattedValue;
        }
        onInputChanged() {
            let match = this.input.value.match(this.regExp);
            if (!match) {
                this.resetToLastString();
                return;
            }
            match = match.filter(el => { return el != ""; });
            let matchResult = this.processMatch(match);
            if (!matchResult) {
                this.resetToLastString();
                return;
            }
            this.property.initialValue = matchResult;
        }
        formatValue(value) {
            throw "formatValue(value: T) has not been implemented";
        }
        processMatch(match) {
            throw "processMatch(match: RegExpMatchArray): T has not been implemented";
        }
        resetToLastString() {
            this.input.value = this.lastValue;
        }
        appendToPropertyUL() {
            document_5.documentElements.get("property-list").appendChild(this.li);
        }
        set enabled(value) {
            const isDisabled = !value || !this.property.changeable;
            this.input.disabled = isDisabled;
            this.li.style.backgroundColor = (isDisabled) ? "#474747" : "#282828";
            const textColor = (isDisabled) ? "#a0a0a0" : "#ffffff";
            this.input.style.color = textColor;
            this.domNameLabel.style.color = textColor;
            this.domUnitLabel.style.color = textColor;
        }
    }
    exports.default = PropertyLI;
    class PropertyLIVector2 extends PropertyLI {
        constructor(property, title, propertyUnit, initialValue) {
            super(property, title, propertyUnit, /\-?\d*\.?\d*/g, initialValue);
        }
        formatValue(value) {
            return `(${value.x.toFixed(2)}, ${value.y.toFixed(2)})`;
        }
        processMatch(match) {
            if (!match[0] || !match[1]) {
                this.resetToLastString();
                return undefined;
            }
            return new vector2_6.default(Number(match[0]), Number(match[1]));
        }
    }
    exports.PropertyLIVector2 = PropertyLIVector2;
    class PropertyLINumber extends PropertyLI {
        constructor(property, title, propertyUnit, initialValue) {
            super(property, title, propertyUnit, /\-?\d*\.?\d*/i, initialValue);
        }
        formatValue(value) {
            return value.toFixed(2);
        }
        processMatch(match) {
            if (!match[0]) {
                this.resetToLastString();
                return;
            }
            return Number(match[0]);
        }
    }
    exports.PropertyLINumber = PropertyLINumber;
});
define("physicsProperties", ["require", "exports", "genericCalulator", "types", "vector2", "propertyLI"], function (require, exports, genericCalulator_1, types_5, vector2_7, propertyLI_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_7 = __importDefault(vector2_7);
    class PhysicsProperty {
        constructor(kind, changeable, object, iValue, oValue, genericCalculator) {
            this.kind = kind;
            this.changeable = changeable;
            this.object = object;
            this.iValue = iValue;
            this.oValue = oValue;
            this.genericCalculator = genericCalculator;
            this.propertyLI = null;
            this.active = true;
            this.onValueChangedCallbacks = [];
        }
        get initialValue() {
            return this.iValue;
        }
        set initialValue(value) {
            this.iValue = value;
            this.propertyLI.setValue(this.value);
            this.onValueChangedCallbacks.forEach(callback => callback());
        }
        get value() {
            return this.genericCalculator.sum(this.iValue, this.oValue);
        }
        set value(value) {
            this.oValue = this.genericCalculator.sub(value, this.iValue);
            this.propertyLI.setValue(this.value);
            this.onValueChangedCallbacks.forEach(callback => callback());
        }
        simulateStep(step) {
        }
        reset() {
            this.value = this.initialValue;
        }
    }
    exports.default = PhysicsProperty;
    class ObjectPosition extends PhysicsProperty {
        constructor(initialPosition, object) {
            super(types_5.PhysicsPropertyType.ObjectPosition, true, object, initialPosition, vector2_7.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyLI = new propertyLI_1.PropertyLIVector2(this, "pos<sub>(x, y)</sub>", "m, m", initialPosition);
        }
        updateSpritePosition() {
            this.object.sprite.drawPosition = this.value;
        }
        set initialValue(value) {
            super.initialValue = value;
            this.updateSpritePosition();
        }
        get initialValue() {
            return super.initialValue;
        }
        get value() {
            return super.value;
        }
        set value(value) {
            super.value = value;
            this.updateSpritePosition();
        }
    }
    exports.ObjectPosition = ObjectPosition;
    class ObjectSize extends PhysicsProperty {
        constructor(initialSize, object) {
            super(types_5.PhysicsPropertyType.ObjectSize, true, object, initialSize, vector2_7.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyLI = new propertyLI_1.PropertyLIVector2(this, "tam<sub>(x, y)</sub>", "m, m", initialSize);
        }
        updateSpriteSize() {
            this.object.sprite.drawSize = this.value;
        }
        set initialValue(value) {
            super.initialValue = value;
            this.updateSpriteSize();
            // Change area
            const objArea = this.object.getProperty(types_5.PhysicsPropertyType.ObjectArea);
            if (objArea)
                objArea.initialValue = this.value.x * this.value.y;
        }
        get initialValue() {
            return super.initialValue;
        }
        get value() {
            return super.value;
        }
        set value(value) {
            super.value = value;
            this.updateSpriteSize();
        }
    }
    exports.ObjectSize = ObjectSize;
    class ObjectArea extends PhysicsProperty {
        constructor(object) {
            super(types_5.PhysicsPropertyType.ObjectArea, false, object, 0, 0, genericCalulator_1.NumberCalculator.instance);
            this.propertyLI = new propertyLI_1.PropertyLINumber(this, "área", "m<sup>2</sup>", 0);
            const objectSize = object.getProperty(types_5.PhysicsPropertyType.ObjectSize);
            const sizeVector2 = (objectSize) ? objectSize.initialValue : vector2_7.default.zero;
            this.initialValue = sizeVector2.x * sizeVector2.y;
        }
    }
    exports.ObjectArea = ObjectArea;
    class ObjectVelocity extends PhysicsProperty {
        constructor(object) {
            super(types_5.PhysicsPropertyType.ObjectVelocity, true, object, vector2_7.default.zero, vector2_7.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyLI = new propertyLI_1.PropertyLIVector2(this, "velocidade", "<sup>m</sup>&frasl;<sub>s</sub>, <sup>m</sup>&frasl;<sub>s</sub>", vector2_7.default.zero);
        }
        simulateStep(step) {
            const displacement = vector2_7.default.mult(this.value, step);
            const objectPosition = this.object.getProperty(types_5.PhysicsPropertyType.ObjectPosition);
            const objectDisplacement = this.object.getProperty(types_5.PhysicsPropertyType.ObjectDisplacement);
            //add displacement to objectdisplacement
            if (objectDisplacement)
                objectDisplacement.value += vector2_7.default.distance(vector2_7.default.zero, displacement);
            //displace object
            if (objectPosition)
                objectPosition.value = vector2_7.default.sum(displacement, objectPosition.value);
        }
    }
    exports.ObjectVelocity = ObjectVelocity;
    class ObjectDisplacement extends PhysicsProperty {
        constructor(object) {
            super(types_5.PhysicsPropertyType.ObjectDisplacement, false, object, 0, 0, genericCalulator_1.NumberCalculator.instance);
            this.propertyLI = new propertyLI_1.PropertyLINumber(this, "deslocamento", "m", 0);
        }
    }
    exports.ObjectDisplacement = ObjectDisplacement;
    class ObjectAcceleration extends PhysicsProperty {
        constructor(object) {
            super(types_5.PhysicsPropertyType.ObjectAcceleration, true, object, vector2_7.default.zero, vector2_7.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyLI = new propertyLI_1.PropertyLIVector2(this, "acel", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>, <sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", this.initialValue);
        }
        simulateStep(step) {
            const objectVel = this.object.getProperty(types_5.PhysicsPropertyType.ObjectVelocity);
            const velDisplacement = vector2_7.default.mult(this.value, step);
            if (objectVel)
                objectVel.value = vector2_7.default.sum(velDisplacement, objectVel.value);
        }
    }
    exports.ObjectAcceleration = ObjectAcceleration;
});
define("physicsObjects", ["require", "exports", "physicsProperties", "rendering", "types", "vector2"], function (require, exports, PhysicsProperties, rendering_2, types_6, vector2_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    PhysicsProperties = __importStar(PhysicsProperties);
    vector2_8 = __importDefault(vector2_8);
    class PhysicsObject {
        constructor(name, sprite, ambient) {
            this.name = name;
            this.sprite = sprite;
            this.ambient = ambient;
            this.objectProperties = [];
            this.ambient.addObject(this);
        }
        addProperties(...properties) {
            properties.forEach(property => this.objectProperties.push(property));
        }
        simulate(step) {
            this.objectProperties.forEach(property => property.simulateStep(step));
        }
        reset() {
            this.objectProperties.forEach(property => property.reset());
        }
        getProperty(type) {
            switch (type) {
                case types_6.PhysicsPropertyType.All:
                    return this.objectProperties;
                default:
                    return this.objectProperties.find(physicsProperty => { return physicsProperty.kind == type; });
            }
        }
        /* Selectable */
        getName() {
            return this.name;
        }
        appendPropertyListItems() {
            this.objectProperties.forEach(property => {
                if (property.propertyLI)
                    property.propertyLI.appendToPropertyUL();
            });
        }
        get isFollowable() {
            return true;
        }
        get isDeletable() {
            return true;
        }
        destroy() {
            this.sprite.stopDrawing();
            const index = this.ambient.objects.indexOf(this);
            this.ambient.objects.splice(index, 1);
        }
    }
    exports.default = PhysicsObject;
    class Solid extends PhysicsObject {
        constructor(canvasRenderer, ambient, position, size) {
            super("Sólido", new rendering_2.Sprite(canvasRenderer, "./assets/images/dwagao.png", new vector2_8.default(0, 0), new vector2_8.default(512, 512), position, size), ambient);
            this.addProperties(new PhysicsProperties.ObjectPosition(position, this));
            this.addProperties(new PhysicsProperties.ObjectSize(size, this));
            this.addProperties(new PhysicsProperties.ObjectArea(this));
            this.addProperties(new PhysicsProperties.ObjectAcceleration(this));
            this.addProperties(new PhysicsProperties.ObjectVelocity(this));
            this.addProperties(new PhysicsProperties.ObjectDisplacement(this));
        }
    }
    exports.Solid = Solid;
});
define("ambient", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ambient {
        constructor() {
            this.objects = [];
        }
        getObjectOnPosition(pos) {
            for (const obj of this.objects) {
                if (obj.sprite.positionIsInsideSprite(pos))
                    return obj;
            }
            return null;
        }
        addObject(obj) {
            this.objects.push(obj);
        }
        /* Selectable */
        get name() {
            return "Ambiente";
        }
        getProperty() {
            return undefined;
        }
        get isFollowable() {
            return false;
        }
    }
    exports.default = Ambient;
});
