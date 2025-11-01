let canvas1 = document.getElementById('canvas1'); //DOM-Element auf dem gerendet wird.


var triangle_top =
    [   //top
        0, 1,       //0
        -0.5, 0,    //1
        0.5, 0,     //2
        //  Left
        -0.5, 0,    //3
        -1, -1,     //4
        0, -1,      //5
        // Right
        0.5, 0,     //6
        0, -1,      //7
        1, -1       //8
    ]
/// Vertex data.
// Positions.
var vertices = new Float32Array(triangle_top)
// Colors as rgba.
var colors = new Float32Array(
    [
        1, 0, 0, 1,  //0 Rot
        1, 1, 1, 1,  //1 Weiß
        1, 1, 1, 1,  //2 Weiß
        1, 1, 1, 1,  //3 Weiß
        0, 1, 0, 1,  //4 Grün
        1, 1, 1, 1,  //5 Weiß
        1, 1, 1, 1,  //6 Weiß
        1, 1, 1, 1,  //7 Weiß
        0, 0, 1, 1,  //8 Blau
    ]);
// Index data.
var indices = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8])
main()

function main() {
    console.log(vertices)
    configure(canvas1, "triangles", vertices)

}

async function configure(canvas, modeString, verticeArray) {
    let gl = canvas.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.

    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    //Setze Hintergrund Farbe der ganzen Canvas
    gl.clearColor(1, 1, 1, 1);

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
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
    // 2 = Die Dimensionen des Attributs (x und y)
    gl.enableVertexAttribArray(posAttrib);


    /* == COLOR BUFFER == */
    var vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    // Bind buffer to attribute variable.
    var colAttrib = gl.getAttribLocation(program, 'col');
    gl.vertexAttribPointer(colAttrib, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colAttrib);


    /* == INDEX BUFFER == */
    var ibo = gl.createBuffer(); //Ein index buffer sagt die Reihenfolge an, mit der Die Vertices verbunden werden sollen. 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    ibo.numerOfEmements = indices.length;

    /* == RENDERN STARTEN == */
    gl.clear(gl.COLOR_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.
    gl.drawElements(mode, ibo.numerOfEmements, gl.UNSIGNED_SHORT, 0);
}


