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


    renderer.setClearColor(0x00CFFF)
    renderer.setSize($(window).width(), $(window).height());
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;

    $("#root").append(renderer.domElement);

    var camera = new THREE.PerspectiveCamera(
        45, // kąt patrzenia kamery (FOV - field of view)
        $(window).width() / $(window).height(), // proporcje widoku, powinny odpowiadać proporjom naszego ekranu przeglądarki
        0.1, // minimalna renderowana odległość
        10000000 // maxymalna renderowana odległość od kamery 
    );
    camera.position.set(1400, 500, 0)
    camera.lookAt(scene.position)
    // #endregion initial

    // empty map
    let mapData = { "size": "8", "level": [{ "id": "0", "x": "0", "z": "0", "type": "dirt", "height": "1" }, { "id": "1", "x": "1", "z": "0", "type": "dirt", "height": "1" }, { "id": "2", "x": "2", "z": "0", "type": "dirt", "height": "1" }, { "id": "3", "x": "3", "z": "0", "type": "dirt", "height": "1" }, { "id": "4", "x": "4", "z": "0", "type": "dirt", "height": "1" }, { "id": "5", "x": "5", "z": "0", "type": "dirt", "height": "1" }, { "id": "6", "x": "6", "z": "0", "type": "dirt", "height": "1" }, { "id": "8", "x": "0", "z": "1", "type": "dirt", "height": "1" }, { "id": "9", "x": "1", "z": "1", "type": "dirt", "height": "1" }, { "id": "10", "x": "2", "z": "1", "type": "dirt", "height": "1" }, { "id": "11", "x": "3", "z": "1", "type": "dirt", "height": "1" }, { "id": "12", "x": "4", "z": "1", "type": "dirt", "height": "1" }, { "id": "13", "x": "5", "z": "1", "type": "dirt", "height": "1" }, { "id": "14", "x": "6", "z": "1", "type": "dirt", "height": "1" }, { "id": "16", "x": "0", "z": "2", "type": "dirt", "height": "1" }, { "id": "17", "x": "1", "z": "2", "type": "dirt", "height": "1" }, { "id": "18", "x": "2", "z": "2", "type": "dirt", "height": "1" }, { "id": "19", "x": "3", "z": "2", "type": "dirt", "height": "1" }, { "id": "20", "x": "4", "z": "2", "type": "dirt", "height": "1" }, { "id": "21", "x": "5", "z": "2", "type": "dirt", "height": "1" }, { "id": "22", "x": "6", "z": "2", "type": "dirt", "height": "1" }, { "id": "24", "x": "0", "z": "3", "type": "dirt", "height": "1" }, { "id": "25", "x": "1", "z": "3", "type": "dirt", "height": "1" }, { "id": "26", "x": "2", "z": "3", "type": "dirt", "height": "1" }, { "id": "27", "x": "3", "z": "3", "type": "dirt", "height": "1" }, { "id": "28", "x": "4", "z": "3", "type": "dirt", "height": "1" }, { "id": "29", "x": "5", "z": "3", "type": "dirt", "height": "1" }, { "id": "30", "x": "6", "z": "3", "type": "dirt", "height": "1" }, { "id": "32", "x": "0", "z": "4", "type": "dirt", "height": "1" }, { "id": "33", "x": "1", "z": "4", "type": "dirt", "height": "1" }, { "id": "34", "x": "2", "z": "4", "type": "dirt", "height": "1" }, { "id": "35", "x": "3", "z": "4", "type": "dirt", "height": "1" }, { "id": "36", "x": "4", "z": "4", "type": "dirt", "height": "1" }, { "id": "37", "x": "5", "z": "4", "type": "dirt", "height": "1" }, { "id": "38", "x": "6", "z": "4", "type": "dirt", "height": "1" }, { "id": "40", "x": "0", "z": "5", "type": "dirt", "height": "1" }, { "id": "41", "x": "1", "z": "5", "type": "dirt", "height": "1" }, { "id": "42", "x": "2", "z": "5", "type": "dirt", "height": "1" }, { "id": "43", "x": "3", "z": "5", "type": "dirt", "height": "1" }, { "id": "44", "x": "4", "z": "5", "type": "dirt", "height": "1" }, { "id": "45", "x": "5", "z": "5", "type": "dirt", "height": "1" }, { "id": "46", "x": "6", "z": "5", "type": "dirt", "height": "1" }, { "id": "48", "x": "0", "z": "6", "type": "dirt", "height": "1" }, { "id": "49", "x": "1", "z": "6", "type": "dirt", "height": "1" }, { "id": "50", "x": "2", "z": "6", "type": "dirt", "height": "1" }, { "id": "51", "x": "3", "z": "6", "type": "dirt", "height": "1" }, { "id": "52", "x": "4", "z": "6", "type": "dirt", "height": "1" }, { "id": "53", "x": "5", "z": "6", "type": "dirt", "height": "1" }, { "id": "54", "x": "6", "z": "6", "type": "dirt", "height": "1" }] }


    let map = new MapDisplay(mapData)
    map.renderMap(scene)

    let centerData = map.level.find(tile => tile.x == 3 && tile.z == 3)
    var center = map.group.children.find(tile => tile.tileID == centerData.id)

    var orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControl.addEventListener('change', function () {
        renderer.render(scene, camera)
    });
    orbitControl.target = center.position.clone()
    orbitControl.update()

    // #region light
    var light = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(light);
    // position light above middle of the scene and aim it directly down
    light.position.set(center.position.x, 1000, center.position.z)
    light.target = new THREE.Object3D
    scene.add(light.target)
    light.target.position.set(light.position.x, 0, light.position.z)

    // enable shadows and set up quality 
    light.castShadow = true
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    // set up shadow-rendering zone
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 1000;
    light.shadow.camera.left = 500
    light.shadow.camera.right = -500
    light.shadow.camera.top = 500
    light.shadow.camera.bottom = -500
    // helper thast visualizes shadow-rendering zone
    /* var helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(helper); */
    // #endregion light

    var testmodel = null;

    //      !!! model select
    var currentModel = null
    let models = await Net.getModels()
    console.log(models);
    let container = document.createElement("div")
    container.id = "modelSelector"
    container.style.position = "absolute"
    container.style.top = "50px"
    container.style.right = "0"
    document.body.appendChild(container)
    models.forEach(model => {
        model.files.forEach(path => {
            var button = $("<div>")
            if (model.files.length == 1) button.text(model.name)
            else button.text(`${model.name}/${path.split("/")[path.split("/").length - 1]}`)
            button.addClass(`modelSelectButton`)
            button.css(`background`, `#000000cc`)
            button.css(`padding`, `3px`)
            button.css(`color`, `white`)
            button.css(`width`, `auto`)
            button.css(`display`, `flex`)
            button.css(`align-items`, `center`)
            button.css(`justify-content`, `center`)
            button.css(`margin`, `2px`)
            button.click(async e => {
                if (currentModel != e.target.innerText) {
                    $(".modelSelectButton").css("color", "white")
                    e.target.style.color = "red"
                    currentModel = e.target.innerText

                    if (testmodel) scene.remove(testmodel.mesh)
                    // adding model
                    testmodel = new Model(`/static/res/models/${path}`, model.name)
                    await testmodel.load()
                    testmodel.addTo(scene)
                    testmodel.mesh.position.copy(center.position.clone())
                    // enable shadows
                    testmodel.mesh.castShadow = true
                    testmodel.mesh.traverse(node => {
                        if (node instanceof THREE.Mesh) node.castShadow = true
                    })
                    testmodel.createButtons()
                }
                else {
                    $(".modelSelectButton").css("color", "white")
                    currentModel = null
                    // removing model
                    $("#animationDisplayButtonsContainer").remove()
                    if (testmodel) scene.remove(testmodel.mesh)
                    testmodel = null
                }
            })
            $(container).append(button)
        })
    })

    $("#screenshot_mode").click(() => {
        $(document.body.childNodes).css('display', 'none')
        $('#root').css('display', 'initial')
        renderer.setClearColor(0x00ff00)
        scene.remove(map.group)
        scene.remove(light)
        var AMBlight = new THREE.AmbientLight(0xffffff); // soft white light
        scene.add(AMBlight);
        $(document).on("keydown", () => {
            $(document).off("keydown")
            $(document.body.childNodes).css('display', 'initial')
            scene.add(map.group)
            scene.add(light)
            scene.remove(AMBlight);
            renderer.setClearColor(0x00CFFF)
        })
    })

    function render() {
        if (testmodel) testmodel.animate()

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render()

})