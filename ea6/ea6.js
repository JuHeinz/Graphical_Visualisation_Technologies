//Diese Datei gibt ein Modul Names app zurück, auf dem nur die Methode start aufgerufen werden kann.

var app = (function () {

    var gl;

    // The shader program object is also used to store attribute and uniform locations.
    var prog;

    // Array of model objectst to render in this scene.
    var models = [];

    // Model that is target for user input.
    var interactiveModel;

    var camera = {
        /** Position of the camera. */
        eye: [0, 1, 4],

        /** Point to look at. */
        center: [0, 0, 0],

        /* Roll and pitch of the camera. Rotation um die Y Achse. */
        up: [0, 1, 0],

        /**  
         * Öffnungswinkel. Wie viel die Kamera von Oben und Unten mitbekommt. 
         * Gemessen als Winkel der Y-Achse -> Field Of View - Y
         * Angabe in Radian = degree*2*PI/360. 			
        */
        fovy: 60.0 * Math.PI / 180,

        /**  
         * Camera near plane dimensions:
         * value for left right top bottom in projection. */
        lrtb: 2.0,

        /**
         *  View matrix:
         *  Is responsible for moving the objects in the scene to simulate the position of the camera being changed,
         * altering what the viewer is currently able to see. 
         * */
        vMatrix: mat4.create(),

        /** 
         * Projection matrix: Speichert die Kamera Projection.
         */
        pMatrix: mat4.create(),

        /** 
         *  Projection types: ortho, perspective, frustum.
         * */
        projectionType: "perspective",

        /**  
         * In welchem Winkel die Kamera zur Z-Achse steht. Hiermit kann man um das Zentrum rotieren.
         * Angabe in Radian.
        */
        zAngle: 0,

        /**  Distance in XZ-Plane from center when orbiting. */
        distance: 4,
    };

    function start() {
        init();
        render();
    }

    function init() {
        initHTML();
        initWebGL();
        initShaderProgram();
        initUniforms()
        initModels();
        initEventHandler();
        initPipline();
    }
    /**
     * Buttons und deren clickListener festlegen. 
     */
    function initHTML() {
        // CAMERA
        // Camera Rotation
        let btnOrbitLeft = document.getElementById('btn-orbit-l');
        let btnOrbitRight = document.getElementById('btn-orbit-r');

        btnOrbitLeft.addEventListener("click", () => orbitCam(-1));
        btnOrbitRight.addEventListener("click", () => orbitCam(1))

        // Camera Up/Down
        let btnUp = document.getElementById('btn-up');
        let btnDown = document.getElementById('btn-down');

        btnUp.addEventListener("click", () => moveCamUpDown(1));
        btnDown.addEventListener("click", () => moveCamUpDown(-1));

        // Camera Closer / Further
        let closerBtn = document.getElementById('btn-closer');
        let furthernDown = document.getElementById('btn-further');

        closerBtn.addEventListener("click", () => moveCamCloser(-1));
        furthernDown.addEventListener("click", () => moveCamCloser(1));

        //Camera ProjectionS
        let btnPerspective = document.getElementById('btn-perspective');
        let btnOrtho = document.getElementById('btn-ortho');
        let btnFrustum = document.getElementById('btn-frustum');

        btnPerspective.addEventListener("click", () => updateProjection("perspective", 2))
        btnOrtho.addEventListener("click", () => updateProjection("ortho", 2))
        btnFrustum.addEventListener("click", () => updateProjection("frustum", 1.2))

        //Camera reset
        let btnResetCam = document.getElementById('btn-resetCam');
        btnResetCam.addEventListener("click", () => resetCamera());


        //MODEL TRANSFORMATION

        //Rotation
        let btnRotateX = document.getElementById('btn-rotateX');
        let btnRotateY = document.getElementById('btn-rotateY');
        let btnRotateZ = document.getElementById('btn-rotateZ');

        btnRotateX.addEventListener("click", () => rotateModel(0, 1))
        btnRotateY.addEventListener("click", () => rotateModel(1, 1))
        btnRotateZ.addEventListener("click", () => rotateModel(2, 1))

        //Scale
        let btnScaleUp = document.getElementById('btn-scaleUp');
        let btnScaleDown = document.getElementById('btn-scaleDown');
        btnScaleUp.addEventListener("click", () => scaleModel(1))
        btnScaleDown.addEventListener("click", () => scaleModel(-1))



        // Model reset
        let btnResetModel = document.getElementById('btn-resetModel');
        btnResetModel.addEventListener("click", () => resetModel());

    }

    /**
     *  gl als globale Variable initialisieren. gl Objekt Attribute für die Höhe und Breite des Canvas geben. 
     */
    function initWebGL() {
        canvas = document.getElementById('canvas');
        gl = canvas.getContext('experimental-webgl');
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }

    /**
     * Init pipeline parameters that will not change again.
     * If projection or viewport change, their setup must
     * be in render function.
     */
    function initPipline() {
        var r = 52 / 255;
        var g = 56 / 255
        var b = 59 / 255
        gl.clearColor(r, g, b, 1);

        // Backface culling.
        gl.frontFace(gl.CCW);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // Depth(Z)-Buffer.
        gl.enable(gl.DEPTH_TEST);

        // Polygon offset of rastered Fragments.
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(0.5, 0);

        // Set viewport.
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        // Init camera.
        // Set projection aspect ratio.
        camera.aspect = gl.viewportWidth / gl.viewportHeight;
    }

    /**
     * Programm initialisieren.
     */
    function initShaderProgram() {
        // Init vertex shader.
        var vs = initShader(gl.VERTEX_SHADER, "vertexshader");
        // Init fragment shader.
        var fs = initShader(gl.FRAGMENT_SHADER, "fragmentshader");
        // Link shader into a shader program.
        prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.bindAttribLocation(prog, 0, "aPosition");
        gl.linkProgram(prog);
        gl.useProgram(prog);
    }

    /**
     * Create and init shader from source.
     * 
     * @parameter shaderType: openGL shader type. (gl.VERTEX_SHADER oder gl.FRAGMENT_SHADER)
     * @parameter SourceTagId: Id of HTML Tag with shader source.
     * @returns shader object.
     */
    function initShader(shaderType, SourceTagId) {
        var shader = gl.createShader(shaderType); //Shader vom Typ gl.VERTEX_SHADER oder gl.FRAGMENT_SHADER erstellen 
        var shaderSource = document.getElementById(SourceTagId).text;
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        // Falls ein Fehler aufgetreten ist, wird dieser mit den zugehörigen Logging-Infos auf der Konsole ausgegeben.
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(SourceTagId + ": " + gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    /**
     * Die uniformen Projektions-Matrix und die Model-View-Matrix im Shader-Programm finden und dem js Object prog als Attribute hinzufügen.
     * uniform -> Alle Vertices / Fragments werden mit den gleichen Werten bearbeitet, read-only. Ändert sich nicht von Vertex zu Vertex. 
     */
    function initUniforms() {
        // Projection Matrix.
        // Bestimmt die Kamera-Projektion
        prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");

        // Model-View-Matrix
        // Bestimmt die Kamera-Position, bzw die Modell-Position.
        prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");

        prog.colorUniform = gl.getUniformLocation(prog, "uColor");

    }

    /**
     * Definieren, welche Models und mit welchem Stil gerendert werden sollen.
     * Ursprüngliche Transformation, Rotation und Skalierung festlegen.
     */
    function initModels() {
        // fill-style
        let fw = "fillwireframe";
        let f = "fill";
        let w = "wireframe"
        let white = [1, 1, 1, 1];
        let cyan = [0, 1, 1, 1];
        let pink = [1, 0, 1, 1];
        let blue = [0, 0, 1, 1];
        let yellow = [1, 1, 0, 1];
        createModel("torus", fw, white, [0, 0, 0], [0, 0, 0], [1, 1, 1]);
        createModel("plane", w, white, [0, -.8, 0], [0, 0, 0], [1, 1, 1]);
        createModel("sphere", fw, cyan, [1, -.3, -1], [0, 0, 0], [0.5, 0.5, 0.5]);
        createModel("sphere", fw, pink, [-1, -.3, -1], [0, 0, 0], [.5, .5, .5]);
        createModel("sphere", fw, blue, [1, -.3, 1], [0, 0, 0], [.5, .5, .5]);
        createModel("sphere", fw, yellow, [-1, -.3, 1], [0, 0, 0], [.5, .5, .5]);

        // Select one model that can be manipulated interactively by user.
        interactiveModel = models[0];

    }

    /**
     * Create model object, fill it and push it in models array.
     * 
     * @parameter geometryname: string with name of geometry.
     * @parameter fillstyle: wireframe, fill, fillwireframe.
     */
    function createModel(geometryname, fillstyle, color, translate, rotate, scale) {
        var model = {};
        model.fillstyle = fillstyle;

        model.geometry = geometryname; // store name so we can update it later
        model.color = color;


        initDataAndBuffers(model, geometryname);

        initTransformations(model, translate, rotate, scale);

        models.push(model);
    }

    /**
     * Model-Matrix und ModelViewMatrix für das übergebene Model-Objekt anlegen.
     * Translate, Rotate und Scale-Matrixen in das übergebene Model-Objekt speichern.
     * 
     */
    function initTransformations(model, translate, rotate, scale) {
        // Store transformation vectors.
        model.translate = translate;
        model.rotate = rotate;
        model.scale = scale;

        // Create and initialize Model-Matrix.
        model.mMatrix = mat4.create();

        // Create and initialize Model-View-Matrix.
        model.mvMatrix = mat4.create();
    }

    /**
     * Zu einemn Model die Buffer und Vertex, Index und Normal Arrays erstellen. 
     * @parameter model: a model object to augment with data.
     * @parameter geometryname: string with name of geometry.
     */
    function initDataAndBuffers(model, geometryname) {
        //Dem Model die vertices, indexes und normals geben, durch Aufruf der Funktion createVertexData
        globalThis[geometryname].createVertexData.apply(model);


        // Setup position vertex buffer object.
        model.vboPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
        gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
        // Bind vertex buffer to attribute variable.
        prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
        gl.enableVertexAttribArray(prog.positionAttrib);

        // Setup normal vertex buffer object.
        model.vboNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
        gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
        // Bind buffer to attribute variable.
        prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
        gl.enableVertexAttribArray(prog.normalAttrib);

        // Setup lines index buffer object.
        model.iboLines = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines, gl.STATIC_DRAW);
        model.iboLines.numberOfElements = model.indicesLines.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // Setup triangle index buffer object.
        model.iboTris = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris, gl.STATIC_DRAW);
        model.iboTris.numberOfElements = model.indicesTris.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /**
     * Handle User Inputs. Trigger re-rendering of the scene.
     */
    function initEventHandler() {

        window.onkeydown = function (evt) {

            var key = evt.which ? evt.which : evt.keyCode;
            var c = String.fromCharCode(key);

            // Use shift key to change sign: Bestimmt in Welche Richtung rotiert wird.
            var sign = evt.shiftKey ? -1 : 1;

            // Change projection of scene.
            switch (evt.code) {
                case ("ArrowLeft"): // Orbit Model CCW.
                    orbitCam(-1);
                    break;
                case ("ArrowRight"):  // Orbit Model CW;
                    orbitCam(1)
                    break;
                case ('KeyN'): //Orbit Distanz erhöhen/verringern
                    moveCamCloser(sign);
                    break;
                case ("ArrowUp"):
                    moveCamUpDown(-1)
                    break;
                case ("ArrowDown"):
                    moveCamUpDown(1)
                    break;
                case ('KeyH'):
                    // Move camera up and down.
                    moveCamUpDown(sign);
                    break;
                case ('KeyO'):
                    updateProjection("ortho", 2)
                    break;
                case ('KeyF'):
                    updateProjection("frustum", 1.2)
                    break;
                case ('KeyP'):
                    updateProjection("perspective", 2)
                    break;
                case ('KeyR'):
                    resetCamera()
                    break;
                case ('KeyX'):
                    rotateModel(0, sign)
                    break;
                case ('KeyY'):
                    rotateModel(1, sign)
                    break;
                case ('KeyZ'):
                    rotateModel(2, sign)
                    break;

            }
        };
    }

    /**
     * Rotiere das Modell um eine gegebene Achse.
     * @param {*} axis 0 = x, 1= y, 2 = z
     * @param {*} sign 1 oder -1
     */
    function rotateModel(axis, sign) {
        var deltaRotate = Math.PI / 36;
        //Achse der Rotate-Matrix im Model modifizieren. 
        interactiveModel.rotate[axis] += sign * deltaRotate;
        render();
    }

    function scaleModel(sign) {
        var deltaScale = 0.05;
        interactiveModel.scale[0] *= 1 + sign * deltaScale
        interactiveModel.scale[1] *= 1 + sign * deltaScale
        interactiveModel.scale[2] *= 1 + sign * deltaScale
        render()
    }

    /**
     * Rotatations, Translations und Skalierungs-Matrix des Models auf Default zurücksetzen. 
     */
    function resetModel() {
        interactiveModel.rotate = [0, 0, 0];
        interactiveModel.scale = [1, 1, 1];
        render()
    }

    /**
     * Kamera rotieren. Winkel, in dem die Kamera zur Z-Achse steht ändern. 
     * @param {} sign -1 = CW, 1 = CCW
     */
    function orbitCam(sign) {
        var deltaRotate = Math.PI / 36;  // Rotation step.
        camera.zAngle += sign * deltaRotate;
        render()
    }
    /**
     * Kamera heranfahren: Kamera-Entfernung zum Zentrum 
     * @param {*} sign -1 = Closer, 1= Further
     */
    function moveCamCloser(sign) {
        var delta = 0.1 //Zoom step
        camera.distance += sign * delta;
        render()
    }

    /**
     * Höhe der Kamera ändern. 
     * @param {*} sign  -1 = Down, 1 = up
     */
    function moveCamUpDown(sign) {
        var delta = 0.1 // height stept
        camera.eye[1] += sign * delta;
        render()
    }

    /**
     * Kamera-Projektion ändern.
     * @param {*} projectionType 
     * @param {*} lrtb 
     */
    function updateProjection(projectionType, lrtb) {
        camera.projectionType = projectionType;
        camera.lrtb = lrtb;
        render();
    }

    /**
     * Kamera Projektion, Höhe, Winkel zur Z-Achse und Entfernung zum Zentrum zurücksetzen.
     */
    function resetCamera() {
        camera.projectionType = "perspective";
        camera.lrtb = 2;
        camera.zAngle = 0;
        camera.distance = 4;
        camera.eye[1] = 1;

        render();
    }

    /**
     * Run the rendering pipeline.
     */
    function render() {
        // Clear framebuffer and depth-/z-buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        setProjection(); //Kamera-Pojektion ggf neu setzen, z.B. wenn nach einem User Input neu gerendert werden soll. 

        calculateCameraOrbit() //Camera.eye ggf. neu berechnen. z.B. wenn nach einem User Input neu gerendert werden soll. 

        // Set view matrix depending on camera attributes.
        mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);


        // Loop over models.
        // Jedem Model die view-Matrix aus der Kamera in sein Attribut mvMatrix rüber kopieren.
        for (var i = 0; i < models.length; i++) {
            updateTransformations(models[i]);

            // Set uniforms for model.
            //  Wert mvMatrix für Attribut mvMatrixUniform im Shader setzen.
            gl.uniformMatrix4fv(prog.mvMatrixUniform, false, models[i].mvMatrix); //4fv == 4 x 4 Matrix aus Floating Point Werten

            //Farbe festlegen.
            gl.uniform4fv(prog.colorUniform, models[i].color);

            //Zeichnen der Modelle
            draw(models[i]);
        }
    }

    function updateTransformations(model) {

        // Use shortcut variables.
        var mMatrix = model.mMatrix;
        var mvMatrix = model.mvMatrix;

        // Reset matrices to identity.         
        mat4.identity(mMatrix);
        mat4.identity(mvMatrix);

        // Model Matrix via translate verschieben.
        mat4.translate(mMatrix, mMatrix, model.translate);

        // Model Matrix auf seinen drei Achsen rotieren.
        mat4.rotateX(mMatrix, mMatrix, model.rotate[0]);
        mat4.rotateY(mMatrix, mMatrix, model.rotate[1]);
        mat4.rotateZ(mMatrix, mMatrix, model.rotate[2]);

        // Model Matrix via scale vergrößern/verkleinern.
        mat4.scale(mMatrix, mMatrix, model.scale);

        // Combine view and model matrix
        // by matrix multiplication to mvMatrix.
        //Berechnen der Model-View Matrix durch multiplizieren von Model-Matrix (aus Model) und ViewMatrix (aus Kamera).     
        mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);
    }

    /**
     * Set projection Matrix.
     * Zuerst in camera.pMatrix, dann im Programm. 
     */
    function setProjection() {
        switch (camera.projectionType) {
            case ("ortho"): //Orthogonal
                var v = camera.lrtb; //Hier ist die left, right, top, bottom Begrenzung der Near Clipping Plane gespeichert.

                //Dem Attribut camera.pMatrix eine Orthogonale Matrix geben
                /* Parameter:
                    1. out: Die Matrix, in der das Berechnungsergebnis gespeichert werden soll
                    2. left,3. right,4. bottom,	5. top: Begrenzung der Near-Clipping-Plane relativ zur Z-Achse an
                    6. near: Abstand der Near Clipping-Plane zum Ursprung, also Z-Wert
                    7. far: Abstand der Far Clipping-Plane zum Ursprung, also Z-Wert
                */
                mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
                break;
            case ("frustum"):
                var v = camera.lrtb;
                mat4.frustum(camera.pMatrix, -v / 2, v / 2, -v / 2, v / 2, 1, 10);
                break;
            case ("perspective"):
                mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1, 10);
                break;
        }
        // Set projection im Programm.
        gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
    }

    function draw(model) {
        // Setup position VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
        gl.vertexAttribPointer(prog.positionAttrib, 3, gl.FLOAT, false, 0, 0);

        // Setup normal VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
        gl.vertexAttribPointer(prog.normalAttrib, 3, gl.FLOAT, false, 0, 0);

        // Setup rendering tris.
        var fill = (model.fillstyle.search(/fill/) != -1);
        if (fill) {
            gl.enableVertexAttribArray(prog.normalAttrib);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
            gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements,
                gl.UNSIGNED_SHORT, 0);
        }

        // Setup rendering lines.
        var wireframe = (model.fillstyle.search(/wireframe/) != -1);
        if (wireframe) {
            gl.disableVertexAttribArray(prog.normalAttrib);
            gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
            gl.drawElements(gl.LINES, model.iboLines.numberOfElements,
                gl.UNSIGNED_SHORT, 0);
        }
    }

    /**
     * Berechne den Eye-Vektor (die Kamera-Position) auf x,z Ebene
     */
    function calculateCameraOrbit() {
        //Die X- und Z-Komponenten beschreiben einen Kreis mit dem Winkel camera.zAngle und camera.distance als Radius.
        var x = 0, z = 2;
        camera.eye[x] = camera.center[x];
        camera.eye[z] = camera.center[z];

        //Entspricht der parametrischen Form des Kreises x = r * cos(t), y= r*sin(t)
        camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
        camera.eye[z] += camera.distance * Math.cos(camera.zAngle);
    }

    /*
    RGBA Farben von Wertebereich [0,255] zu Wertebereich[0,1] transformieren.
    */
    function convertRGB(r, g, b, a) {
        var r_new = r / 255;
        var g_new = g / 255
        var b_new = b / 255
        var a_new = a / 255
        return []
    }

    // App interface.
    return {
        start: start
    }

}());
