
// X, Y and Z calculations for the shapes

//Pillow
function x_Pillow(u, v) {
    return Math.cos(u);
}

function z_Pillow(u, v) {
    return Math.cos(v);
}

function y_Pillow(u, v) {
    return 0.5 * Math.sin(u) * Math.sin(v)
}

//Horn
function x_Horn(u, v) {
    return (1 + u * Math.cos(v)) * Math.sin(Math.PI * u)
}

function y_Horn(u, v) {
    return (1 + u * Math.cos(v)) * Math.cos(Math.PI * u) + u;
}

function z_Horn(u, v) {
    return u * Math.sin(v)
}

//Own
function x_Own(u, v) {
    return Math.cos(u);
}

function y_Own(u, v) {
    return Math.cos(v);
}

function z_Own(u, v) {
    return Math.sin(v);
}

var canvas1 = document.getElementById('canvas1');
var canvas2 = document.getElementById('canvas2');
var canvas3 = document.getElementById('canvas3');

// Arrays berechnen
var [vertexArray1, indexArray1, triArray1] = createVertexData(10, 10, x_Pillow, y_Pillow, z_Pillow, Math.PI, (2 * Math.PI));
var [vertexArray2, indexArray2, triArray2] = createVertexData(10, 5, x_Horn, y_Horn, z_Horn, 1, (2 * Math.PI));
var [vertexArray3, indexArray3, triArray3] = createVertexData(40, 2, x_Own, y_Own, z_Own, (2 * Math.PI), (2 * Math.PI));

// scale vertex arrays to range [-1, +1]
vertexArray1 = scaleVertices(vertexArray1);
vertexArray2 = scaleVertices(vertexArray2);
vertexArray3 = scaleVertices(vertexArray3);


setup(canvas1, vertexArray1, indexArray1, triArray1,)
setup(canvas2, vertexArray2, indexArray2, triArray2)
setup(canvas3, vertexArray3, indexArray3, triArray3)

function setup(canvas, vertexArray, indexArray, triArray) {
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
    gl.vertexAttrib4f(colAttrib, 0, 0, 1, 1);

    // Setup index buffer object for lines
    var iboLines = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
    iboLines.numberOfElements = indexArray.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Setup tris index buffer object.
    var iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triArray, gl.STATIC_DRAW);
    iboTris.numberOfElements = triArray.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Clear framebuffer and render primitives.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Setup rendering tris.
    gl.vertexAttrib4f(colAttrib, 0, 1, 1, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.drawElements(gl.TRIANGLES,
        iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);

    // Setup rendering lines.
    gl.vertexAttrib4f(colAttrib, 0, 0, 1, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.drawElements(gl.LINES,
        iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
}


function createVertexData(vert, hor, x_func, y_func, z_func, wertebereich_u, wertebereich_v) {
    var horizLines = vert;
    var vert_lines = hor;
    // Positions.
    vertices = new Float32Array(3 * (horizLines + 1) * (vert_lines + 1));
    // Index data
    indices = new Uint16Array(2 * 2 * horizLines * vert_lines);
    indicesTris = new Uint16Array(3 * 2 * horizLines * vert_lines);


    var du = wertebereich_u / horizLines; //Schrittweite auf horizontaler Ebene  
    var dv = wertebereich_v / vert_lines; //Schrittweite auf vertikaler Ebene 

    // Counter for entries in index array.
    var curIndexInIBO = 0;
    var curIndexInTriIBO = 0;

    // Loop Horizontale Ebene. Bei jedem Loop wird ein Schritt auf der horizontalen Ebene gegangen. 
    for (var curHorizontal = 0, u = 0; curHorizontal <= horizLines; curHorizontal++, u += du) {

        // Loop Vertikaler Ebene. Bei jedem Durchgang wird ein Schritt auf der vertikalen Ebene gegangen. 
        for (var curVertical = 0, v = 0; curVertical <= vert_lines; curVertical++, v += dv) {

            //Counter für die Vertice, die wir gerade berechnen. 
            var curVertice = curHorizontal * (vert_lines + 1) + curVertical;
            var x = x_func(u, v)
            var z = z_func(u, v)
            var y = y_func(u, v)

            //VERTEX ARRAY
            // X, Y und Z für aktuellen Vertex speichern.
            vertices[curVertice * 3] = x; //Jeder 3. eintrag ist die X position.
            vertices[curVertice * 3 + 1] = y; //Jeder 4. eintrag ist die Y position.
            vertices[curVertice * 3 + 2] = z; //Jeder 5. eintrag ist die Z position.
            console.log("_____")
            console.log("#", curVertice, "|(" + x + "|" + y + ")")

            // INDEX ARRAY

            /* Abschnitt auf Horizontale
             Linie zwischen der aktuellen Vertice und dem Vertice auf der gleichen Horizontale aber andere Vertikale
            */
            if (curVertical > 0 && curHorizontal > 0) {
                var prevOnHorizontal = curVertice - 1;
                indices[curIndexInIBO++] = prevOnHorizontal;

                indices[curIndexInIBO++] = curVertice;
                console.log(prevOnHorizontal + "->" + curVertice)

            }

            /* Abschnitt auf Vertikale
                Linie zwischen der aktuellen Vertice zur Vertice auf dem gleichen Vertikale, aber  andere Horizontale 
            */
            if (curVertical > 0 && curHorizontal > 0) {
                var prevVertOnVertical = curVertice - (vert_lines + 1);
                indices[curIndexInIBO++] = prevVertOnVertical
                indices[curIndexInIBO++] = curVertice;
                console.log(prevVertOnVertical + "->" + curVertice)

            }

            // Berechnen der Triangles

            if (curVertical > 0 && curHorizontal > 0) {
                indicesTris[curIndexInTriIBO++] = curVertice;
                indicesTris[curIndexInTriIBO++] = curVertice - 1;
                indicesTris[curIndexInTriIBO++] = curVertice - (vert_lines + 1);
                //        
                indicesTris[curIndexInTriIBO++] = curVertice - 1;
                indicesTris[curIndexInTriIBO++] = curVertice - (vert_lines + 1) - 1;
                indicesTris[curIndexInTriIBO++] = curVertice - (vert_lines + 1);
            }
        }
    }
    return [vertices, indices, indicesTris]
}

/**
 * Vertices auf skalieren, damit sie in -1 bis +1 passen.
 */
function scaleVertices(vertices) {
    if (!vertices || vertices.length === 0) return vertices;
    // vertices kann Float32Array oder reguläres Array sein
    const src = (vertices instanceof Float32Array) ? vertices : new Float32Array(vertices);

    // Bestimme das maximale absolute Element (über alle x,y,z)
    let maxAbs = 0.0;
    for (let i = 0; i < src.length; i++) {
        const a = Math.abs(src[i]);
        if (a > maxAbs) maxAbs = a;
    }

    // Wenn alle Werte 0 sind, nichts tun
    if (maxAbs === 0) return new Float32Array(src);

    const inv = 1.0 / maxAbs;
    const dst = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) {
        dst[i] = src[i] * inv;
    }
    return dst;
}



