abstract class System{
    static documentUI: DocumentUI;
    static canvasRenderer: CanvasRenderer;
    static ambient: Ambient;
    static simulator: Simulator;

    static start(){
        let can = document.createElement('canvas');
        let ctx = can.getContext('2d');

        can.width = 500;
        can.height = 500;

        document.body.querySelector("#mid-menu>div")!.appendChild(can);
        
        
        System.canvasRenderer = new CanvasRenderer(ctx!, Vector2.zero, 100);
        System.ambient = new Ambient();
        System.documentUI = new DocumentUI();
        System.documentUI.selectObject(System.ambient);
        System.simulator = new Simulator(System.documentUI);
        
        new Input(System.canvasRenderer.camera, System.canvasRenderer);
        

        System.canvasRenderer.add(() => ctx!.clearRect(0, 0, can.width, can.height));
        new Grid(1);
        
        System.canvasRenderer.start();
    }
}