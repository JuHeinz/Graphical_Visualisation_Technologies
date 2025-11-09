let canvas1 = document.getElementById('canvas1'); //DOM-Element auf dem gerendet wird.


var vertices;
var indices;


main()

function main() {
    createVertexData();

    configure(canvas1, "line_strip", vertices)
}

async function configure(canvas, modeString, verticeArray) {
    let gl = canvas.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.

    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    //Setze Hintergrund Farbe der ganzen Canvas
    gl.clearColor(1, 1, 1, 1);

    //Get programm from external files
    const vsSource = await fetch('./vertex.vert').then(r => r.text());
    const fsSource = await fetch('./fragment.frag').then(r => r.text());

    let program = createProgram(gl, vsSource, fsSource)
    let mode;
    switch (modeString) {
        case "points":
            mode = gl.POINTS
            break;
        case "lines":
            mode = gl.LINES
            break;
        case "line_strip":
            mode = gl.LINE_STRIP
            break;
        case "line_loop":
            mode = gl.LINE_LOOP
            break;
        case "triangles":
            mode = gl.TRIANGLES
            break;
        case "triangle_strip":
            mode = gl.TRIANGLE_STRIP
            break;
        case "triangle_fan":
            mode = gl.TRIANGLE_FAN
            break;

        default:
            break;
    }

    render(gl, mode, verticeArray, program);
}




/**
 Vertex Shader und Fragment Shader erstellen und zu einem Programm zusammenführen.
 */
function createProgram(gl, vsSource, fsSource) {
    /* == VERTEX SHADER ERSTELLEN UND KOMPILIEREN == */
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    /* == FRAGMENT SHADER ERSTELLEN UND KOMPILIEREN == */
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    /* == PROGRAMM ERSTELLEN == */
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Sicherstellen, dass das Attribut "pos", das erste ist in der Attributliste ist. 
    gl.bindAttribLocation(program, 0, "pos");

    gl.linkProgram(program);
    gl.useProgram(program); //Ab jetzt wird alles mit den oben genannten Shadern gerendert

    return program
}



/**
 * 
 Buffer Set up und rendern starten
 */
function render(gl, mode, vertices, program) {



    /* == VERTEX POSITION BUFFER == */
    var vboPos = gl.createBuffer(); //Vertex Position Buffer erstellen
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos); //alle folgenden Befehle auf gl beziehen sich auf diesen Buffer.
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    /* == PROGRAMM/BUFFER MIT DATEN VERBINDEN == */
    //Das Attribut pos wird im Shader lokalisiert, initialisiert und gebunden.
    var posAttrib = gl.getAttribLocation(program, 'pos');
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
    // 3 = Die Dimensionen des Attributs (x,y,z)
    gl.enableVertexAttribArray(posAttrib);



    // Setup constant color.
    var colAttrib = gl.getAttribLocation(program, 'col');
    gl.vertexAttrib4f(colAttrib, 0, 0, 1, 1);


    /* == COLOR BUFFER == 
    var vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    // Bind buffer to attribute variable in shader
    var colAttrib = gl.getAttribLocation(program, 'col');
    gl.vertexAttribPointer(colAttrib, 4, gl.FLOAT, false, 0, 0); // 4 Dimensionen -> RGBA
    gl.enableVertexAttribArray(colAttrib);
    */

    /* == INDEX BUFFER == */
    /* Der Index Buffer muss der letzte Buffer sein, der an gl gebunden ist, bevor gl.drawElements aufgerufen wird! */
    var ibo = gl.createBuffer(); //Ein index buffer sagt die Reihenfolge an, mit der Die Vertices verbunden werden sollen. 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    ibo.numerOfEmements = indices.length;

    /* == RENDERN STARTEN == */
    gl.clear(gl.COLOR_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.
    // Mit drawElements wird das gebundene IBO ausgelesen und der Rendervorgang gestartet.
    gl.drawElements(mode, ibo.numerOfEmements, gl.UNSIGNED_SHORT, 0);
}


function createVertexData() {
    var n = 32
    // Positions.
    vertices = new Float32Array(3 * (n + 1));
    // Index data for Linestip.
    indices = new Uint16Array(n + 1);

    var dt = 2 * Math.PI / n; //dt = Schrittweite. 
    var t = 0;
    var r = 1.0;

    var z = 0;
    for (var i = 0; i <= n; i++, t += dt) {
        var x = r * Math.cos(t);
        var y = r * Math.sin(t);

        // Set vertex positions.
        vertices[i * 3] = x;
        vertices[i * 3 + 1] = y;
        vertices[i * 3 + 2] = z;

        // Set index.
        indices[i] = i;
    }
}
