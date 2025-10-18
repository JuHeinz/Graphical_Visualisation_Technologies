let canvas1 = document.getElementById('canvas1'); //DOM-Element auf dem gerendet wird.
let canvas2 = document.getElementById('canvas2');
let canvas3 = document.getElementById('canvas3');
let canvas4 = document.getElementById('canvas4');
let canvas5 = document.getElementById('canvas5');
let canvas6 = document.getElementById('canvas6');
let canvas7 = document.getElementById('canvas7');


var vertices_points = new Float32Array([
    -3, -3,
    0, -3,
    -3, 0,
    0, 0,
    -1.5, 3,
]);

var vertices_lines = new Float32Array([
    -3, -3,
    0, -3,
    0, 0,
    1, 1,
]);

var vertices_random = new Float32Array([
    -5, -3,
    0, -3,
    -3, 2,
    0, 2,
    -1.1, 2,
    -3, -1,
    -3, -3,
    0, 0,
    0, -3]);

var vertices_complex = new Float32Array([
    -3, -3,
    0, -3,
    -3, 0,
    0, 0,
    -1.5, 3,
    -3, -3,
    -3, -3,
    0, 0,
    0, -3]);

main()

function main() {
    configure(canvas1, "points", vertices_points)
    configure(canvas2, "lines", vertices_lines)
    configure(canvas3, "line_strip", vertices_random)
    configure(canvas4, "line_loop", vertices_complex)
    configure(canvas5, "triangles", vertices_complex)
    configure(canvas6, "triangle_strip", vertices_complex)
    configure(canvas7, "triangle_fan", vertices_complex)

}

function configure(canvas, modeString, verticeArray) {
    let gl = canvas.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.

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

    let program = createProgram(gl, 0.2, "0,0,0,1")
    render(gl, mode, verticeArray, program);
}


function createFragmentShader(color) {
    return 'void main() { gl_FragColor = vec4(' + color + '); }'
}

function createVertexShader(offset) {

    var formula = "pos * 0.3"

    return 'attribute vec2 pos;' +
        'void main(){ gl_Position = vec4(' + formula + ', 0, 1);' +
        'gl_PointSize = 10.0; }';

}

function createProgram(gl, offset, color) {

    gl.clearColor(0, 0, 0, 0); //Setze Hintergrund Farbe der ganzen Canvas
    gl.clear(gl.COLOR_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.

    let vsCode = createVertexShader(offset)
    var fsCode = createFragmentShader(color)

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsCode);
    gl.compileShader(vertexShader);

    /* == FRAGMENT SHADER ERSTELLEN UND KOMPILIEREN == */
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


function render(gl, mode, verticeArray, program) {
    /* == DATEN IN BUFFER LADEN == */
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); //alle folgenden Befehle auf gl beziehen sich auf diesen Buffer.
    gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);

    /* == PROGRAMM MIT DATEN VERBINDEN == */
    var posAttrib = gl.getAttribLocation(program, 'pos');
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
    // 2 = Die Dimensionen des Attributs (x und y)

    gl.enableVertexAttribArray(posAttrib);

    /* == RENDERN STARTEN == */
    gl.drawArrays(mode, 0, verticeArray.length / 2);
}


