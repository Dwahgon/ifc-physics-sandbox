export default class ObjectLI{
    public readonly li: HTMLLIElement;
    private title: HTMLSpanElement;
    private thumbImg: HTMLImageElement;

    constructor(public readonly name: string, thumbSrc: string, public readonly createObject: Function){
        this.li = document.createElement("li");
        let content = document.createElement("div");
        this.title = document.createElement("span");
        this.thumbImg = document.createElement("img");
        
        content.appendChild(this.title);
        this.li.appendChild(this.thumbImg);
        this.li.appendChild(content);
        
        this.li.setAttribute("object-name", name);
        this.li.setAttribute("class", "dark-button button");
        this.li.querySelectorAll("*").forEach(el => el.setAttribute("object-name", name!));
        
        this.thumbImg.src = thumbSrc;
        this.title.innerHTML = name;
    }

    set enabled(value: boolean){
        this.li.setAttribute("class", (!value) ? "dark-button inactive-button" : "dark-button button");
    }
}