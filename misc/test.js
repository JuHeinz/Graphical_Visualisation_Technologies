const canvas = document.getElementById('canvas'); //DOM-Element auf dem gerendet wird.
const gl = canvas.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.
var vertices = new Float32Array([
    0, 0,
    3, 0,
    0, 3,
    3, 3,
    1.5, 6,
    0, 3,
    0, 0,
    3, 3,
    3, 0]);

main()

function main() {
    gl.clearColor(0, 0, 0, 0); //Setze Hintergrund Farbe der ganzen Canvas
    gl.clear(gl.COLOR_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.


    let program1 = createProgram(0.1, "0,0,1,0")
    render(gl.POINTS, vertices, program1);

    let program2 = createProgram(0.2, "0,1,0,1")
    render(gl.LINES, vertices, program2);

    let program3 = createProgram(0.3, "1,0,0,1")
    render(gl.LINE_STRIP, vertices, program3);

    let program4 = createProgram(0.4, "1,0,1,1")
    render(gl.TRIANGLES, vertices, program4);

}



function createFragmentShader(color) {
    return 'void main() { gl_FragColor = vec4(' + color + '); }'
}

function createVertexShader(offset) {

    var formula = "pos * 0.1 -" + offset

    return 'attribute vec2 pos;' +
        'void main(){ gl_Position = vec4(' + formula + ', 0, 1);' +
        'gl_PointSize = 10.0; }';

}

function createProgram(offset, color) {

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


function render(mode, verticeArray, program) {
    /* == DATEN IN BUFFER LADEN == */
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);

    /* == PROGRAMM MIT DATEN VERBINDEN == */
    var posAttrib = gl.getAttribLocation(program, 'pos');
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    /* == RENDERN STARTEN == */
    gl.drawArrays(mode, 0, vertices.length);
}


