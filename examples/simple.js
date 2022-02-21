/**
 * Adapted from the default demo from threejs-slice-geometry.
 *
 * @date 2022-02-11
 */

(function () {
  window.addEventListener("load", function () {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    camera.position.z = 5;
    camera.position.y = -3;

    renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    var controls = new THREE.TrackballControls(camera, renderer.domElement);

    var scene = new THREE.Scene();

    var light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(20, 30, 40);
    scene.add(light);

    var light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);

    var material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0x0088ff,
      wireframe: true
    });

    var PlaneHelper = function (plane) {
      var geom = new THREE.PlaneGeometry(5, 5, 50, 50);
      var material = new THREE.MeshBasicMaterial({
        color: "#333",
        side: THREE.DoubleSide,
        wireframe: true
      });
      var obj = new THREE.Mesh(geom, material);
      obj.lookAt(plane.normal);
      obj.translateOnAxis(new THREE.Vector3(1, 0, 0).cross(plane.normal).normalize(), plane.constant * -1);
      return obj;
    };

    var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    var planeHelper = new PlaneHelper(plane);
    scene.add(planeHelper);

    var m = new THREE.Matrix4();
    var m1 = new THREE.Matrix4().makeRotationY(Math.PI / 3);
    var m2 = new THREE.Matrix4().makeRotationX(Math.PI / 3);
    m.multiplyMatrices(m1, m2);

    var geom = makeBox(0.8, 0.8, 0.8);
    geom.applyMatrix(m);

    geom = sliceGeometry(geom, plane);

    bgeom = geom.toBufferGeometry();
    scene.add(new THREE.Mesh(bgeom, material));

    function render() {
      renderer.render(scene, camera);
    }

    function animate() {
      render();
      controls.update();
      requestAnimationFrame(animate);
    }

    function onWindowResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    controls.addEventListener("change", function () {
      render();
    });

    window.addEventListener("resize", onWindowResize, false);
    animate();
  });
})();
