"use strict";
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
    appendPropertyListItems(ul, enabled) {
        let empty = [];
        return empty;
    }
    getObjectProperties() {
        let empty = [];
        return empty;
    }
    get isFollowable() {
        return false;
    }
}
class Camera {
    constructor(canvasRenderer, _pos, zoom) {
        this.canvasRenderer = canvasRenderer;
        this._pos = _pos;
        this.zoom = zoom;
        this.targetObjectPosition = null;
        let canvas = this.canvasRenderer.context.canvas;
        canvas.addEventListener("wheel", this.onWheelEvent.bind(this));
    }
    getWorldPosFromCanvas(canvasPos) {
        const canvas = this.canvasRenderer.context.canvas;
        const posX = ((canvas.width / 2) - this.pos.x - canvasPos.x) / -this.zoom;
        const posY = ((canvas.height / 2) + this.pos.y - canvasPos.y) / this.zoom;
        return new Vector2(posX, posY);
    }
    getCanvasPosFromWorld(worldPos) {
        const canvas = this.canvasRenderer.context.canvas;
        const posX = (canvas.width / 2) + worldPos.x * this.zoom - this.pos.x;
        const posY = (canvas.height / 2) - worldPos.y * this.zoom + this.pos.y;
        return new Vector2(posX, posY);
    }
    get pos() {
        if (this.targetObjectPosition) {
            return Vector2.mult(this.targetObjectPosition.value, this.zoom);
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
        this.targetObjectPosition = object.getProperty("ObjectPosition");
        this.changeButtonText(false);
    }
    unfollowObject() {
        this.changeButtonText(true);
        this.targetObjectPosition = null;
    }
    centralize() {
        this.pos = Vector2.zero;
    }
    changeButtonText(isFollowing) {
        const documentUI = System.documentUI;
        const followButton = documentUI.getButton("follow-button");
        if (documentUI.selectedObject == this.objectBeingFollowed)
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
class DocumentElement {
    constructor(selector, enabled) {
        const query = document.querySelector(selector);
        if (!query)
            throw `Couldn't query select ${selector}`;
        this.element = query;
        this._enabled = enabled;
    }
}
class DocumentButton extends DocumentElement {
    constructor(documentUI, selector, enabled, onClick, buttonColor) {
        super(selector, enabled);
        this.onClick = onClick;
        this.buttonColor = buttonColor;
        const attributeValue = this.element.getAttribute("id");
        this.element.setAttribute("button-name", attributeValue);
        this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-name", attributeValue));
        documentUI.buttons.push(this);
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._enabled = value;
        this.element.setAttribute("class", (value) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);
    }
}
class DocumentUI {
    constructor() {
        this.domObjectUL = document.querySelector("#object-list");
        this.domPropertyUL = document.querySelector("#property-list");
        this.domPropertyH1 = this.domPropertyUL.parentElement.querySelector("h1");
        if (!this.domObjectUL || !this.domPropertyUL || !this.domPropertyH1)
            throw "Some elements are missing!";
        this.buttons = [];
        this._propertiesEnabled = true;
        this._objectCreatable = true;
        this._selectedObject = null;
        new DocumentButton(this, "#reset-button", false, null, "dark-button");
        new DocumentButton(this, "#follow-button", false, this.followSelectedObject.bind(this), "dark-button");
        new DocumentButton(this, "#destroy-button", false, this.destroySelectedObject.bind(this), "dark-button");
        new DocumentButton(this, "#play-button", true, null, "dark-button");
        new DocumentButton(this, "#centralize-camera", true, System.canvasRenderer.camera.centralize.bind(System.canvasRenderer.camera), "white-button");
        this.domObjectUL.addEventListener("click", e => this.createObject(e));
        document.addEventListener("click", e => {
            const buttonName = e.target.getAttribute("button-name");
            if (!buttonName)
                return;
            const button = this.buttons.filter(el => { return el.element.getAttribute("button-name") == buttonName; })[0];
            if (button.onClick)
                button.onClick();
        });
        ObjectLI.objectLIs.forEach(objectLI => {
            this.domObjectUL.appendChild(objectLI.li);
        });
    }
    get selectedObject() {
        return this._selectedObject;
    }
    //propertiesEnabled: boolean
    get propertiesEnabled() {
        return this._propertiesEnabled;
    }
    set propertiesEnabled(value) {
        const selectedObj = this._selectedObject;
        this._propertiesEnabled = value;
        if (this._selectedObject && selectedObj.getObjectProperties) {
            selectedObj.getObjectProperties().forEach(objectProperty => {
                if (objectProperty.propertyLI)
                    objectProperty.propertyLI.enabled = value;
            });
        }
    }
    //objectCreatable: boolean
    set objectCreatable(value) {
        this._objectCreatable = value;
        ObjectLI.objectLIs.forEach(objectLI => objectLI.enabled = value);
    }
    get objectCreatable() {
        return this._objectCreatable;
    }
    //Methods
    createObject(e) {
        if (!this.objectCreatable)
            return;
        const objectType = e.target.getAttribute("object-name");
        if (!objectType)
            return;
        ObjectLI.objectLIs.forEach(objectLI => {
            if (objectLI.name == objectType)
                objectLI.createObject(System.canvasRenderer, System.ambient);
        });
    }
    destroySelectedObject() {
        if (!this._selectedObject || !this._selectedObject.destroy)
            return;
        if (System.simulator.time != 0)
            throw "Attempted to delete object in simulation!";
        this._selectedObject.destroy();
        this.selectObject(System.ambient);
    }
    followSelectedObject() {
        const selectedObj = this._selectedObject;
        if (!selectedObj || selectedObj.isFollowable)
            return;
        const camera = System.canvasRenderer.camera;
        if (camera.objectBeingFollowed != this._selectedObject)
            camera.followObject(this._selectedObject);
        else
            camera.unfollowObject();
    }
    getButton(buttonId) {
        return this.buttons.filter(el => { return el.element.getAttribute("id") == buttonId; })[0];
    }
    selectObject(object) {
        console.log(`Selected ${object.name}`);
        this._selectedObject = object;
        while (this.domPropertyUL.firstChild)
            this.domPropertyUL.removeChild(this.domPropertyUL.firstChild);
        this.domPropertyH1.innerHTML = `Propriedades do ${object.name}`;
        object.appendPropertyListItems(this.domPropertyUL, this.propertiesEnabled);
        this.propertiesEnabled = this.propertiesEnabled;
        const followButton = this.getButton("follow-button");
        const destroyButton = this.getButton("destroy-button");
        followButton.enabled = object.isFollowable;
        followButton.element.innerHTML = (System.canvasRenderer.camera.objectBeingFollowed != this._selectedObject) ? "Seguir" : "Parar de seguir";
        destroyButton.enabled = object.destroy != undefined && System.simulator.time == 0;
    }
}
class Vector2Calculator {
    constructor() { }
    sum(a, b) {
        return Vector2.sum(a, b);
    }
    sub(a, b) {
        return Vector2.sub(a, b);
    }
    mult(a, b) {
        return Vector2.mult(a, b);
    }
    div(a, b) {
        return Vector2.div(a, b);
    }
}
Vector2Calculator.instance = new Vector2Calculator();
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
class Grid {
    constructor(gridSize) {
        this.gridSize = gridSize;
        System.canvasRenderer.add(this.draw.bind(this));
    }
    draw() {
        let ctx = System.canvasRenderer.context;
        let canvas = ctx.canvas;
        let camera = System.canvasRenderer.camera;
        let startPos = System.canvasRenderer.camera.getWorldPosFromCanvas(new Vector2(0, 0));
        let finishPos = System.canvasRenderer.camera.getWorldPosFromCanvas(new Vector2(canvas.width, canvas.height));
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
class Input {
    constructor(camera, canvasRenderer) {
        this.camera = camera;
        this.canvasRenderer = canvasRenderer;
        let canvas = canvasRenderer.context.canvas;
        this.isMouseDown = false;
        this.clickedPos = Vector2.zero;
        this.cameraPosOnMouseDown = Vector2.zero;
        this.mouseMoved = false;
        canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        canvas.addEventListener("mousemove", this.onMove.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
    onMouseDown(ev) {
        this.isMouseDown = true;
        this.mouseMoved = false;
        this.clickedPos = new Vector2(ev.offsetX, -ev.offsetY);
        this.cameraPosOnMouseDown = this.camera.pos;
        console.log("click");
    }
    onMove(ev) {
        if (!this.isMouseDown)
            return;
        let currentMousePos = new Vector2(ev.offsetX, -ev.offsetY);
        this.camera.pos = Vector2.sum(this.cameraPosOnMouseDown, Vector2.sub(this.clickedPos, currentMousePos));
        if (!Vector2.equals(this.cameraPosOnMouseDown, this.camera.pos)) {
            this.mouseMoved = true;
            this.camera.unfollowObject();
        }
    }
    onMouseUp(ev) {
        if (!this.isMouseDown)
            return;
        this.isMouseDown = false;
        if (this.mouseMoved)
            return;
        let clickedPos = new Vector2(ev.offsetX, ev.offsetY);
        let documentUI = System.documentUI;
        let obj = System.ambient.getObjectOnPosition(clickedPos);
        documentUI.selectObject((obj) ? obj : System.ambient);
    }
}
class ObjectLI {
    constructor(name, thumbSrc, createObject) {
        this.name = name;
        this.createObject = createObject;
        this.li = document.createElement("li");
        let content = document.createElement("div");
        this.title = document.createElement("span");
        this.thumbImg = document.createElement("img");
        content.appendChild(this.title);
        this.li.appendChild(this.thumbImg);
        this.li.appendChild(content);
        this.li.setAttribute("object-name", name);
        this.li.setAttribute("class", "dark-button button");
        this.li.querySelectorAll("*").forEach(el => el.setAttribute("object-name", name));
        this.thumbImg.src = thumbSrc;
        this.title.innerHTML = name;
        ObjectLI.objectLIs.push(this);
    }
    set enabled(value) {
        this.li.setAttribute("class", (!value) ? "dark-button inactive-button" : "dark-button button");
    }
}
ObjectLI.objectLIs = [];
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
    getProperty(propertyName) {
        for (const property of this.objectProperties) {
            if (property.name == propertyName)
                return property;
        }
        return undefined;
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
    getObjectProperties() {
        return this.objectProperties;
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
class Solid extends PhysicsObject {
    constructor(canvasRenderer, ambient, position, size) {
        super("Sólido", new Sprite(canvasRenderer, "./assets/images/dwagao.png", new Vector2(0, 0), new Vector2(512, 512), position, size), ambient);
        this.addProperties(new ObjectPosition(position, this));
        this.addProperties(new ObjectSize(size, this));
        this.addProperties(new ObjectArea(this));
        this.addProperties(new ObjectAcceleration(this));
        this.addProperties(new ObjectVelocity(this));
        this.addProperties(new ObjectDisplacement(this));
    }
}
Solid.button = new ObjectLI("Sólido", "./assets/images/dwagao.png", function (canvasRenderer, ambient) {
    new Solid(canvasRenderer, ambient, canvasRenderer.camera.getWorldPosFromCanvas(new Vector2(canvasRenderer.context.canvas.width / 2, canvasRenderer.context.canvas.height / 2)), new Vector2(1, 1));
});
class PhysicsProperty {
    constructor(name, changeable, object, iValue, oValue, genericCalculator) {
        this.name = name;
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
class ObjectPosition extends PhysicsProperty {
    constructor(initialPosition, object) {
        super("ObjectPosition", true, object, initialPosition, Vector2.zero, Vector2Calculator.instance);
        this.propertyLI = new PropertyLIVector2(this, "pos<sub>(x, y)</sub>", "m, m", initialPosition);
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
class ObjectSize extends PhysicsProperty {
    constructor(initialSize, object) {
        super("ObjectSize", true, object, initialSize, Vector2.zero, Vector2Calculator.instance);
        this.propertyLI = new PropertyLIVector2(this, "tam<sub>(x, y)</sub>", "m, m", initialSize);
    }
    updateSpriteSize() {
        this.object.sprite.drawSize = this.value;
    }
    set initialValue(value) {
        super.initialValue = value;
        this.updateSpriteSize();
        // Change area
        const objArea = this.object.getProperty("ObjectArea");
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
class ObjectArea extends PhysicsProperty {
    constructor(object) {
        super("ObjectArea", false, object, 0, 0, NumberCalculator.instance);
        this.propertyLI = new PropertyLINumber(this, "área", "m<sup>2</sup>", 0);
        const objectSize = object.getProperty("ObjectSize");
        const sizeVector2 = (objectSize) ? objectSize.initialValue : Vector2.zero;
        this.initialValue = sizeVector2.x * sizeVector2.y;
    }
}
class ObjectVelocity extends PhysicsProperty {
    constructor(object) {
        super("ObjectVelocity", true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        this.propertyLI = new PropertyLIVector2(this, "velocidade", "<sup>m</sup>&frasl;<sub>s</sub>, <sup>m</sup>&frasl;<sub>s</sub>", Vector2.zero);
    }
    simulateStep(step) {
        const displacement = Vector2.mult(this.value, step);
        const objectPosition = this.object.getProperty("ObjectPosition");
        const objectDisplacement = this.object.getProperty("ObjectDisplacement");
        //add displacement to objectdisplacement
        if (objectDisplacement)
            objectDisplacement.value += Vector2.distance(Vector2.zero, displacement);
        //displace object
        if (objectPosition)
            objectPosition.value = Vector2.sum(displacement, objectPosition.value);
    }
}
class ObjectDisplacement extends PhysicsProperty {
    constructor(object) {
        super("ObjectDisplacement", false, object, 0, 0, NumberCalculator.instance);
        this.propertyLI = new PropertyLINumber(this, "deslocamento", "m", 0);
    }
}
class ObjectAcceleration extends PhysicsProperty {
    constructor(object) {
        super("ObjectAcceleration", true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        this.propertyLI = new PropertyLIVector2(this, "acel", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", this.initialValue);
    }
    simulateStep(step) {
        const objectVel = this.object.getProperty("ObjectVelocity");
        const velDisplacement = Vector2.mult(this.value, step);
        if (objectVel)
            objectVel.value = Vector2.sum(velDisplacement, objectVel.value);
    }
}
class PropertyLI {
    constructor(property, title, propertyUnit, regExp, initialValue) {
        this.property = property;
        this.regExp = regExp;
        this.ul = document.querySelector("#property-list");
        this.li = document.createElement("li");
        this.input = document.createElement("input");
        this.domNameLabel = document.createElement("label");
        this.domUnitLabel = document.createElement("label");
        this.domNameLabel.innerHTML = title;
        this.domUnitLabel.innerHTML = propertyUnit;
        this.li.appendChild(this.domNameLabel);
        this.li.appendChild(this.input);
        this.li.appendChild(this.domUnitLabel);
        this.input.setAttribute("type", "text");
        this.lastValue = "";
        this.setValue(initialValue);
        this.input.addEventListener("change", this.onInputChanged.bind(this));
        this.enabled = this.property.changeable;
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
        this.ul.appendChild(this.li);
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
        return new Vector2(Number(match[0]), Number(match[1]));
    }
}
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
class Simulator {
    constructor(documentUI) {
        this._time = 0;
        this._isPlaying = false;
        const bottomBar = document.querySelector("#mid-menu>div:last-child");
        const queryInput = bottomBar.querySelector("input");
        if (!queryInput)
            throw "time input, play button or reset button not found";
        this.domInput = queryInput;
        this.domInput.value = this._time.toFixed(2);
        this.playButton = documentUI.getButton("play-button");
        this.resetButton = documentUI.getButton("reset-button");
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
        System.documentUI.propertiesEnabled = value == 0;
        System.documentUI.objectCreatable = value == 0;
        this.resetButton.enabled = value > 0 && !this._isPlaying;
        System.documentUI.getButton("destroy-button").enabled = value == 0 && System.documentUI.selectedObject != null && System.documentUI.selectedObject.isFollowable;
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
        System.ambient.objects.forEach(object => object.reset());
    }
    fastForwardTo(time) {
        this.reset();
        this.passTime(time);
    }
    passTime(step) {
        System.ambient.objects.forEach(object => object.simulate(step));
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
        return Vector2.mult(this.drawSize, zoom);
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
        return Vector2.sub(camera.getCanvasPosFromWorld(this.drawPosition), Vector2.div(this.getZoomedSize(camera.zoom), 2));
    }
    positionIsInsideSprite(pos) {
        const posInCan = this.getPositionInCanvas();
        const cam = this.renderer.camera;
        if (pos.x > posInCan.x && pos.x < posInCan.x + this.getZoomedSize(cam.zoom).x && pos.y > posInCan.y && pos.y < posInCan.y + this.getZoomedSize(cam.zoom).y)
            return true;
        return false;
    }
}
class System {
    static start() {
        let can = document.createElement('canvas');
        let ctx = can.getContext('2d');
        can.width = 500;
        can.height = 500;
        document.body.querySelector("#mid-menu>div").appendChild(can);
        System.canvasRenderer = new CanvasRenderer(ctx, Vector2.zero, 100);
        System.ambient = new Ambient();
        System.documentUI = new DocumentUI();
        System.documentUI.selectObject(System.ambient);
        System.simulator = new Simulator(System.documentUI);
        new Input(System.canvasRenderer.camera, System.canvasRenderer);
        System.canvasRenderer.add(() => ctx.clearRect(0, 0, can.width, can.height));
        new Grid(1);
        System.canvasRenderer.start();
    }
}
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
