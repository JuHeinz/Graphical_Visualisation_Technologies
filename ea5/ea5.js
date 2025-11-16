var canvas1 = document.getElementById('canvas1');
var canvas2 = document.getElementById('canvas2');

r = 0.6
/* ZYLINDER */
/* 
 Mantel eines Zyliners von der Seite.
 Mehrere Kreise, die übereinander liegen.
 Die Kreise haben immer den Radius r. 
 u-Ebene = Winkel im Kreis
 v-Ebene = Höhe

 */
function x_Zylinder(u, v) {
    return r * Math.cos(u);
}

function z_Zylinder(u, v) {
    return r * Math.sin(u);
}

function y_Zylinder(u, v) {
    return v
}


main()

/* KUGEL */
/*
    u = Winkel auf dem Kreis, der um den Äquator geht.
    v = Winkel auf dem Kreis, der von Nordpol zu Südpol geht.
*/
function x_Kugel(u, v) {
    return r * Math.sin(v) * Math.cos(u);
}

function y_Kugel(u, v) {
    return r * Math.sin(v) * Math.sin(u);
}

function z_Kugel(u, v) {
    return r * Math.cos(v) - 1;
}


function main() {
    configure(canvas1)
}

function configure(canvas) {
    let gl = canvas.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.

    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    /* Mittels des Tiefentests wird für jedes Fragment
     *  - bevor es in den Framebuffer übernommen wird - geprüft, ob es nicht schon hinter einem bereits verarbeiteten Fragment liegt.
     * In diesem Fall wird es verworfen. */
    // Depth(Z)-Buffer.
    //gl.enable(gl.DEPTH_TEST); //Anschalten des Tiefentests
    //gl.depthFunc(gl.LEQUAL); //EQUAL = Neu hinzugefügtes Fragment muss eine kleinere oder gleiche Tiefe zur Kamera haben, wie bestehende, um hinzugefügt werden zu können.

    /* Polygone (Dreiecke, im Gegensatz zu Linien) nach Hinten verschieben, um z-Bleeding zu vermeiden) */
    // Polygon offset of rastered Fragments.
    //gl.enable(gl.POLYGON_OFFSET_FILL);
    //gl.polygonOffset(1.0, 1.0);

    //Setze Hintergrund Farbe der ganzen Canvas
    gl.clearColor(1, 1, 1, 1);

    //Get programm from external files
    const vsSource = '' +
        'attribute vec3 pos;' +
        'attribute vec4 col;' +
        'varying vec4 color;' +
        'void main(){' + 'color = col;' +
        'gl_Position = vec4(pos, 1);' +
        '}';

    const fsSource = 'precision mediump float;' +
        'varying vec4 color;' +
        'void main() {' +
        'gl_FragColor = color;' +
        '}';

    let prog = createProgram(gl, vsSource, fsSource)

    //Create Arrays for form 1
    var [vertices, indicesLines, indicesTris] = createVertexData(32, 4, x_Zylinder, y_Zylinder, z_Zylinder, 0, 2 * Math.PI, 0, 1);

    //Create Buffer for form 1
    var [iboTris1, iboLines1] = prepareBuffer(gl, prog, vertices, indicesLines, indicesTris);

    //Clear frame and depth-Buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.

    //Render form 1
    render(gl, prog, iboTris1, iboLines1)

    //Create Arrays for Form 2
    var [vertices, indicesLines, indicesTris] = createVertexData(10, 10, x_Kugel, z_Kugel, y_Kugel, 0, 2 * Math.PI, 0, Math.PI);

    //Create Buffer for form 2
    var [iboTris2, iboLines2] = prepareBuffer(gl, prog, vertices, indicesLines, indicesTris);

    //Render form 2, do not clear buffer beforehand. 
    render(gl, prog, iboTris2, iboLines2)
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
function prepareBuffer(gl, prog, vertices, indicesLines, indicesTris) {

    /* == VERTEX POSITION BUFFER == */
    var vboPos = gl.createBuffer(); //Vertex Position Buffer erstellen
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos); //Bind Buffer = alle folgenden Befehle auf gl beziehen sich auf diesen Buffer.
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    /* == PROGRAMM/BUFFER MIT DATEN VERBINDEN == */
    //Das Attribut pos wird im Shader lokalisiert, initialisiert und gebunden.
    var posAttrib = gl.getAttribLocation(prog, 'pos');
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
    // 3 = Die Dimensionen des Attributs (x, y & z)
    gl.enableVertexAttribArray(posAttrib);

    /* == LINE INDEX BUFFER == */
    /* Der Index Buffer muss der letzte Buffer sein, der an gl gebunden ist, bevor gl.drawElements aufgerufen wird! */
    var iboLines = gl.createBuffer(); //Ein index buffer sagt die Reihenfolge an, mit der die Vertices verbunden werden sollen. 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesLines, gl.STATIC_DRAW);
    iboLines.numerOfEmements = indicesLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    /* == TRI INDEX BUFFER == */
    // Setup tris index buffer object.
    var iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesTris, gl.STATIC_DRAW);
    iboTris.numberOfElements = indicesTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    return [iboTris, iboLines];


}
/**
 * Render triangles and lines from the given IBOs
 */
function render(gl, prog, iboTris, iboLines) {
    // Setup constant color.
    var colAttrib = gl.getAttribLocation(prog, 'col');

    // Triangles rendern
    gl.vertexAttrib4f(colAttrib, 1, 0, 0, 1); //Setze col Attribut im Shader auf einen bestimmten Wert.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.drawElements(gl.TRIANGLES, iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);  // Mit drawElements wird das gebundene IBO ausgelesen und der Rendervorgang gestartet.

    // Lines rendern
    gl.vertexAttrib4f(colAttrib, 1, 0, 1, 1); //Linienfarbe
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.drawElements(gl.LINES, iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
}








