var recursivesphere = (function () {
    const tempVertArray = [];
    let triIndTemp = [];
    function createVertexData() {

        //VERTICES
        //Create 12 Vertices of an icosahedron
        var t = (1.0 + Math.sqrt(5)) / 2.0;
        console.log(t)

        tempVertArray.push([-1, t, 0]); //Vertex 0
        tempVertArray.push([1, t, 0]);
        tempVertArray.push([-1, -t, 0]);
        tempVertArray.push([1, -t, 0]);
        tempVertArray.push([0, -1, t]);
        tempVertArray.push([0, 1, t]);
        tempVertArray.push([0, -1, -t]);
        tempVertArray.push([0, 1, -t]);
        tempVertArray.push([t, 0, -1]);
        tempVertArray.push([t, 0, 1]);
        tempVertArray.push([-t, 0, -1]);
        tempVertArray.push([-t, 0, 1]); //Vertex 11

        //TRI INDEX
        // create 20 triangles of the icosahedron

        triIndTemp.push([0, 11, 5])
        triIndTemp.push([0, 5, 1])
        triIndTemp.push([0, 1, 7])
        triIndTemp.push([0, 7, 10])
        triIndTemp.push([0, 10, 11])
        triIndTemp.push([1, 5, 9])
        triIndTemp.push([5, 11, 4])
        triIndTemp.push([11, 10, 2])
        triIndTemp.push([10, 7, 6])
        triIndTemp.push([7, 1, 8])
        triIndTemp.push([3, 9, 4])
        triIndTemp.push([3, 4, 2])
        triIndTemp.push([3, 2, 6])
        triIndTemp.push([3, 6, 8])
        triIndTemp.push([3, 8, 9])
        triIndTemp.push([4, 9, 5])
        triIndTemp.push([2, 4, 11])
        triIndTemp.push([6, 2, 10])
        triIndTemp.push([8, 6, 7])
        triIndTemp.push([9, 8, 1])


        //REFINE TRIANGLES
        console.log(tempVertArray[0])

        let trinIndNew = []
        for (tri of triIndTemp) {

            //Replace Triangle with 4 triangles
            //a = Mittelpunkt zwischen Vertex 0 und Vertex 1
            let a = getMiddlePoint(tri[0], tri[1]);

            //b = Mittelpunkt zwischen Vertex 1 und Vertex 2
            let b = getMiddlePoint(tri[1], tri[2]);

            //c = Mittelpunkt zwischen Vertex 2 und Vertex 0
            let c = getMiddlePoint(tri[2], tri[0]);

            //Neue Dreiecke mit den errechneten Mittelpunkten bilden:
            trinIndNew.push([tri[0], a, c])
            trinIndNew.push([tri[1], b, a])
            trinIndNew.push([tri[2], c, b])
            trinIndNew.push([a, b, c])
        }

        triIndTemp = trinIndNew;



        this.indicesTris = new Uint16Array(triIndTemp.flat());
        this.vertices = new Float32Array(tempVertArray.flat());

        // LINE INDICES
        const tempLineArray = [];
        for (let tri of triIndTemp) {
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

            this.normals[i * 3] = nx;
            this.normals[i * 3 + 1] = ny;
            this.normals[i * 3 + 2] = nz;
        }

    }
    let index = 0;

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
        //console.log("Berechne Middlepoint ", key)

        if (middlePointCashe.has(key)) {
            //console.log("Middlepoint schon berechnet")
            //console.log(key)
            //Return index of existing middle point
            return middlePointCashe.get(key);
        }

        //Mittelpunkt noch nicht im Cache, also berechnen:
        //Hole die tatsächlichen x, y, z Koordinaten für den gegeben Index
        let vertex1 = tempVertArray[p1];
        let vertex2 = tempVertArray[p2];

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

        //Return index of created middle point
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

        let genormterMiddlePoint = [];
        genormterMiddlePoint[0] = (x / length);
        genormterMiddlePoint[1] = (y / length);
        genormterMiddlePoint[2] = (z / length);

        tempVertArray.push(genormterMiddlePoint)
        return index++;
    }


    return {
        createVertexData: createVertexData
    }

}());
