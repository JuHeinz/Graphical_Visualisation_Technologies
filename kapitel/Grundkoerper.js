

var canvas1 = document.getElementById('canvas1');
var canvas2 = document.getElementById('canvas2');
var canvas3 = document.getElementById('canvas3');
var canvas4 = document.getElementById('canvas4');

var r = 0.3

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


var [vertexArray1, indicesLines1, indicesTris1] = createVertexData(32, 4, x_Zylinder, y_Zylinder, z_Zylinder, 0, 2 * Math.PI, 0, 1);

/* KEGEL */
/*
    Mantel eines Kegels von der Seite.
    Mehrere Kreise, die übereinander liegen. 
    u-Ebene = Winkel im Kreis
    v-Ebene = Höhe
    Der Radius der Kreise ist abhängig von der Höhe v.
*/

function x_Kegel(u, v) {
    return v * Math.cos(u)
}

function y_Kegel(u, v) {
    return v * Math.sin(u);
}

function z_Kegel(u, v) {
    return -v
}
var [vertexArray2, indicesLines2, indicesTris2] = createVertexData(32, 4, x_Kegel, z_Kegel, y_Kegel, 0, 2 * Math.PI, 0, 1);


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

var [vertexArray3, indicesLines3, indicesTris3] = createVertexData(10, 10, x_Kugel, z_Kugel, y_Kugel, 0, 2 * Math.PI, 0, Math.PI);


/* TORUS */

/*
    Besteht aus zwei Kreisen, die Senkrecht zueinander stehen.    
    Es gibt einen äußeren Kreis mit (kleinerem) Radius r -> Der Donut-Teig: Oben die Glasur unten der Boden.
    und einen inneren Kreis mit einem größeren Radius R -> Das Donut Loch.
    
    u = Winkel auf äußerem Kreis. Von Glasur bis Boden. 
    v = Winkel auf dem inneren Kreis. (Donutloch)
*/

var R = r + 0.2; // Innerer Radius muss größer sein als äußerer Radius. 

function x_Torus(u, v) {
    return (R + r * Math.cos(u)) * Math.cos(v);
}

function y_Torus(u, v) {
    return (R + r * Math.cos(u)) * Math.sin(v);
}

function z_Torus(u, v) {
    return r * Math.sin(u);
}

var [vertexArray4, indicesLines4, indicesTris4] = createVertexData(32, 32, x_Torus, y_Torus, z_Torus, 0, 2 * Math.PI, 0, 2 * Math.PI);


setup(canvas1, vertexArray1, indicesLines1, indicesTris1)
setup(canvas2, vertexArray2, indicesLines2, indicesTris2)
setup(canvas3, vertexArray3, indicesLines3, indicesTris3)
setup(canvas4, vertexArray4, indicesLines4, indicesTris4)

function setup(canvas, vertexArray, indexArrayLines, indexArrayTris) {
    var gl = canvas.getContext('experimental-webgl');

    // Pipeline setup.
    gl.clearColor(.95, .95, .95, 1);
    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Compile vertex shader. 
    var vsSource = '' +
        'attribute vec3 pos;' +
        'attribute vec4 col;' +
        'varying vec4 color;' +
        'void main(){' + 'color = col;' +
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


    // Setup position vertex buffer object.
    var vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    // Bind vertex buffer to attribute variable.
    var posAttrib = gl.getAttribLocation(prog, 'pos');
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    // Setup constant color.
    var colAttrib = gl.getAttribLocation(prog, 'col');
    gl.vertexAttrib4f(colAttrib, 1, 0, 1, 1);

    // Setup index buffer object for lines
    var iboLines = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArrayLines, gl.STATIC_DRAW);
    iboLines.numberOfElements = indexArrayLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Setup tris index buffer object.
    var iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArrayTris, gl.STATIC_DRAW);
    iboTris.numberOfElements = indexArrayTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Clear framebuffer and render primitives.
    gl.clear(gl.COLOR_BUFFER_BIT);


    // Setup rendering tris.
    gl.vertexAttrib4f(colAttrib, 0, 1, 1, 1); //Füllfarbe
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.drawElements(gl.TRIANGLES,
        iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);

    // Setup rendering lines.
    gl.vertexAttrib4f(colAttrib, 1, 0, 1, 1); //Linienfarbe
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
 * @returns 
 */
function createVertexData(n, m, x_func, y_func, z_func, u_Min, u_Max, v_Min, v_Max) {
    // Vertex Array (Positionen der Vertices)
    var vertices = new Float32Array(3 * (n + 1) * (m + 1));
    // Index data (Reihenfolge der Vertices)
    var indicesLines = new Uint16Array(2 * 2 * n * m); //für Lines 
    var indicesTris = new Uint16Array(3 * 2 * n * m); // Für Triangles

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
    return [vertices, indicesLines, indicesTris]
}





