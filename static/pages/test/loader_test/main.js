$(document).ready(async function () {

    // #region initial
    $(window).on("resize", () => {
        camera.aspect = $(window).width() / $(window).height()
        camera.updateProjectionMatrix()
        renderer.setSize($(window).width(), $(window).height())
    })

    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    //wg THREE.js dla GLTF potrzeba physicallyCorrectLights: true, gammaOutput = true, gammaFactor = 2.2 w rendererze 
    renderer.setClearColor(0xffffff);
    renderer.setSize($(window).width(), $(window).height());
    $("#root").append(renderer.domElement);

    var camera = new THREE.PerspectiveCamera(
        45, // kąt patrzenia kamery (FOV - field of view)
        $(window).width() / $(window).height(), // proporcje widoku, powinny odpowiadać proporjom naszego ekranu przeglądarki
        0.1, // minimalna renderowana odległość
        10000000 // maxymalna renderowana odległość od kamery 
    );
    camera.position.set(50, 50, 50)
    camera.lookAt(scene.position)
    // #endregion initial

    let grid = new Grid(500, 0x000000, true)
    grid.addTo(scene)

    var orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControl.addEventListener('change', function () {
        renderer.render(scene, camera)
    });

    var light = new THREE.AmbientLight(0xffffff, 2, 1000); // ambient light bc gltf textures always require light
    scene.add(light)

    //      !!! model ----------------
    let path = window.prompt("specify path to file (in /models/ directory)", Cookies.get("model_test-model_path"))
    var testmodel = new Model(`/static/res/models/${path}`, "testmodel")
    await testmodel.load()
    Cookies.set("model_test-model_path", path, 30)
    testmodel.addTo(scene)

    testmodel.createButtons()

    //      !!! model ----------------

    function render() {

        testmodel.animate()

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render()

})