let canvas1 = document.getElementById('canvas1'); //DOM-Element auf dem gerendet wird.
let canvas2 = document.getElementById('canvas2');
let canvas3 = document.getElementById('canvas3');
let canvas4 = document.getElementById('canvas4');

// Vertex data.
var vertices = new Float32Array([
    0, 0, 2, 0, 2, 2, 3, 2, 3, 0, 5, 0, 5, 5, 2.5, 7, 0, 5]);
// Index data.
var indices = new Uint16Array([
    0, 1, 2, 0, 2, 8, 2, 7, 8, 2, 3, 7, 3, 6, 7, 3, 5, 6, 3, 4, 5]);

main()
/* Create num pairs of random x and y coordinates */
function createRandomVertices(num, min, max) {

    let vertices = [];

    for (let index = 0; index < num; index++) {
        let x = Math.random() * (max - min) + min
        let y = Math.random() * (max - min) + min
        vertices.push(x.toFixed(1))
        vertices.push(y.toFixed(1))
    }

    console.log(vertices)
    return new Float32Array(vertices)
}


function main() {
    configure(canvas1, "points", vertices)
    configure(canvas2, "lines", vertices)
    configure(canvas3, "line_strip", vertices)
    configure(canvas4, "line_loop", vertices)
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

    let program = createProgram(gl, "0.15, 0.71, 0.123, 1")
    render(gl, mode, verticeArray, program);
}


function createFragmentShader(color) {
    return 'void main() { gl_FragColor = vec4(' + color + '); }'
}

function createVertexShader() {
    return 'attribute vec2 pos;' +
        'void main(){ gl_Position = vec4(pos*0.2-0.5, 0, 1); }';

}

function createProgram(gl, color) {

    gl.clearColor(1, 1, 1, 1); //Setze Hintergrund Farbe der ganzen Canvas
    gl.clear(gl.COLOR_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.

    let vsCode = createVertexShader()
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
    gl.drawArrays(mode, 0, 30);
}


