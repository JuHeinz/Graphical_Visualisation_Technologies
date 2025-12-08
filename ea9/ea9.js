//Diese Datei gibt ein Modul Names app zurück, auf dem nur die Methode start aufgerufen werden kann.

var app = (function () {

    var gl;

    // The shader program object is also used to store attribute and uniform locations.
    var prog;

    // Array of model objects to render in this scene.
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
        distance: 4,
    };

    // Positionen für die Umlaufbahn der Lichter erstellen. 
    let n = 32;
    let circlePositions = generatePositionsInCircle(n)
    let startIndex = Math.floor(n * 0.5) //Die Hälfte von n

    // Beleuchtung der Szene. Bestehend aus den Einstellungen für das Ambient-Light und verschiedene Punktlichtquellen. 
    var illumination = {
        ambientLight: [.6, .6, .6],
        //Array aus Punktlichtquellen
        light: [
            { isOn: true, position: circlePositions[0], color: convertRGB(255, 255, 255), circleIndex: 0 },
        ]
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
     * Uniform-Variablen an Shader Programme übergeben.
     * Die uniformen z.B. Projektions-Matrix und die Model-View-Matrix im Shader-Programm finden und dem js Object prog als Attribute hinzufügen.
     * uniform -> Alle Vertices / Fragments werden mit den gleichen Werten bearbeitet, read-only. Ändert sich nicht von Vertex zu Vertex. 
     */
    function initUniforms() {
        // Projection Matrix.
        // Bestimmt die Kamera-Projektion
        prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");

        // Model-View-Matrix
        // Bestimmt die Kamera-Position, bzw die Modell-Position.
        prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");

        //Normals
        prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");

        //Farbe
        prog.colorUniform = gl.getUniformLocation(prog, "uColor");

        // Light.
        prog.ambientLightUniform = gl.getUniformLocation(prog, "ambientLight");

        // Array for light sources uniforms.
        prog.lightUniform = [];
        // Loop over light sources.
        for (var j = 0; j < illumination.light.length; j++) {
            var lightNb = "light[" + j + "]";
            // Store one object for every light source.
            var l = {};
            l.isOn = gl.getUniformLocation(prog, lightNb + ".isOn");
            l.position = gl.getUniformLocation(prog, lightNb + ".position");
            l.color = gl.getUniformLocation(prog, lightNb + ".color");
            prog.lightUniform[j] = l;
        }

        // Material.
        prog.materialKaUniform = gl.getUniformLocation(prog, "material.ka");
        prog.materialKdUniform = gl.getUniformLocation(prog, "material.kd");
        prog.materialKsUniform = gl.getUniformLocation(prog, "material.ks");
        prog.materialKeUniform = gl.getUniformLocation(prog, "material.ke");

        // Texture.
        prog.textureUniform = gl.getUniformLocation(prog, "uTexture");

    }

    /**
   * Load the texture image file.
   */
    function initTexture(model, filename) {
        var texture = gl.createTexture();
        model.texture = texture;
        texture.loaded = false;
        texture.image = new Image();
        texture.image.onload = function () {
            onloadTextureImage(texture);
        };
        texture.image.src = filename;
    }

    /**
     * Bind texture to gl
     */
    function onloadTextureImage(texture) {

        texture.loaded = true;

        // Use texture object.
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Assign image data.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            texture.image);

        // Set texture parameter.

        // Min Filter: NEAREST,LINEAR, .. , LINEAR_MIPMAP_LINEAR,
        /* Minification settings: How to handle texture having a bigger resolution than model.
            NEAREST: Mittellung wird nur über ein Textel (Texture Pixel) durchgeführt. Am wenigsten rechenintensiv.
            LINEAR_MIPMAP_LINEAR: Mittellung über mehrere Texel.
        */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        // Mag Filter: NEAREST,LINEAR
        /* Maginification settings: How to handle model having more pixels than texture */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        /* Mip Map erstellen: Verschiedene Auflösungen der gleichen Textur erstellen*/
        gl.generateMipmap(gl.TEXTURE_2D);

        // Release texture object.
        gl.bindTexture(gl.TEXTURE_2D, null);

        // Update the scene.
        render();
    }

    /**
    * @paramter material : objekt with optional ka, kd, ks, ke.
    * @retrun material : objekt with ka, kd, ks, ke.
    */
    function createPhongMaterial(material) {
        material = material || {};
        // Set some default values,
        // if not defined in material paramter.
        material.ka = material.ka || [0.3, 0.3, 0.3];
        material.kd = material.kd || [0.6, 0.6, 0.6];
        material.ks = material.ks || [0.8, 0.8, 0.8];
        material.ke = material.ke || 10.;

        return material;
    }

    /**
     * Definieren, welche Models und mit welchem Stil gerendert werden sollen.
     * Ursprüngliche Transformation, Rotation und Skalierung festlegen.
     */
    function initModels() {

        let dark = convertRGB(33, 37, 41);

        //Create materials
        var defaultMaterial = createPhongMaterial();

        var shinyMaterial = createPhongMaterial({
            ks: [1, 1, 1],
            ke: 20,
        });
        var dullMaterial = createPhongMaterial({
            ks: [0., 0., 0.] //keine spekular Reflexion
        });

        // fill-style
        let fw = "fillwireframe";
        let f = "fill";
        let w = "wireframe"
        let white = [1, 1, 1, 1];
        let texturePath = "../textures/x.png"

        var greyMaterial = createPhongMaterial({
            ka: [1., 1., 1.],
            kd: [.5, .5, .5],
            ks: [0., 0., 0.]
        });

        //createModel("torus", f, white, [0, .75, 0], [0, 0, 0], [1, 1, 1], defaultMaterial);
        //createModel("sphere", f, white, [-1.25, .5, 0], [0, 0, 0, 0], [.5, .5, .5], shinyMaterial);
        //createModel("sphere", f, white, [1.25, .5, 0], [0, 0, 0, 0], [.5, .5, .5], shinyMaterial);
        //Boden
        createModel("plane", f, [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0,
            0], [1, 1, 1, 1], greyMaterial, texturePath);

        // Select one model that can be manipulated interactively by user.
        interactiveModel = models[0];
    }

    /**
     * Create model object, fill it and push it in models array.
     * 
     * @parameter geometryname: string with name of geometry.
     * @parameter fillstyle: wireframe, fill, fillwireframe.
     */
    function createModel(geometryname, fillstyle, color, translate, rotate, scale, material, textureFilename) {
        var model = {};
        model.fillstyle = fillstyle;
        model.color = color;

        initDataAndBuffers(model, geometryname);
        initTransformations(model, translate, rotate, scale);

        if (textureFilename) {
            initTexture(model, textureFilename);
        }

        model.material = material;


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
        /// Provide model object with vertex data arrays.
        // Fill data arrays for Vertex-Positions, Normals, Index data:
        // vertices, normals, indicesLines, indicesTris;
        // Pointer this refers to the window.
        this[geometryname]['createVertexData'].apply(model);

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

        // Setup texture coordinate vertex buffer object.
        model.vboTextureCoord = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboTextureCoord);
        gl.bufferData(gl.ARRAY_BUFFER, model.textureCoord, gl.STATIC_DRAW);
        // Bind buffer to attribute variable.
        prog.textureCoordAttrib = gl
            .getAttribLocation(prog, 'aTextureCoord');
        gl.enableVertexAttribArray(prog.textureCoordAttrib);

        // Setup lines index buffer object.
        model.iboLines = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines,
            gl.STATIC_DRAW);
        model.iboLines.numberOfElements = model.indicesLines.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // Setup triangle index buffer object.
        model.iboTris = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris,
            gl.STATIC_DRAW);
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
                case ('l'):
                    changeLightsPosition(1)
                    break;
                case ('L'):
                    changeLightsPosition(-1)
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
        console.log("Camera Center: ", camera.center)

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
        camera.distance = 4;
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


        // SET LIGHT UNIFORMS
        // Ambient Light in das Programm (und somit den Shader) übergeben.
        gl.uniform3fv(prog.ambientLightUniform, illumination.ambientLight);

        // Set uniforms for every light in light array
        for (var j = 0; j < illumination.light.length; j++) {

            let currentLight = illumination.light[j];

            gl.uniform1i(prog.lightUniform[j].isOn, currentLight.isOn); // (bool wird zu int übersetzt)

            /* Licht-Position in Relation zur View Matrix berechnen, also zu eye-coordinates tranformieren. */
            var lightPos = [].concat(currentLight.position); // Copy current light position into a new array.
            lightPos.push(1.0); // Vierte Koordinate hinzufügen die für Transformation gebraucht wird.
            vec4.transformMat4(lightPos, lightPos, camera.vMatrix); //Transformation durchführen
            lightPos.pop(); // Vierte Koordinate wieder entfernen. 


            // Light position und color in das Programm (und somit den Shader) übergeben.
            gl.uniform3fv(prog.lightUniform[j].position, lightPos);
            gl.uniform3fv(prog.lightUniform[j].color, currentLight.color);
        }

        // Loop over models.
        for (var i = 0; i < models.length; i++) {

            if (!models[i].texture.loaded) {
                continue;
            }

            updateTransformations(models[i]);

            //UNIFORMS AUS DEM MODEL HOLEN UND IM SHADER SETZEN
            // ModelViewMatrix, die im model Object gespeichert wird, in das Programm (und somit den Shader) übergeben.
            gl.uniformMatrix4fv(prog.mvMatrixUniform, false, models[i].mvMatrix); //4fv == 4 x 4 Matrix aus Floating Point Werten

            // Farbe, die im model Object gespeichert wird, in das Programm (und somit den Shader) übergeben.
            gl.uniform4fv(prog.colorUniform, models[i].color);

            // Normal-Matrix, die im model Object gespeichert wird, in das Programm (und somit den Shader) übergeben.
            gl.uniformMatrix3fv(prog.nMatrixUniform, false, models[i].nMatrix);

            // Material-Eigenschaften, die im model Object gespeichert werden, in das Programm (und somit den Shader) übergeben.
            gl.uniform3fv(prog.materialKaUniform, models[i].material.ka);
            gl.uniform3fv(prog.materialKdUniform, models[i].material.kd);
            gl.uniform3fv(prog.materialKsUniform, models[i].material.ks);
            gl.uniform1f(prog.materialKeUniform, models[i].material.ke);

            // Texture.
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, models[i].texture);
            gl.uniform1i(prog.textureUniform, 0);

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

        // Setup texture VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboTextureCoord);
        gl.vertexAttribPointer(prog.textureCoordAttrib, 2, gl.FLOAT, false, 0, 0);

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




    /**
     * Erstellt ein Array an n Positionen auf einem Kreis.
     */
    function generatePositionsInCircle(n) {
        let positions = [];
        var circle_Umfang = 2 * Math.PI //2 * PI (* r) = Kreisumfang. t kann zwischen 0 und 2 Pi liegen. 
        var dt = circle_Umfang / n; //dt = Schrittweite. 
        var t = 0;
        var r = 2;

        for (var i = 0; i <= n - 1; i++, t += dt) {
            //t = Ein Punkt auf dem Umfang des Kreises. Erstes t Ist 0, letztes T ist 2 * PI.
            var x = r * Math.cos(t); // X-Wert an Stelle t berechnen
            var z = r * Math.sin(t); // Z-Wert an Stelle t berechnen

            positions.push([x, .7, z]);
        }

        return positions;
    }


    /**
     * Licht rotieren. 
     * @param {} sign -1 = CW, 1 = CCW
     */
    function changeLightsPosition(sign) {
        let light = illumination.light[0]
        let curCircleIndex = light.circleIndex;
        let n = circlePositions.length;

        //neuer Index berechnen.
        let newIndex = curCircleIndex + sign;

        if (newIndex >= n) {
            newIndex = 0
        }

        if (newIndex < 0) {
            newIndex = n - 1;
        }


        //Setze neue Position des Lichts an Stelle des Index.
        light.position = circlePositions[newIndex];

        //geupdater index an das Licht-Object überreichen.
        light.circleIndex = newIndex;
        render()
    }



    /*
    RGBA Farben von Wertebereich [0,255] zu Wertebereich[0,1] transformieren.
    */
    function convertRGBA(r, g, b, a) {
        var r_new = r / 255;
        var g_new = g / 255
        var b_new = b / 255
        var a_new = a / 255
        return [r_new, g_new, b_new, a_new]
    }

    /*
 RGB Farben von Wertebereich [0,255] zu Wertebereich[0,1] transformieren.
 */
    function convertRGB(r, g, b) {
        var r_new = r / 255;
        var g_new = g / 255
        var b_new = b / 255
        return [r_new, g_new, b_new]
    }

    // App interface.
    return {
        start: start
    }

}());
