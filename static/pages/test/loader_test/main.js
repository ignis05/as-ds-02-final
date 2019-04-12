$(document).ready(async function () {

    // #region initial
    $(window).on("resize", () => {
        camera.aspect = $(window).width() / $(window).height()
        camera.updateProjectionMatrix()
        renderer.setSize($(window).width(), $(window).height())
    })

    var test_LoadedMap = {
        "size": "4",
        "level": [{
            "id": 0,
            "x": 0,
            "z": 0,
            "type": "dirt",
            "height": 7
        }, {
            "id": 1,
            "x": 0,
            "z": 1,
            "type": "rock",
            "height": "7"
        }, {
            "id": 2,
            "x": 0,
            "z": 2,
            "type": "dirt",
            "height": 5
        }, {
            "id": 3,
            "x": 0,
            "z": 3,
            "type": "dirt",
            "height": 7
        }, {
            "id": 4,
            "x": 1,
            "z": 0,
            "type": "dirt",
            "height": 5
        }, {
            "id": 5,
            "x": 1,
            "z": 1,
            "type": "dirt",
            "height": "5"
        }, {
            "id": 6,
            "x": 1,
            "z": 2,
            "type": "dirt",
            "height": 5
        }, {
            "id": 7,
            "x": 1,
            "z": 3,
            "type": "dirt",
            "height": 5
        }, {
            "id": 8,
            "x": 2,
            "z": 0,
            "type": "dirt",
            "height": 5
        }, {
            "id": 9,
            "x": 2,
            "z": 1,
            "type": "rock",
            "height": "5"
        }, {
            "id": 10,
            "x": 2,
            "z": 2,
            "type": "dirt",
            "height": 5
        }, {
            "id": 11,
            "x": 2,
            "z": 3,
            "type": "dirt",
            "height": 5
        }, {
            "id": 12,
            "x": 3,
            "z": 0,
            "type": "dirt",
            "height": 5
        }, {
            "id": 13,
            "x": 3,
            "z": 1,
            "type": "rock",
            "height": "5"
        }, {
            "id": 14,
            "x": 3,
            "z": 2,
            "type": "rock",
            "height": "5"
        }, {
            "id": 15,
            "x": 3,
            "z": 3,
            "type": "rock",
            "height": "5"
        }]
    }
    var scene = new THREE.Scene()
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    })

    var raycaster = new THREE.Raycaster(); // obiekt symulujący "rzucanie" promieni
    var finishPoint = null
    var movePath = null
    var selectedUnitPoint = {
        x: 0,
        z: 0
    } //TO DO
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
    camera.position.set(50, 50, 50)
    camera.lookAt(scene.position)
    // #endregion initial

    var rayClick = () => {
        mouseVector.x = (event.clientX / $(window).width()) * 2 - 1;
        mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);
        let objects = scene.children
        var intersects = raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
            let clickedPosition = intersects[0].object
            console.log(clickedPosition.userData);

            if (clickedPosition.userData.name == "floor" && clickedPosition.userData.type != "rock") {
                finishPoint = {
                    x: clickedPosition.userData.x,
                    z: clickedPosition.userData.z
                }
                //clickedPosition.material.color.set(0xff0000)
                Net.sendClickedPoint(finishPoint, selectedUnitPoint).then(function (result) {
                    movePath = result
                    let move = 0
                    let moveInterval = setInterval(() => {
                        gridMatrix[movePath[move][1]][movePath[move][0]].material.color.set(0xff0000)
                        move++
                        if (move > movePath.length - 1) {
                            window.clearInterval(moveInterval)
                            selectedUnitPoint.z = movePath[movePath.length - 1][1]
                            selectedUnitPoint.x = movePath[movePath.length - 1][0]
                            setTimeout(() => {
                                for (let move in movePath) {
                                    gridMatrix[movePath[move][1]][movePath[move][0]].material.color.set(Settings.dirtTileColor)
                                }
                            }, 1000)
                        }
                    }, 500)

                    console.log("Your units path is: " + movePath)
                })
            }
        }
    }

    document.onclick = rayClick


    let grid = new Grid(test_LoadedMap.size, test_LoadedMap.level, true)
    grid.addTo(scene)

    let gridMatrix = grid.matrix

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