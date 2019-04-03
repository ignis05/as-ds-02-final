$(document).ready(async function () {

    // #region initial
    $(window).on("resize", () => {
        camera.aspect = $(window).width() / $(window).height()
        camera.updateProjectionMatrix()
        renderer.setSize($(window).width(), $(window).height())
    })

    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setSize($(window).width(), $(window).height());
    $("#root").append(renderer.domElement);

    var camera = new THREE.PerspectiveCamera(
        45,    // kąt patrzenia kamery (FOV - field of view)
        $(window).width() / $(window).height(),   // proporcje widoku, powinny odpowiadać proporjom naszego ekranu przeglądarki
        0.1,    // minimalna renderowana odległość
        10000000    // maxymalna renderowana odległość od kamery 
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

    var light = new THREE.AmbientLight(0xffffff, 1, 1000); // ambient light bc gltf textures always require light
    scene.add(light)

    //      !!! model ----------------

    // var testmodel = new ModelGLTF("/static/models/sphere_bot/scene.gltf", "robot")
    var testmodel = new ModelFBX("/static/models/laser_gun/Laser_Gun_Tower-(FBX 7.4 binary mit Animation).fbx")
    await testmodel.load()
    testmodel.addTo(scene)

    testmodel.createButtons()

    //      !!! model ----------------

    function render() {

        testmodel.animate()

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    } render()

})