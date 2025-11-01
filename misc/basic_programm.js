let canvas1 = document.getElementById('canvas1'); //DOM-Element auf dem gerendet wird.
let canvas2 = document.getElementById('canvas2');
let canvas3 = document.getElementById('canvas3');
let canvas4 = document.getElementById('canvas4');
let canvas5 = document.getElementById('canvas5');
let canvas6 = document.getElementById('canvas6');
let canvas7 = document.getElementById('canvas7');

// Vertex data "Haus des Nikolaus mit Tür"
var vertices = new Float32Array([
    0, 0, //0
    2, 0, //1
    2, 2, //2
    3, 2, //3
    3, 0, //4
    5, 0, //5
    5, 5, //6
    2.5, 7, //7
    0, 5 //8
]);
// Index data "Haus des Nikolaus mit Tür"
var indices = new Uint16Array([
    0, 1, 2, 0, 2, 8, 2, 7, 8, 2, 3, 7, 3, 6, 7, 3, 5, 6, 3, 4, 5]);

// Colors as rgba. Für jeden Vertex eine Farbe. 
var colors = new Float32Array
    ([1, 0, 0, 1,
        1, 0, 0, 1,
        0, 0, 1, 1,
        0, 0, 1, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        0, 0, 1, 1,
        0, 0, 1, 1,
        1, 0, 0, 1,
    ]);

main()

function main() {
    configure(canvas1, "points", vertices)
    configure(canvas2, "lines", vertices)
    configure(canvas3, "line_strip", vertices)
    configure(canvas4, "line_loop", vertices)
    configure(canvas5, "triangles", vertices)
    configure(canvas6, "triangle_strip", vertices)
    configure(canvas7, "triangle_fan", vertices)
}

function configure(canvas, modeString, verticeArray) {
    let gl = canvas.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.

    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    //Setze Hintergrund Farbe der ganzen Canvas
    gl.clearColor(1, 1, 1, 1);



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

    let program = createProgram(gl, "0,0,0,1")
    render(gl, mode, verticeArray, program);
}




/**
 Vertex Shader und Fragment Shader erstellen und zu einem Programm zusammenführen.
 */
function createProgram(gl, color) {

    /* == VERTEX SHADER ERSTELLEN UND KOMPILIEREN == */
    let vsCode = createVertexShader()
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsCode);
    gl.compileShader(vertexShader);

    /* == FRAGMENT SHADER ERSTELLEN UND KOMPILIEREN == */
    var fsCode = createFragmentShader(color)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsCode);
    gl.compileShader(fragmentShader);

    /* == PROGRAMM ERSTELLEN == */
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program); //Ab jetzt wird alles mit den oben genannten Shadern gerendert

    return program
}

function createFragmentShader(color) {
    return 'precision mediump float;' +
        'varying vec4 color;' +
        'void main() {' +
        'gl_FragColor = color;' +
        '}';
}

function createVertexShader() {
    return '' +
        'attribute vec3 pos;' +
        'attribute vec4 col;' +
        'varying vec4 color;' +
        'void main(){' +
        'color = col;' +
        'gl_Position = vec4(0.2*pos-0.5, 1);' +
        '}';

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
    // 3 = Die Dimensionen des Attributs (x und y)
    gl.enableVertexAttribArray(posAttrib);


    /* == COLOR BUFFER == */
    var vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    // Bind buffer to attribute variable in shader
    var colAttrib = gl.getAttribLocation(program, 'col');
    gl.vertexAttribPointer(colAttrib, 4, gl.FLOAT, false, 0, 0); // 4 Dimensionen -> RGBA
    gl.enableVertexAttribArray(colAttrib);


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


