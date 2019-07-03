define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ButtonColor;
    (function (ButtonColor) {
        ButtonColor["Dark"] = "dark-button";
        ButtonColor["White"] = "white-button";
        ButtonColor["InvisibleBackground"] = "invisible-bg-button";
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
