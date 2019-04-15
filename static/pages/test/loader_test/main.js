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

    //dump in future
    var test_LoadedMap = {
        "size": "4",
        "level": [{
            "id": 0,
            "x": 0,
            "z": 0,
            "type": "dirt",
            "height": 5
        }, {
            "id": 1,
            "x": 1,
            "z": 0,
            "type": "dirt",
            "height": 5
        }, {
            "id": 2,
            "x": 2,
            "z": 0,
            "type": "dirt",
            "height": 5
        }, {
            "id": 3,
            "x": 3,
            "z": 0,
            "type": "rock",
            "height": 5
        }, {
            "id": 4,
            "x": 0,
            "z": 1,
            "type": "dirt",
            "height": 5
        }, {
            "id": 5,
            "x": 1,
            "z": 1,
            "type": "rock",
            "height": 5
        }, {
            "id": 6,
            "x": 2,
            "z": 1,
            "type": "dirt",
            "height": 5
        }, {
            "id": 7,
            "x": 3,
            "z": 1,
            "type": "dirt",
            "height": 5
        }, {
            "id": 8,
            "x": 0,
            "z": 2,
            "type": "dirt",
            "height": 5
        }, {
            "id": 9,
            "x": 1,
            "z": 2,
            "type": "rock",
            "height": 5
        }, {
            "id": 10,
            "x": 2,
            "z": 2,
            "type": "dirt",
            "height": 5
        }, {
            "id": 11,
            "x": 3,
            "z": 2,
            "type": "rock",
            "height": 5
        }, {
            "id": 12,
            "x": 0,
            "z": 3,
            "type": "dirt",
            "height": 5
        }, {
            "id": 13,
            "x": 1,
            "z": 3,
            "type": "rock",
            "height": 5
        }, {
            "id": 14,
            "x": 2,
            "z": 3,
            "type": "dirt",
            "height": 5
        }, {
            "id": 15,
            "x": 3,
            "z": 3,
            "type": "dirt",
            "height": 5
        }]
    }
    //enddump in future

    var raycaster = new THREE.Raycaster(); 
    var finishPoint = null
    var movePath = null
    var selectedUnitPoint = {
        x: 0,
        z: 0,
        height: "?"
    }
    var mouseVector = new THREE.Vector2()

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
    camera.position.set(500, 500, 500)
    camera.lookAt(scene.position)
    // #endregion initial

    let grid = new Grid(test_LoadedMap.size, test_LoadedMap.level, true)
    grid.addTo(scene)

    var gridMatrix = grid.matrix

    var rayClick = () => {
        mouseVector.x = (event.clientX / $(window).width()) * 2 - 1;
        mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);
        let objects = scene.children
        var intersects = raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
            let clickedPosition = intersects[0].object
            //console.log(clickedPosition.userData);

            if (clickedPosition.userData.name == "floor" && clickedPosition.userData.type != "rock") {
                finishPoint = {
                    x: clickedPosition.userData.x,
                    z: clickedPosition.userData.z
                }
                //clickedPosition.material.color.set(0xff0000)
                Net.sendClickedPoint(finishPoint, selectedUnitPoint).then(function (result) {                    
                    Pathfinder.moveTiles(result, gridMatrix, selectedUnitPoint, testmodel)
                    console.log(selectedUnitPoint);
                    
                })
            }
        }
    }

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
                testmodel.mesh.position.set(gridMatrix[0][0].position.x, gridMatrix[0][0].position.y, gridMatrix[0][0].position.z)
            } else {
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
    $("#root").on("click", rayClick)
    function render() {

        if (testmodel) testmodel.animate()

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render()

})