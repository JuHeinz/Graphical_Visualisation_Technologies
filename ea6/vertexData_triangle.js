var triangle = (function () {
    const tempVertArray = [];
    let triangleIndexArray = [];
    function createVertexData() {

        //VERTICES
        //Create 3 Vertices of a triangle
        var t = (1.0 + Math.sqrt(5)) / 2.0;

        tempVertArray.push([-1, 1.6, 0]); //Vertex 0
        tempVertArray.push([1, 1.6, 0]);
        tempVertArray.push([-1, -1.6, 0]);


        //TRI INDEX
        // create 20 triangles of the icosahedron

        triangleIndexArray.push([0, 1, 2])


        //REFINE TRIANGLES

        let triIndNew = []
        for (tri of triangleIndexArray) {

            //Replace Triangle with 4 triangles
            //a = Mittelpunkt zwischen Vertex 0 und Vertex 1
            let a = getMiddlePoint(tri[0], tri[1]);
            console.log("Mittelpunkt zwischen", tri[0], tri[1], "ist", a)

            //b = Mittelpunkt zwischen Vertex 1 und Vertex 2
            let b = getMiddlePoint(tri[1], tri[2]);
            console.log("Mittelpunkt zwischen", tri[1], tri[2], "ist", b)

            //c = Mittelpunkt zwischen Vertex 2 und Vertex 0
            let c = getMiddlePoint(tri[2], tri[0]);
            console.log("Mittelpunkt zwischen", tri[2], tri[0], "ist", c)

            //Neue Dreiecke mit den errechneten Mittelpunkten bilden:
            triIndNew.push([tri[0], a, c])
            triIndNew.push([tri[1], b, a])
            triIndNew.push([tri[2], c, b])
            triIndNew.push([a, b, c])
        }

        triangleIndexArray = triIndNew;
        console.log("Triangle index new:")
        console.dir(triangleIndexArray)

        console.log("Vertices new:")
        console.dir(tempVertArray)

        this.indicesTris = new Uint16Array(triangleIndexArray.flat());
        this.vertices = new Float32Array(tempVertArray.flat());

        // LINE INDICES
        const tempLineArray = [];
        for (let tri of triangleIndexArray) {
            tempLineArray.push(tri[0], tri[1]);
            tempLineArray.push(tri[1], tri[2]);
            tempLineArray.push(tri[2], tri[0]);
        }
        this.indicesLines = new Uint16Array(tempLineArray);


        //NORMALS BERECHNEN
        this.normals = new Float32Array(this.vertices.length);
        for (let i = 0; i < tempVertArray.length; i++) {
            const v = tempVertArray[i];
            const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            const nx = v[0] / len;
            const ny = v[1] / len;
            const nz = v[2] / len;

            this.normals[i * 3] = 1;
            this.normals[i * 3 + 1] = 1;
            this.normals[i * 3 + 2] = 1;
        }

    }

    let middlePointCashe = new Map();
    /**
     * Calculate mid point between two points.
     * @param {} p1 Index of point 1
     * @param {*} p2 Index of point 2
     */

    function getMiddlePoint(p1, p2) {
        // Check if middle point already created / in cache
        let firstIsSmaller = p1 < p2;
        let smallerIndex = firstIsSmaller ? p1 : p2;
        let greaterIndex = firstIsSmaller ? p2 : p1;
        const key = `${smallerIndex},${greaterIndex}`; //Create a key that shows for which two points we want to create the middle point. 


        if (middlePointCashe.has(key)) {
            console.log("Middlepoint schon berechnet")
            console.log(key)
            //Return index of existing middle point
            return middlePointCashe.get(key);
        }


        //Mittelpunkt noch nicht im Cache, also berechnen:
        //Hole die tatsächlichen x, y, z Koordinaten für den gegeben Index
        let vertex1 = tempVertArray[p1];
        let vertex2 = tempVertArray[p2];
        console.log("====")
        console.log("Berechne Middlepoint zwischen #" + p1 + "(" + vertex1 + ")" + " und #" + p2 + "(" + vertex2 + ")" + " (" + key + ")")

        let x1 = vertex1[0];
        let y1 = vertex1[1];
        let z1 = vertex1[2];

        let x2 = vertex2[0];
        let y2 = vertex2[1];
        let z2 = vertex2[2];


        //Create a vertex that is the middle point between the two given points 
        let middlePoint = [];
        middlePoint[0] = ((x1 + x2) / 2.0);
        middlePoint[1] = ((y1 + y2) / 2.0);
        middlePoint[2] = ((z1 + z2) / 2.0);

        let indexOfMiddlePoint = addVertex(middlePoint)
        middlePointCashe.set(key, indexOfMiddlePoint)
        console.log("Middlepoint is: (", middlePoint, ") with Index:" + indexOfMiddlePoint)

        //Return index of created middle point
        //TODO: Dieser Index muss sich auf den Index in 
        return indexOfMiddlePoint
    }

    /**
     * add vertex to mesh, fix position to be on unit sphere, return index
     * @param {*} middlePoint 
     * @returns 
     */

    function addVertex(middlePoint) {
        let x = middlePoint[0];
        let y = middlePoint[1];
        let z = middlePoint[2];
        let length = Math.sqrt(x * x + y * y + z * z);
        console.log("length:", length)

        let genormterMiddlePoint = [];
        genormterMiddlePoint[0] = (x / length);
        genormterMiddlePoint[1] = (y / length);
        genormterMiddlePoint[2] = (z / length);
        console.log("genormter Middle Point:" + genormterMiddlePoint)
        tempVertArray.push(middlePoint)
        return tempVertArray.indexOf(middlePoint)
    }


    return {
        createVertexData: createVertexData
    }

}());
