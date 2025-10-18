let canvas1 = document.getElementById('canvas1'); //DOM-Element auf dem gerendet wird.
let canvas2 = document.getElementById('canvas2');
let canvas3 = document.getElementById('canvas3');
let canvas4 = document.getElementById('canvas4');

var heart_array = [
    0,
    1,
    0.028759856128643898,
    1.1722053852435435,
    0.21532273034579755,
    1.6033864784154561,
    0.6498393924658128,
    2.079837387624884,
    1.3133193793117677,
    2.3635043576974253,
    2.0784609690826525,
    2.3000000000000003,
    2.7527638409423467,
    1.8742645786248002,
    3.1476977619199786,
    1.1908193114511636,
    3.1476977619199795,
    0.4000577069594079,
    2.752763840942348,
    -0.3798373876248839,
    2.0784609690826534,
    -1.0999999999999992,
    1.313319379311769,
    -1.7631883908685948,
    0.6498393924658131,
    -2.3742645786248,
    0.21532273034579738,
    -2.8998363058261116,
    0.028759856128643898,
    -3.2669485430722887,
    5.877363255445678e-48,
    -3.4000000000000004,
    -0.02875985612864379,
    -3.2669485430722887,
    -0.21532273034579702,
    -2.8998363058261125,
    -0.6498393924658123,
    -2.3742645786248007,
    -1.3133193793117668,
    -1.7631883908685968,
    -2.0784609690826508,
    -1.1000000000000014,
    -2.7527638409423467,
    -0.3798373876248849,
    -3.1476977619199786,
    0.4000577069594046,
    -3.1476977619199786,
    1.1908193114511652,
    -2.752763840942348,
    1.8742645786247998,
    -2.0784609690826525,
    2.3000000000000003,
    -1.3133193793117668,
    2.363504357697425,
    -0.6498393924658135,
    2.0798373876248855,
    -0.21532273034579755,
    1.6033864784154563,
    -0.02875985612864413,
    1.1722053852435441
]

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
    let vertices = new Float32Array(heart_array)
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

    var formula = "pos * 0.3"

    return 'attribute vec2 pos;' +
        'void main(){ gl_Position = vec4(' + formula + ', 0, 1);' +
        'gl_PointSize = 1.3; }';

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


