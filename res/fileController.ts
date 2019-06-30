import { PhysicsObjectType, PhysicsPropertyType } from "./types";

export interface AmbientJSON{
    objects: PhysicsObjectJSON[];
}

export interface PhysicsObjectJSON{
    kind: PhysicsObjectType;
    properties: PhysicsPropertyJSON<any>[];
}

export interface PhysicsPropertyJSON<T>{
    kind: PhysicsPropertyType;
    iValue: T;
}

export const downloadJSON = function(data: string, filename: string, type: string){
    const file = new Blob([data], {type: type});
    
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        const a = document.createElement("a")
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
