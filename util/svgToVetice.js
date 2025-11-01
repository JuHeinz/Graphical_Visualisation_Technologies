
let indexes = getIndexArray(normalizeVertices);
//main(vertices32)

function getVertices() {
    let verticesFromPoints = parsePoints("27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22")
    let normalizedVertices = normalizeVertices(verticesFromPoints, 40, 40)
    return new Float32Array(normalizedVertices)
}


/**
 Split the point string from the SVG into an array of integers. These are the vertices.
 */
function parsePoints(pointsStr) {
    const points = pointsStr.trim().split(/\s+/).flatMap(p => p.split(',').map(Number));
    console.log("Converted from String to Array")
    console.log(points)
    return points
}

/**
    Normalize Vertices to the size if the SVG
    If the size is 800, a position with the value 800 will be transformed to 1
 */
function normalizeVertices(vertices, width, height) {
    const out = [];
    for (let i = 0; i < vertices.length; i += 2) {
        const x = (vertices[i] / width) * 2 - 1;
        const y = 1 - (vertices[i + 1] / height) * 2;
        out.push(x, y);
    }
    console.log("Normalized Vertices:")
    console.log(out)
    return out;
}

function getIndexArray(normalizedVertices) {
    const indexCount = normalizedVertices.length / 2;
    const indexes = Array.from({ length: indexCount }, (_, i) => i)
    console.log(indexes)
    return indexes
}

function triangulateRectangle() {
    return [0, 1, 2, 0, 2, 3];
}


function main(vertices) {
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
        'void main(){ gl_Position = vec4(pos, 0, 1);' +
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
    gl.drawArrays(mode, 0, verticeArray.length / 2);
}


