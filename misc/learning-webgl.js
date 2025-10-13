//Vertex = ???


const canvas = document.getElementById('canvas');
const gl = canvas.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.
gl.clearColor(0, 1, 0, 1); //Setze Hintergrund Farbe der ganzen Canvas


//VERTEX SHADER ERSTELLEN UND KOMPILIEREN
/* 
   attribute vec2 pos;
    void main(){
        gl_Position = vec4(pos * 0.5, 0, 1);
    }
*/

/* Dem Shader wird die Position des Vertex als zweidimensionaler Vektor vom Datentyp vec2 übergeben und in der Attribut-Variablen pos gespeichert. Dies wird mittels des Keywords attribute angezeigt.
main = Funktion, die der Einstiegspunkt für das Programm ist.
Output des Shaders: neu berechnete Position des übergebenen Vertex mit Transformationen und Projektion. Über Spezialvariable gl_Position (vierdimensional vec4(x,y,z,w)) zurückgegeben. */

var vsSourceCode = 'attribute vec2 pos;' +
    'void main(){gl_Position = vec4(pos * 0.5, 0, 1); }'; //GLSL Code: Skaliere Geometrie auf halbe Größe.


var vertexShader = gl.createShader(gl.VERTEX_SHADER); //Parameter gibt an ob es sich um einen Fragment- oder Vertex Shader handelt. 
gl.shaderSource(vertexShader, vsSourceCode);
gl.compileShader(vertexShader); // compiles a GLSL shader into binary data so that it can be used by a WebGLProgram.

// FRAGMENT SHADER ERSTELLEN UND KOMPILIEREN
var fsSouceCode = 'void main() { gl_FragColor = vec4(1,1,0,1); }'; // GLSL Code: Setzt alle Fragments der Geometrie auf eine Farbe(RGBA; erlaubte Werte 1 oder 0)
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSouceCode);
gl.compileShader(fragmentShader);

// PROGRAMM ERSTELLEN
var program = gl.createProgram(); //Programm besteht immer aus einem Vertex und einem Fragment Shader
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program); //Das Programm-Objekt wird mit linkProgram zu einem ausführbaren GPU-Programm (Executable) gebunden
gl.useProgram(program); //Ab jetzt wird alles mit den oben genannten Shadern gerendert

// DATEN IN BUFFER LADEN
var vertices = new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]); //Die Geometrie ist ein Rechteck im Bereich (-1,-1) bis (+1,+1) in x- und y-Richtung, die z-Komponente ist 0. Es sind vier zweidimensionale Vertexes. 
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); //alle folgenden Befehle auf gl beziehen sich auf diesen Buffer.
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); //dem Buffer die Vertex daten geben. Die Option STATIC_DRAW dient der Optimierung, sie zeigt an, dass die Daten nur einmal spezifiziert werden, also unverändert bleiben und in der Anwendung häufig genutzt werden.

// PROGRAMM MIT DATEN VERBINDEN
var posAttrib = gl.getAttribLocation(program, 'pos'); //Das Attribut pos aus unserem geschriebenen Vertex Shader 
gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0); // Mittels vertexAttribPointer wird das Datenformat für das Attribut pos über die Referenz posAttrib festgelegt und mit dem derzeit gebundenen buffer verknüpft

//Definiere den Datentyp des Attributs: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
/*
    posAttrib = Referent auf das Attribut, dass durch das Programm modifiziert werden soll
    2 = Die Dimensionen des Attributs
    gl.Float = Datatyp der Elemente im Array Floating Point
    false = nicht normalisiert
    0 = Bytes zwischen Attributen
    0 = Offset des ersten Attributes vom Anfang des Arrays
*/

gl.enableVertexAttribArray(posAttrib);



// Clear framebuffer and render primitives
gl.clear(gl.COLOR_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);



// __________________
//TODO: Frage: Wie muss man vorgehen, wenn in einer Szene mehrere Modelle mit unterschiedlichen Oberflächeneigenschaften, also mit verschiedenen Shadern, vorkommen sollen?
//  Jeweils vor dem Rendern eines Modells muss das passende GPU-Programm aus den gewünschten Shadern zusammengestellt und mit useProgramm aktiviert werden.
//  Dabei kann das Zusammenstellen der GPU-Programme, das Kompilieren und Linken der Shader, einmalig zu Beginn der Anwendung erfolgen.


//Zweites Programm erstellen
var vsSourceCode2 = 'attribute vec2 pos;' +
    'void main(){gl_Position = vec4(pos * 0.2, 0, 1); }';

var vertexShader2 = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader2, vsSourceCode2);
gl.compileShader(vertexShader2);
var fsSouceCode2 = 'void main() { gl_FragColor = vec4(1,0,0,1); }';
var fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader2, fsSouceCode2);
gl.compileShader(fragmentShader2);
var program2 = gl.createProgram();
gl.attachShader(program2, vertexShader2);
gl.attachShader(program2, fragmentShader2);
gl.linkProgram(program2);
gl.useProgram(program2); //Ab jetzt wird alles mit den oben genannten Shadern gerendert






