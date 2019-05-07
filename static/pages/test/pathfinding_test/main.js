$(document).ready(async () => {
    mapsDB = new MapDB()
    await mapsDB.create()

    pack = {}
    pack.size = 0
    pack.level = []

    const dtOptions = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }

    class Cell {
        constructor(id, x, z) {
            this.id = id
            this.x = x
            this.z = z
            this.height = 5
            this.type = 'dirt'
        }
    }

    async function loadMap(dataPack) {
        let data = dataPack.mapData
        if (data != null) {
            Net.gameInit(dataPack._id)
            return data
        }
    }

    function DisplayLoad(list) {
        let overlay = $('#overlay')
        let popup = $('#dialog').html('')

        if (overlay.css('display') == 'none')
            overlay.removeAttr('style')


        let saveTable = $('<table id="save-table">')
        let svtScroll = $('<div>').addClass('saves-cont').append(saveTable)
        let svtCont = $('<div>').addClass('saves-wrap').append('<table><tr><th onclick="sortTable(\'save-table\', 0)">Name</th><th onclick="sortTable(\'save-table\', 1)">Date</th></tr></table>').append(svtScroll)
        popup.append(svtCont)

        let nor = list.length
        if (nor < 9) nor = 9

        let rowlist = []

        for (let i = 0; i < nor; i++) {
            let row = $('<tr>').addClass('saves-row')
            rowlist.push(row)

            let cell0 = $('<td>').html('')
            if (list[i] !== undefined)
                cell0.html(list[i].mapName)
            row.append(cell0)

            let cell1 = $('<td>').html('')
            if (list[i] !== undefined)
                cell1.html(new Intl.DateTimeFormat('en-GB', dtOptions).format(list[i].modDate).replace(',', ''))
            row.append(cell1)

            saveTable.append(row)
            row.click(() => {
                if (cell0.html() != '') {
                    name.val(cell0.html())
                    rowlist.forEach(elem => {
                        elem.removeClass('saves-active')
                    })
                    row.addClass('saves-active')

                    $('#bLoad').attr('disabled', false).removeClass('disabled')
                }

            })
        }

        let name = $('<input>').attr('type', 'hidden')
        popup.append(name)

        popup.dialog({
            closeOnEscape: false,
            modal: true,
            draggable: false,
            resizable: false,
            dialogClass: 'no-close  buttonpane-double',
            width: 600,
            height: 540,
            title: 'Load',
            buttons: [{
                    id: 'bLoad',
                    disabled: true,
                    text: 'Load',
                    'class': 'ui-dialog-button disabled',
                    click: async function () {
                        startGame(await loadMap(await mapsDB.importMap(name.val())))
                        $(this).dialog('close')
                        overlay.css('display', 'none')
                    }
                },
                {
                    text: 'Back',
                    'class': 'ui-dialog-button',
                    click: function () {
                        $(this).dialog('close')
                        overlay.css('display', 'none')
                    }
                }
            ]
        })
    }

    let mapList = await mapsDB.getMaps()
    DisplayLoad(mapList)
})

async function startGame(map) {
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
    var test_LoadedMap = map

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
    
    for(object in grid.map){
        console.log(grid.map[object].type);
        
        if(grid.map[object].type == "dirt"){
            selectedUnitPoint.x = grid.map[object].x
            selectedUnitPoint.z = grid.map[object].z
            selectedUnitPoint.height = grid.map[object].height
            break
        }
    }
    console.log(selectedUnitPoint);
    

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
                testmodel.mesh.position.set(gridMatrix[selectedUnitPoint.z][selectedUnitPoint.x].position.x, gridMatrix[selectedUnitPoint.z][selectedUnitPoint.x].position.y, gridMatrix[selectedUnitPoint.z][selectedUnitPoint.x].position.z)
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

}