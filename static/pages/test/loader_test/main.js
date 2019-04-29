

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

    let grid = new Plane(500, 0x000000, true)
    grid.addTo(scene)

    var orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControl.addEventListener('change', function () {
        renderer.render(scene, camera)
    });

    var light = new THREE.AmbientLight(0xffffff, 2, 1000); // ambient light bc gltf textures always require light
    scene.add(light)

    var testmodel = null;

    //      !!! model select
    var currentModel = null
    let models = await Net.getModels()
    console.log(models);
    let container = document.createElement("div")
    container.id = "modelSelector"
    container.style.position = "absolute"
    container.style.top = "0"
    container.style.right = "0"
    document.body.appendChild(container)
    models.forEach(model => {
        var button = $("<div>")
        button.text(model.name)
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
                e.target.style.color = "blue"
                currentModel = e.target.innerText

                if (testmodel) scene.remove(testmodel.mesh)
                // adding model
                testmodel = new Model(`/static/res/models/${model.path}`, model.name)
                await testmodel.load()
                testmodel.addTo(scene)
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

    function render() {

        if (testmodel) testmodel.animate()

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render()

})