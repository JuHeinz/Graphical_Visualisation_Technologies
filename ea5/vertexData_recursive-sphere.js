var recursivesphere = (function () {

    function createVertexData() {
        // Normals.
        this.normals = new Float32Array();
        var normals = this.normals;
        // Index data.
        this.indicesLines = new Uint16Array();
        var indicesLines = this.indicesLines;

        //VERTICES
        //Create 12 Vertices of an icosahedron
        var t = (1.0 + Math.sqrt(5)) / 2.0;

        var tempVertArray = [];

        tempVertArray.push(-1, t, 0); //Vertex 0
        tempVertArray.push(1, t, 0);
        tempVertArray.push(-1, -t, 0);
        tempVertArray.push(1, -t, 0);
        tempVertArray.push(0, -1, t);
        tempVertArray.push(0, 1, t);
        tempVertArray.push(0, -1, -t);
        tempVertArray.push(0, 1, -t);
        tempVertArray.push(t, 0, -1);
        tempVertArray.push(t, 0, 1);
        tempVertArray.push(-t, 0, -1);
        tempVertArray.push(-t, 0, 1); //Vertex 12
        this.vertices = new Float32Array(tempVertArray);
        var vertices = this.vertices;

        //TRI INDEX
        // create 20 triangles of the icosahedron

        var tempTriArray = [];
        tempTriArray.push(0, 11, 5)
        tempTriArray.push(0, 5, 1)
        tempTriArray.push(0, 1, 7)
        tempTriArray.push(0, 7, 10)
        tempTriArray.push(0, 10, 11)
        tempTriArray.push(1, 5, 9)
        tempTriArray.push(5, 11, 4)
        tempTriArray.push(11, 10, 2)
        tempTriArray.push(10, 7, 6)
        tempTriArray.push(7, 1, 8)
        tempTriArray.push(3, 9, 4)
        tempTriArray.push(3, 4, 2)
        tempTriArray.push(3, 2, 6)
        tempTriArray.push(3, 6, 8)
        tempTriArray.push(3, 8, 9)
        tempTriArray.push(4, 9, 5)
        tempTriArray.push(2, 4, 11)
        tempTriArray.push(6, 2, 10)
        tempTriArray.push(8, 6, 7)
        tempTriArray.push(9, 8, 1)

        this.indicesTris = new Uint16Array(tempTriArray);
        var indicesTris = this.indicesTris;

        //TODO: Indexes Lines

        //REFINE TRIANGLES

    }

    return {
        createVertexData: createVertexData
    }

}());
