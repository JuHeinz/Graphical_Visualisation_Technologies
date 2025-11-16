var canvas3 = document.getElementById('canvas3');
var canvas4 = document.getElementById('canvas4');

var r = 0.3

/* 
    Wie das Vertice zeigt, wird durch die Normale berechnet.
    Die Berechnung der normalen erfolgt bei jeder Form durch eine andere Formel.
*/

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
    return r * Math.cos(v);
}

function xNorm_Kugel(x, y, z) {
    var vertexLength = Math.sqrt(x * x + y * y + z * z);
    return x / vertexLength;
}

function yNorm_Kugel(x, y, z) {
    var vertexLength = Math.sqrt(x * x + y * y + z * z);
    return y / vertexLength;
}

function zNorm_Kugel(x, y, z) {
    var vertexLength = Math.sqrt(x * x + y * y + z * z);
    return z / vertexLength;
}
var [vertexArray1, indicesLines1, indicesTris1, normals1] = createVertexData(32, 32, x_Kugel, y_Kugel, z_Kugel, 0, 2 * Math.PI, 0, Math.PI, xNorm_Kugel, yNorm_Kugel, zNorm_Kugel);

setup(canvas1, vertexArray1, indicesLines1, indicesTris1, normals1)

function setup(canvas, vertexArray, indexArrayLines, indexArrayTris, normals) {
    var gl = canvas.getContext('experimental-webgl');

    // Pipeline setup.
    gl.clearColor(.95, .95, .95, 1);
    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Depth(Z)-Buffer.
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // Polygon offset of rastered Fragments.
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(0.5, 0);

    // Compile vertex shader. 
    // Die Werte für R, G und B sind von der z, y und z Komponenten der Normalen abhängig. 
    // Je höher der X Wert (weiter rechts), desto Roter das Vertice
    // Je Höher der Y Wert (weiter oben), desto Grüner das Vertice
    // Je Höher der Z Wert (näher zum Betrachter), desto Blauer das Vertice

    // 
    var vsSource = '' +
        'attribute vec3 pos;' +
        'attribute vec3 col;' +
        'varying vec4 color;' +
        'void main(){' +
        'color = vec4(col.x, col.y, col.z, 1);' +
        'gl_Position = vec4(pos, 1);' +
        '}';
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    // Compile fragment shader.
    fsSouce = 'precision mediump float;' +
        'varying vec4 color;' +
        'void main() {' +
        'gl_FragColor = color;' +
        '}';
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSouce);
    gl.compileShader(fs);

    // Link shader together into a program.
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "pos");
    gl.linkProgram(prog);
    gl.useProgram(prog);

    //VERTEX BUFFER
    // Setup position vertex buffer object.
    var vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    // Bind vertex buffer to attribute variable.
    var posAttrib = gl.getAttribLocation(prog, 'pos');
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    //NORMALS BUFFER
    // Setup normal vertex buffer object.
    var vboNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNormal);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    // Den Normalen Buffer mit dem Attribut Farbe im Vertex Shader verbinden.
    var colAttrib = gl.getAttribLocation(prog, 'col');
    gl.vertexAttribPointer(colAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colAttrib);

    //INDEX BUFFER LINES
    // Setup index buffer object for lines
    var iboLines = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArrayLines, gl.STATIC_DRAW);
    iboLines.numberOfElements = indexArrayLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    //INDEX BUFFER TRIS
    // Setup tris index buffer object.
    var iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArrayTris, gl.STATIC_DRAW);
    iboTris.numberOfElements = indexArrayTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Clear framebuffer and render primitives.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // RENDER TRIS
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.drawElements(gl.TRIANGLES, iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);

    // RENDER LINES
    gl.disableVertexAttribArray(colAttrib);
    gl.vertexAttrib3f(colAttrib, 0, 0, 0); //Linienfarbe
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.drawElements(gl.LINES, iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
}

/**
 * 
 * @param {*} n         Anzahl Unterteilungen u-Ebene
 * @param {*} m         Anzahl Unterteilungen auf v-Ebene
 * @param {*} x_func    Funktion zur Berechnung der x-Werte
 * @param {*} y_func    Funktion zur Berechnung der y-Werte
 * @param {*} z_func    Funktion zur Berechnung der z-Werte
 * @param {*} u_Min     Minimaler Wert des Parameters u, dient als Startwert des äußeren Loops
 * @param {*} u_Max     Maximaler Wert des Parameters u, zur Berechnung, der Schrittweite du
 * @param {*} v_Min     Minimaler Wert des Parameters v, dient als Startwert des inneren Loops 
 * @param {*} v_Max     Maximaler Wert des Parameters v, zur Berechnung, der Schrittweite dv
 * @param {*} xNorm     Funktion zur Berechnung der x-Komponente der Normalen
 * @param {*} yNorm     Funktion zur Berechnung der y-Komponente der Normalen
 * @param {*} zNorm     Funktion zur Berechnung der z-Komponente der Normalen

 * @returns 
 */
function createVertexData(n, m, x_func, y_func, z_func, u_Min, u_Max, v_Min, v_Max, xNorm, yNorm, zNorm) {
    // Vertex Array (Positionen der Vertices)
    var vertices = new Float32Array(3 * (n + 1) * (m + 1));
    // Index data (Reihenfolge der Vertices)
    var indicesLines = new Uint16Array(2 * 2 * n * m); //für Lines 
    var indicesTris = new Uint16Array(3 * 2 * n * m); // Für Triangles

    //Normale der Vertices
    var normals = new Float32Array(3 * (n + 1) * (m + 1));

    var du = u_Max / n; //Schrittweite auf u-Ebene  
    var dv = v_Max / m; //Schrittweite auf v-Ebene

    // Counter for entries in index arrays.
    var curIndexInIBO = 0;
    var curIndexInTriIBO = 0;

    // Loop u Ebene. Bei jedem Loop wird ein Schritt auf der u-Ebene gegangen. 
    for (var currentU = 0, u = u_Min; currentU <= n; currentU++, u += du) {

        // Loop v  Ebene. Bei jedem Durchgang wird ein Schritt auf der v-Ebene gegangen. 
        for (var currentV = 0, v = v_Min; currentV <= m; currentV++, v += dv) {

            //Counter für die Vertice, die wir gerade berechnen. 
            var curVertice = currentU * (m + 1) + currentV;
            var x = x_func(u, v)
            var z = z_func(u, v)
            var y = y_func(u, v)

            //VERTEX ARRAY
            // X, Y und Z für aktuellen Vertex speichern.
            vertices[curVertice * 3] = x; //Jeder 3. eintrag ist die X position.
            vertices[curVertice * 3 + 1] = y; //Jeder 4. eintrag ist die Y position.
            vertices[curVertice * 3 + 2] = z; //Jeder 5. eintrag ist die Z position.

            //NORMALS ARRAY
            // Calc and set normals.
            normals[curVertice * 3] = xNorm(x, y, z)
            normals[curVertice * 3 + 1] = yNorm(x, y, z)
            normals[curVertice * 3 + 2] = zNorm(x, y, z)

            // INDEX ARRAY
            /* 
                Linie von der vorherigen Vertice auf u Ebene zur aktuellen Vertice berechnen und in Index Array speichern.
                Linie von prevOnHorizontal -> curVertice)
            */
            if (currentV > 0 && currentU > 0) {
                var prevOnU = curVertice - 1;
                indicesLines[curIndexInIBO++] = prevOnU;
                indicesLines[curIndexInIBO++] = curVertice;

            }

            /* 
            Linie von der vorherigen Vertice auf v Ebene zur aktuellen Vertice berechnen und in Index Array speichern.
            Linie von prevVertOnVertical -> curVertice)

            */
            if (currentV > 0 && currentU > 0) {
                var prevOnV = curVertice - (m + 1);
                indicesLines[curIndexInIBO++] = prevOnV
                indicesLines[curIndexInIBO++] = curVertice;

            }

            // Berechnen der Triangles

            if (currentV > 0 && currentU > 0) {
                indicesTris[curIndexInTriIBO++] = curVertice;
                indicesTris[curIndexInTriIBO++] = curVertice - 1;
                indicesTris[curIndexInTriIBO++] = curVertice - (m + 1);
                //        
                indicesTris[curIndexInTriIBO++] = curVertice - 1;
                indicesTris[curIndexInTriIBO++] = curVertice - (m + 1) - 1;
                indicesTris[curIndexInTriIBO++] = curVertice - (m + 1);
            }


        }
    }
    return [vertices, indicesLines, indicesTris, normals]
}





