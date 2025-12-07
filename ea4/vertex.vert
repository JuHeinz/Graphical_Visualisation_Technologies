attribute vec3 aPosition; //// Vertex-Position (x,y,z - Koordinaten).
attribute vec3 aNormal; //Normale Die Normalen für das Vertex. Hier unabhängig von der Model-View Marix. Nur auf die Geometrie der Vertices bezogen.

uniform mat4 uPMatrix; // Camera Projection: Wurde in JS berechnet aus dem Projection-Type sowie Werten der Near- und Far-Clipping Planes.	
uniform mat4 uMVMatrix; // Model-View Matrix: Wurde in JS berechnet aus Model-Matrix (Translation, Rotation, Scale) und View Matrix (Atribute der Camera, u.a. eye).
uniform mat3 uNMatrix; // Normals in Relation zur Model-ViewMatrix (also z.B. zur Kamera-Position). Wurd ein JS von gl-Matrix aus der MV-Matrix berechnet.         

//uniform vec4 uColor; //Einheitliche Farbe für jedes Vertex. Wurde in JS als z.B. [1,0,0,1] (rot) festgelegt.
varying vec4 vColor; // Wird in Vertex Shader berechnet und an Fragment Shader weitergegeben

/* == LIGHTS == */
uniform vec3 ambientLight; // Ambient light.

const int MAX_LIGHT_SOURCES = 8;
struct LightSource { //Define struct for point lights
    bool isOn;
    vec3 position;
    vec3 color;
};

uniform LightSource light[MAX_LIGHT_SOURCES]; //Array of Type LightSource

/* == MATERIAL ==*/
struct PhongMaterial {
    vec3 ka;
    vec3 kd;
    vec3 ks;
    float ke;
};

uniform PhongMaterial material;

/* PHONG CALCULATION: Für eine Lichtquelle, ohne Ambient Light. */
vec3 phong(vec3 p, vec3 n, vec3 v, LightSource l) {
    return vec3(0.0);
}

/* PHONG-Calculation: Errechnet Beleuchtung der Oberfläche an der Position p. Mit mehreren Lichtquellen und Ambient Light. 
    p = Vektor zum Oberflächenpunkt
    n = Oberflächennormale
    v = View Vektor
*/
vec3 phong(vec3 p, vec3 n, vec3 v) {
                // Calculate ambient light.
    vec3 result = material.ka * ambientLight;

                // Add light from all light sources.
    for(int j = 0; j < MAX_LIGHT_SOURCES; j++) {
        if(light[j].isOn) { //Wenn das licht an, füge es zur Gesamt-Beleuchtung hinzu. 
            result += phong(p, n, v, light[j]);
        }
    }
    return result; //ein rgb Vektor.
}

void main() {
    //Vertex Positionen zu eye-Koordinaten mit der ModelView Matrix transformieren.
    vec4 tPosition = uMVMatrix * vec4(aPosition, 1.0);

    // gl_Position anhand der Projection-Matrix und und den eye-Koordinaten berechnen. Haupt-Aufgabe jedes Vertex-Shaders.
    gl_Position = uPMatrix * tPosition;

    // Bestimmen der korrekt gedrehte Normale tNormal aus aNormal mittels der Normal-Matrix uNMatrix.
	// So stimmen die Normals auch, wenn man das Modell dreht.
    vec3 tNormal = normalize(uNMatrix * aNormal);// normalize = Vektor länge 1 geben.

    /* BESTIMMUNG DER FARBE FÜR DEN FRAGMENT SHADER */
    vec3 v = normalize(-tPosition.xyz); //Eye Koordinaten normalisieren und vierte Dimension fallen lassen. 

    //Farbe berechnen
    vColor = vec4(phong(tPosition.xyz, tNormal, v), 1.0);

}
