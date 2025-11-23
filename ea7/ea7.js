//Diese Datei gibt ein Modul Names app zurück, auf dem nur die Methode start aufgerufen werden kann.

var app = (function () {

    var gl;

    // The shader program object is also used to store attribute and uniform locations.
    var prog;

    // Array of model objectst to render in this scene.
    var models = [];

    var camera = {
        /** Position of the camera. */
        eye: [0, 1, 4],

        /** Point to look at. */
        center: [0, 0, 0],

        /** Roll and pitch of the camera. Rotation um die Y Achse. */
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

        /**  Distance in XZ-Plane from center. */
        distance: 2,
    };

    function start() {
        init();
        render();
    }

    function init() {
        initWebGL();
        initShaderProgram();
        initUniforms()
        initModels();
        initEventHandler();
        initPipline();
    }


    /**
     *  gl als globale Variable initialisieren. gl Objekt Attribute für die Höhe und Breite des Canvas geben. 
     */
    function initWebGL() {
        canvas = document.getElementById('canvas');
        gl = canvas.getContext('experimental-webgl');

        //Code, damit output immer scharf ist.
        canvas.width = Math.round(canvas.clientWidth * devicePixelRatio)
        canvas.height = Math.round(canvas.clientHeight * devicePixelRatio)

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

        //Farbe
        prog.colorUniform = gl.getUniformLocation(prog, "uColor");

        //Normals
        prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");

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

        let sT = 1 / 4 // Size Torus
        let sC = 1 / 100; //Size Sphere

        for (let i = -10; i < 10; i++) {
            let x = i;
            let y = 0;  //Höhe
            let z = i; //Tiefe

            let xCirc = Math.sin(i)
            let yCirc = Math.cos(i)
            let rotate = Math.PI / Math.abs(i)


            //Sinuskurve aus Icosahedron
            createModel("icosahedron", fw, white, [i, Math.sin(i), -8], [0, 0, 0], [.1, .1, .1]);
            createModel("icosahedron", fw, white, [i + .5, Math.sin(i + .5), -8], [0, 0, 0], [.1, .1, .1]);


            //Kreis aus Torus
            createModel("torus", fw, white, [xCirc, .5, yCirc], [0, 0, 0], [sT, sT, sT]);

            //Kreis aus Kugeln
            createModel("sphere", fw, white, [xCirc, .5, yCirc], [0, 0, 0], [sC, sC, sC]);



        }

        let radiant = -Math.PI / 3

        //Torus und Kreis in Mitte
        createModel("torus", fw, white, [0, 0.5, 0], [radiant, radiant, 0], [1, 1, 1]);
        createModel("sphere", fw, white, [0, 0.5, 0], [0, 0, 0], [.1, .1, .1]);


        createModel("icosahedron", fw, white, [-1.5, .50, .8], [0, 0, 0], [.2, .2, .2]);
        createModel("icosahedron", fw, white, [1.5, .50, .8], [0, 0, 0], [.2, .2, .2]);



        //Boden
        createModel("plane", w, white, [0, 0, 0], [0, 0, 0], [3, 3, 3]);

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

        // Create and initialize Normals-Matrix.
        model.nMatrix = mat3.create();

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
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos); // Tell gl that all coming comands should refer to this buffer.
        gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW); // Copy data vom the js-Array to the buffer
        // Bind vertex buffer to attribute variable.
        prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition'); // Look up where the Vertex Data needs to go
        gl.enableVertexAttribArray(prog.positionAttrib); //Supply data from the vboPos buffer to the attribute "aPosition"

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
            // Change projection of scene.
            switch (evt.key) {
                case ("ArrowLeft"): // Orbit Model CCW.
                    changeCameraZDegree(-1);
                    break;
                case ("ArrowRight"):  // Orbit Model CW;
                    changeCameraZDegree(1)
                    break;
                case ('n'): //Orbit Distanz erhöhen/verringern
                    changeCameraDistance(1);
                    break;
                case ('N'): //Orbit Distanz erhöhen/verringern
                    changeCameraDistance(-1);
                    break;
                case ("w"):
                    changeCameraUpDown(-1)
                    break;
                case ("s"):
                    changeCameraUpDown(1)
                    break;
                case ('d'):
                    changeCameraLeftRight(1);
                    break;
                case ('a'):
                    changeCameraLeftRight(-1);
                    break;
                case ('o'):
                    changeCameraProjection("ortho", 2)
                    break;
                case ('f'):
                    changeCameraProjection("frustum", 1.2)
                    break;
                case ('p'):
                    changeCameraProjection("perspective", 2)
                    break;
                case ('r'):
                    resetCamera()
                    break;

            }
        };
    }



    /**
     * Kamera rotieren. Winkel, in dem die Kamera zur Z-Achse steht ändern. 
     * @param {} sign -1 = CW, 1 = CCW
     */
    function changeCameraZDegree(sign) {
        var deltaRotate = Math.PI / 36;  // Rotation step.
        camera.zAngle += sign * deltaRotate;
        console.log("Camera Z-Angle: " + camera.zAngle)
        render()
    }
    /**
     * Kamera heranfahren: Kamera-Entfernung zum Zentrum 
     * @param {*} sign -1 = Closer, 1= Further
     */
    function changeCameraDistance(sign) {
        var delta = 0.1 //Zoom step
        camera.distance += sign * delta;
        console.log("Camera Distance: " + camera.distance)
        render()
    }

    /**
     * Höhe der Kamera ändern. 
     * @param {*} sign  -1 = Down, 1 = up
     */
    function changeCameraUpDown(sign) {
        var delta = 0.1
        camera.center[1] += sign * delta;
        console.log("Camera Center: ", camera.center)

        render()
    }

    /**
    * Position der Kamera auf X-Ebene festlegen
    * @param {*} sign  -1 = Links, 1 = Rechts
    */
    function changeCameraLeftRight(sign) {
        var delta = 0.1
        camera.center[0] += sign * delta;
        console.log("Camera Center: " + camera.center)

        render()
    }

    /**
     * Kamera-Projektion ändern.
     */
    function changeCameraProjection(projectionType, lrtb) {
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
        camera.distance = 2;
        camera.eye = [0, 1, 4];
        camera.center = [0, 0, 0]

        console.log("Camera Eye: ", camera.eye)
        console.log("Camera Center: ", camera.center)

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

        for (var i = 0; i < models.length; i++) {
            updateTransformations(models[i]);

            //UNIFORMS AUS DEM MODEL HOLEN UND IM SHADER SETZEN
            // ModelViewMatrix, die im model Object gespeichert wird, in das Programm (und somit den Shader) übergeben.
            gl.uniformMatrix4fv(prog.mvMatrixUniform, false, models[i].mvMatrix); //4fv == 4 x 4 Matrix aus Floating Point Werten

            // Farbe, die im model Object gespeichert wird, in das Programm (und somit den Shader) übergeben.
            gl.uniform4fv(prog.colorUniform, models[i].color);

            // Normal-Matrix, die im model Object gespeichert wird, in das Programm (und somit den Shader) übergeben.
            gl.uniformMatrix3fv(prog.nMatrixUniform, false, models[i].nMatrix);

            //ZEICHNEN DER MODELLE
            draw(models[i]);
        }


    }

    /**
     * Model Matrix aus den neuen Werten für translate, rotate und scale (Reihenfolge ist wichtig!) berechnen.
     * Model-View Matrix aus Model-Matrix und View-Matrix berechnen.
     * Normal-Matrix an Hand der Model-View Matrix berechnen.
     */
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

        // Combine view and model matrix by matrix multiplication to mvMatrix.
        //Berechnen der Model-View Matrix durch multiplizieren von Model-Matrix (aus Model) und ViewMatrix (aus Kamera).     
        mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);

        // Calculate normal matrix from model-view matrix. So stimmen die Normals auch, wenn man das Modell dreht. 
        // Die genaue Berechnung entsteht an Hand der modelView Matrix und wird von gl-Matrix normalFromMat4() durchgeführt. 
        mat3.normalFromMat4(model.nMatrix, mvMatrix);
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
     *  Calculate x,z position/eye of camera orbiting the center.
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
