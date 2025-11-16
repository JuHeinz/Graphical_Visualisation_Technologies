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
