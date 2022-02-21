var makeBox = function (sizeX, sizeY, sizeZ) {
    var geometry = new TGH.Gmetry();
  
    var sizeX_half = sizeX / 2.0;
    var sizeY_half = sizeY / 2.0;
    var sizeZ_half = sizeZ / 2.0;
  
    geometry.vertices.push(new THREE.Vector3(-sizeX_half, -sizeY_half, -sizeZ_half));
    geometry.vertices.push(new THREE.Vector3(-sizeX_half, sizeY_half, -sizeZ_half));
    geometry.vertices.push(new THREE.Vector3(sizeX_half, sizeY_half, -sizeZ_half));
    geometry.vertices.push(new THREE.Vector3(sizeX_half, -sizeY_half, -sizeZ_half));
  
    geometry.vertices.push(new THREE.Vector3(-sizeX_half, -sizeY_half, sizeZ_half));
    geometry.vertices.push(new THREE.Vector3(-sizeX_half, sizeY_half, sizeZ_half));
    geometry.vertices.push(new THREE.Vector3(sizeX_half, sizeY_half, sizeZ_half));
    geometry.vertices.push(new THREE.Vector3(sizeX_half, -sizeY_half, sizeZ_half));
  
    // All face triangles a in left winding order
    geometry.faces.push(new TGH.Face3(0, 1, 3)); // bottom
    geometry.faces.push(new TGH.Face3(3, 1, 2));
  
    geometry.faces.push(new TGH.Face3(4, 7, 5)); // top
    geometry.faces.push(new TGH.Face3(5, 7, 6));
  
    geometry.faces.push(new TGH.Face3(1, 4, 5)); // left
    geometry.faces.push(new TGH.Face3(0, 1, 4));
  
    geometry.faces.push(new TGH.Face3(2, 7, 3)); // right
    geometry.faces.push(new TGH.Face3(2, 6, 7));
  
    geometry.faces.push(new TGH.Face3(0, 3, 4)); // fromt
    geometry.faces.push(new TGH.Face3(7, 4, 3));
  
    geometry.faces.push(new TGH.Face3(2, 1, 5));
    geometry.faces.push(new TGH.Face3(2, 5, 6));
  
    // for( var i = 0; i < geometry.vertices.length; i++ ) {
    //     geometry.morphTargets.push( geometry.vertices[i].clone() );
    // }
  
    return geometry;
  };
  