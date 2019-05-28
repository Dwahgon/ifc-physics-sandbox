class Grid{
    constructor(public gridSize: number){
        System.canvasRenderer.add(this.draw.bind(this));
    }

    draw(){
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