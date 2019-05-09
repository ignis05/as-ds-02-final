class Game {
    constructor(domElement) {
        var scene = new THREE.Scene();
        this.scene = scene

        var renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer = renderer

        renderer.setClearColor(0xffffff);
        renderer.setSize($(window).width(), $(window).height());
        $(domElement).append(renderer.domElement);

        var camera = new THREE.PerspectiveCamera(
            45, // kąt patrzenia kamery (FOV - field of view)
            $(window).width() / $(window).height(), // proporcje widoku, powinny odpowiadać proporjom naszego ekranu przeglądarki
            0.1, // minimalna renderowana odległość
            10000000 // maxymalna renderowana odległość od kamery 
        );
        this.camera = camera
        camera.position.set(500, 500, 500)
        camera.lookAt(scene.position)

        $(window).on("resize", () => {
            camera.aspect = $(window).width() / $(window).height()
            camera.updateProjectionMatrix()
            renderer.setSize($(window).width(), $(window).height())
        })

        function render() {
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render()
    }
    // #region test functions
    addTestCube(size) {
        var geometry = new THREE.BoxGeometry(size, size, size);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
    }
    addAxexHelper(size) {
        var axesHelper = new THREE.AxesHelper(size);
        this.scene.add(axesHelper);
    }
    addAmbientLight() {
        var light = new THREE.AmbientLight(0xffffff, 2, 1000); // ambient light bc gltf textures always require light
        this.scene.add(light)
    }
    enableOrbitContols() {
        var orbitControl = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        orbitControl.addEventListener('change', () => {
            this.renderer.render(this.scene, this.camera)
        });
    }
    // #endregion test functions
}
