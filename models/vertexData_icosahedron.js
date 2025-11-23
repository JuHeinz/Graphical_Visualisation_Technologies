var icosahedron = (function () {
    const tempVertArray = [];
    function createVertexData() {
        //VERTICES
        //Create 12 Vertices of an icosahedron
        var t = (1.0 + Math.sqrt(2)) / 2.0;
        let triIndTemp = [];

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



        //Add triangles to mesh

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



    return {
        createVertexData: createVertexData
    }

}());
