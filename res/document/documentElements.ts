/**
 * A map that contains various Elements in the application HTML document.
 */
const documentElements = new Map<
    "application-wrapper" | "header" | "main-interface" | "file-buttons" | "camera-buttons" | "graph-buttons" | "property-panel" | "object-interactor"| "property-list-title" | "property-list" | "simulation-controller-buttons" | "object-list" | "graph-config-form" | "graph-panel" | "alert" 
, Element>();
documentElements.set("application-wrapper", document.querySelector("#application-wrapper")!);
documentElements.set("header", document.querySelector("#buttons-header")!);
documentElements.set("main-interface", document.querySelector("main")!);
documentElements.set("file-buttons", documentElements.get("header")!.querySelector("#header-file-buttons")!);
documentElements.set("camera-buttons", documentElements.get("header")!.querySelector("#header-camera-buttons")!);
documentElements.set("graph-buttons", documentElements.get("header")!.querySelector("#header-graph-buttons")!);
documentElements.set("property-panel", document.querySelector("#property-side-panel")!);
documentElements.set("object-interactor", document.querySelector("#object-interactor")!);
documentElements.set("property-list-title", documentElements.get("property-panel")!.querySelector("h1")!);
documentElements.set("property-list", document.querySelector("#property-list")!);
documentElements.set("simulation-controller-buttons", document.querySelector("#simulation-controller-buttons")!);
documentElements.set("object-list", document.querySelector("#object-list")!);
documentElements.set("graph-config-form", document.querySelector("#graph-config-form")!);
documentElements.set("graph-panel", document.querySelector("#graph-panel")!);
documentElements.set("alert", document.querySelector("#alert")!);

export default documentElements;