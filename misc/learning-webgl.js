/*  == ALLGEMEINES == */
//Vertex = Eckpunkt/Node. Hat Attribute, z.B. eine Position aus X, Y und Z Koordinaten.
//Diese Koordinaten werden in einem Vektor (methematisches Konstrukt) gespeichert.
// Hier werden 4 Vertices definiert, die jeweils eine X und eine Y-Koordinate haben. In diesem Fall ergeben ein Rechteck mit den Vertices (1,1) (-1,1), (1, -1), (-1,-1) nachdem wir unten definiert haben wie die Vertices zu verbinden sind.
var vertices = new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]); //Die Geometrie ist ein Rechteck im Bereich (-1,-1) bis (+1,+1) in x- und y-Richtung, die z-Komponente ist 0. . 


/* == RENDERING PIPELINE == */
//Die Rendering Pipeline arbeitet zuerst mit Vertex-Kooridnaten und wendet darauf Vertex Shader an.
//Dann transformiert sie die Vertices zu Raster-Pixelgrafik, die Fragments genannt wird. Darauf werden Fragment Shader angewendet.

/* == SET UP == */
const canvas = document.getElementById('canvas1'); //DOM-Element auf dem gerendet wird.
const gl = canvas.getContext('experimental-webgl'); //Schnittstelle zu WebGL. Auf dem gl Objekt wird alles aufgerufen.

gl.clearColor(0, 1, 0, 1); //Setze Hintergrund Farbe der ganzen Canvas


/* == VERTEX SHADER ERSTELLEN UND KOMPILIEREN == */
/* 
   attribute vec2 pos;
    void main(){
        gl_Position = vec4(pos * 0.5, 0, 1);
    }
*/

/* Dem Shader wird die Position des Vertex als zweidimensionaler (x, y) Vektor vom Datentyp vec2 übergeben und in der Attribut-Variablen pos gespeichert. Dies wird mittels des Keywords attribute angezeigt.
main = Funktion, die der Einstiegspunkt für das Programm ist.
Output des Shaders: neu berechnete Position (=transformierte x und y Koordinaten) des übergebenen Vertex. Über Spezialvariable gl_Position (vierdimensional vec4(x,y,z,w)) zurückgegeben. (Woebei hier nur die x und y Werte relevant sind, da es 2D Grafik ist)
 */

var vsSourceCode = 'attribute vec2 pos;' +
    'void main(){gl_Position = vec4(pos * 0.5, 0, 1); }'; //GLSL Code: Skaliere Geometrie auf halbe Größe.

var vertexShader = gl.createShader(gl.VERTEX_SHADER); //Istanziere den Shader. Parameter gibt an ob es sich um einen Fragment- oder Vertex Shader handelt. 
gl.shaderSource(vertexShader, vsSourceCode); // Gib den Shader seinen Sourcecode
gl.compileShader(vertexShader); // Shader zu Binary compilieren, so dass es im program verwendet werden kann

/* == FRAGMENT SHADER ERSTELLEN UND KOMPILIEREN == */
var fsSouceCode = 'void main() { gl_FragColor = vec4(1,1,0,1); }'; // GLSL Code: Setzt alle Fragments der Geometrie auf eine Farbe(RGBA; erlaubte Werte 1 oder 0)
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSouceCode);
gl.compileShader(fragmentShader);

/* == PROGRAMM ERSTELLEN == */
//Erstelle ein Programm, das auf dem GPU läuft
var program = gl.createProgram(); //Programm besteht immer aus einem Vertex und einem Fragment Shader
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program); //Das Programm-Objekt wird zu einem ausführbaren GPU-Programm (Executable) gebunden
gl.useProgram(program); //Ab jetzt wird alles mit den oben genannten Shadern gerendert

/* == DATEN IN BUFFER LADEN == */
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); //alle folgenden Befehle auf gl beziehen sich auf diesen Buffer.
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); //dem Buffer die Vertex Daten geben. 
// Die Option STATIC_DRAW dient der Optimierung, sie zeigt an, dass die Daten nur einmal spezifiziert werden, also unverändert bleiben und in der Anwendung häufig genutzt werden.

/* == PROGRAMM MIT DATEN VERBINDEN == */
var posAttrib = gl.getAttribLocation(program, 'pos'); //Das Attribut pos aus unserem geschriebenen Vertex Shader als js Variable
gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0); // Mittels vertexAttribPointer wird das Datenformat für das Attribut pos über die Referenz posAttrib festgelegt und mit dem derzeit gebundenen buffer verknüpft

//Definiere den Datentyp des Attributs: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
/*
    posAttrib = Referent auf das Attribut, dass durch das Programm modifiziert werden soll. In diesem Fall die Position eines Vertex. 
    2 = Die Dimensionen des Attributs (x und y)
    gl.Float = Datatyp der Elemente im Array Floating Point
    false = nicht normalisiert
    0 = Bytes zwischen Attributen
    0 = Offset des ersten Attributes vom Anfang des Arrays
*/

gl.enableVertexAttribArray(posAttrib); //Attribut aktivieren


gl.clear(gl.COLOR_BUFFER_BIT); //Color-Frame Buffer soll auf Hintergrundfarbe zurückgesetzt werden.

/* == RENDERN STARTEN == */
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
/*
    gl.TRIANGLE_STRIP = Vertices sollen als Eckpunkte von Dreiecken mit dem ersten Vertex als gemeinsamen Eckpunkt interpretiert werden
    0 = Beginne mit erstem Frame im Buffer
    4= Verarbeite 4 Vertices insgesamt
*/

/* PRIMITVEN / MODES */
/* 
POINTS: 
LINES: 
LINE_STRIP
LINE_LOOP
TRIANGLES
TRIANGLE_STRIP
TRIANGLE_FAN

*/



/*
RENDERING PROCESS
Mit dem Befehl drawArrays beginnt der Rendering-Prozess.
Die Vertices werden in die Pipeline "gepumpt".
Sie gelangen zuerst als Attribut pos in den Vertex-Shader und durchlaufen dort das geladene Vertex-Shader-Programm.
Von dort aus geht es weiter ins Primitive Assembly, wo aus den Vertices Dreiecke gebaut werden.
Die Dreiecke werden in der Rasterisierung wieder "gehäckselt". Die resultierenden Fragments kommen in den Fragment-Shader mit dem dort geladenen Programm, das einfärbt.
Über die Per-Fragment Operations landen diese als (bunte) Pixel schließlich im Framebuffer. Der Framebuffer gibt es wieder an die API aus, damit das Bildangezigt werden kann.
*/
