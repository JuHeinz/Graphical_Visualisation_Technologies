const canvas2 = document.getElementById('canvas2'); //DOM-Element auf dem gerendet wird.
const gl2 = canvas2.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.

var vertices2 = new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]);
gl2.clearColor(0, 1, 1, 1); //Setze Hintergrund Farbe der ganzen Canvas
gl2.clear(gl.COLOR_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.

var vsSourceCode2 = 'attribute vec2 pos;' +
    'void main(){gl_Position = vec4(pos * 0.5, 0, 1); }';

var vertexShader2 = gl2.createShader(gl.VERTEX_SHADER);
gl2.shaderSource(vertexShader2, vsSourceCode2);
gl2.compileShader(vertexShader2);

/* == FRAGMENT SHADER ERSTELLEN UND KOMPILIEREN == */
var fragmentShader2 = gl2.createShader(gl.FRAGMENT_SHADER);
gl2.shaderSource(fragmentShader2, 'void main() { gl_FragColor = vec4(0.23,1,0,1); }');
gl2.compileShader(fragmentShader2);

/* == PROGRAMM ERSTELLEN == */
var program2 = gl2.createProgram();
gl2.attachShader(program2, vertexShader2);
gl2.attachShader(program2, fragmentShader2);
gl2.linkProgram(program2);
gl2.useProgram(program2);

/* == DATEN IN BUFFER LADEN == */
var vertexBuffer2 = gl2.createBuffer();
gl2.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2);
gl2.bufferData(gl.ARRAY_BUFFER, vertices2, gl.STATIC_DRAW);

/* == PROGRAMM MIT DATEN VERBINDEN == */
var posAttrib2 = gl2.getAttribLocation(program2, 'pos');
gl2.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
gl2.enableVertexAttribArray(posAttrib2);

/* == RENDERN STARTEN == */
gl2.drawArrays(gl2.LINE_LOOP, 0, 4);