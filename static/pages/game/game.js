const dtOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
}

// will be heavly integrated with socket.js so i suggest keeping it as local file instead of global class

// ======================================================================= //
//  Debug will be moved (mostly intact) to a global class at a later date  //     Yeah... NO
// ======================================================================= //

class Game {
    constructor(domElement) {
        var scene = new THREE.Scene()
        this.scene = scene

        this.models = {} // all models meshes will be loaded here when game is started
        this.modelsLoaded = false

        this.unitsInPlay = []
        this.unitsSpawned = []
        this.selectedUnit = null
        this.selectedTile = null

        let aaOn = Cookies.get('settings-aaOn') === 'true'
        let resScale = Cookies.get('settings-resScale')
        this.debug_log('Renderer.antialias: ' + aaOn, 0)
        this.debug_log('Renderer.resScale: ' + resScale, 0)

        var renderer = new THREE.WebGLRenderer({
            antialias: aaOn
        })
        this.renderer = renderer
        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;

        renderer.setPixelRatio(resScale) // Resolution scale

        renderer.setClearColor(0x00CFFF)
        renderer.setSize($(window).width(), $(window).height())
        $(domElement).append(renderer.domElement)

        var camera = new THREE.PerspectiveCamera(
            45, // kąt patrzenia kamery (FOV - field of view)
            $(window).width() / $(window).height(), // proporcje widoku, powinny odpowiadać proporjom naszego ekranu przeglądarki
            0.1, // minimalna renderowana odległość
            10000000 // maxymalna renderowana odległość od kamery 
        )
        this.camera = camera
        /* camera.position.set(500, 500, 500)
        camera.lookAt(scene.position) */

        $(window).on("resize", () => {
            camera.aspect = $(window).width() / $(window).height()
            camera.updateProjectionMatrix()
            renderer.setSize($(window).width(), $(window).height())
        })

        var camCtrl = new CameraController(camera)
        this.camCtrl = camCtrl
        scene.add(camCtrl.getAnchor())

        this.debug_log('Renderer.init: Success', 0)

        this.initDebugKeyListener()

        this.initRaycaster_spawns()
        this.initRaycaster_unitSelect()

        this.defeated = false
        this.myTurn = false
        this.spawnTurn = true
        this.unitToSpawn = null // unit that will be spawned on click
        this.avalUnits // units avalible for this player to spawn
        this.avalMoveTab = [] // tab of possible moves
        this.avalMoveTiles = []
        this.myUnits = [] // units belinging to current player
        this.spawnTiles = []
        this.evemyHighlights = []
        socket.getMyself().then(me => {
            this.avalUnits = me.unitsToSpawn
            ui.UpdateSpawnControls()
        })

        function render() {
            camCtrl.update()

            renderer.render(scene, camera)
            requestAnimationFrame(render)
        }
        render()
    }

    // #region test functions
    addTestCube(size) {
        var geometry = new THREE.BoxGeometry(size, size, size)
        var material = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        })
        var cube = new THREE.Mesh(geometry, material)
        this.scene.add(cube)
    }
    addAxesHelper(size) {
        var axesHelper = new THREE.AxesHelper(size)
        this.scene.add(axesHelper)
    }
    enableOrbitContols() {
        var orbitControl = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        orbitControl.addEventListener('change', () => {
            this.renderer.render(this.scene, this.camera)
        })
    }
    // #endregion test functions

    // #region DEBUG FUNCTIONS
    initDebugKeyListener() {
        document.addEventListener('keydown', e => {
            if (e.code == 'Backquote') {
                if ($('#debug-log').css('display') == 'none')
                    this.debug_consoleEnable(true)
                else
                    this.debug_consoleEnable(false)
            }
        })
    }

    debug_cameraEnable(showAnchor, showTriggerZones, disableTriggers) {
        this.camCtrl.debug_showAnchor(showAnchor)
        this.camCtrl.debug_showTriggerZones(showTriggerZones)
        this.camCtrl.debug_disableTriggers(disableTriggers)
    }
    debug_addAmbientLight(brightness) {
        var light = new THREE.AmbientLight(0xffffff, brightness, 100000) // ambient light bc gltf textures always require light
        this.scene.add(light)
        this.debug_log('Game.debug_addAmbientLight: ' + brightness, 1)
    }
    debug_consoleEnable(boolean) {
        if (boolean) $('#debug-log').removeAttr('style')
        else $('#debug-log').css('display', 'none')

        //this.debug_log('Game.consoleEnable: ' + boolean, 1)
    }
    debug_log(string, type) {
        if (type === null || type === undefined) {
            console.error('Bad debug message, no type! [' + string + ']')
            type = 3
        }

        let now = Date.now()
        let msecs = now % 1000 < 100 ? now % 1000 < 10 ? '00' + now % 1000 : '0' + now % 1000 : now % 1000
        let timestamp = '[' + new Intl.DateTimeFormat('en-GB', dtOptions).format(now) + '.' + msecs + ']'

        let logcolor = ''
        let logtype = $('<div>').css('display', 'inline')
        if (type == 0) {
            logtype.html('INF')
            logcolor = '#FFFFFF'
        } else if (type == 1) {
            logtype.html('WRN')
            logcolor = '#FFFF2F'
        } else if (type == 2) {
            logtype.html('ERR')
            logcolor = '#FF2F2F'
        } else {
            logtype.html('BAD')
            logcolor = '#2FFFFF'
        }

        let msg = $('<p>')
            .html('[')
            .append(logtype)
            .append(']' + timestamp + ': ' + string)
            .css('color', logcolor)

        $('#debug-log').append(msg)
        $('#debug-log').scrollTop($('#debug-log')[0].scrollHeight)
    }
    debug_drawFPS(mode) {

        if (mode == 0) {

        } else if (mode == 1) {

        } else if (mode == 2) {

        } else if (mode == 3) {

        }
    }
    // #endregion

    // #region functions
    addSunLight(dsiplayZone, displayTest) { // directional light that simulates the sun
        let blockSize = MASTER_BlockSizeParams.blockSize

        var light = new THREE.DirectionalLight(0xffffff, 1);
        this.scene.add(light);

        // position light above middle of the scene and aim it directly down
        light.position.set(this.map.size * blockSize / 2, 1000, this.map.size * blockSize / 2)
        light.target = new THREE.Object3D
        this.scene.add(light.target)
        light.target.position.set(light.position.x, 0, light.position.z)

        // enable shadows and set up quality 
        light.castShadow = true
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        // set up shadow-rendering zone
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 1000;
        light.shadow.camera.left = this.map.size * blockSize / 2 - blockSize / 2
        light.shadow.camera.right = -this.map.size * blockSize / 2 - blockSize / 2
        light.shadow.camera.top = this.map.size * blockSize / 2 + blockSize / 2
        light.shadow.camera.bottom = -this.map.size * blockSize / 2 + blockSize / 2

        if (dsiplayZone) {
            // helper thast visualizes shadow-rendering zone
            var helper = new THREE.CameraHelper(light.shadow.camera);
            this.scene.add(helper);
        }

        if (displayTest) {
            // sphere to test shadows without models
            var sphereGeometry = new THREE.SphereBufferGeometry(20, 32, 32);
            var sphereMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000
            });
            var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.castShadow = true;
            this.scene.add(sphere);
            sphere.position.set(200, 100, 200)
        }
    }
    activateMyTurn() {
        console.log('My turn')
        if (Object.values(this.avalUnits).some(val => val > 0)) { // if spawning turn
            $("#button-end-turn").attr("disabled", true)
            $('#ui-top-turn-status').html('Spawning turn').css('background-color', '#2F2FCF')
            this.highlightSpawnZones()

            if (help.spawnTurn) DisplaySpawnTurn()
        }
        else { // if normal turn
            if (help.actionTurn) DisplayActionTurn()

            if (this.defeated) {
                moves = []
                socket.endTurn(moves)
                setTimeout(() => ui.UpdateMinimapUnits(), 1000)
                $("#button-end-turn").attr("disabled", true)
                $('#ui-top-turn-status').html('-').css('background-color', '#3F3F3F')
                return
            }
            $("#button-end-turn").attr("disabled", false)
            $('#ui-top-turn-status').html('My turn').css('background-color', '#2FCF2F')
            this.spawnTurn = false
            for (let unit of this.myUnits) {
                unit.canMakeMove = true
                unit.moveIndicator.material.color.set(0x578be0)
            }
        }
    }
    async highlightSpawnZones() {
        this.spawnTiles = []
        let session = await socket.getSession()
        // let me = session.clients.find(client => client.token == token)
        let index = session.clients.findIndex(client => client.token == token)
        for (let tile of this.map.group.children) {

            // unspawnable tiles
            if (!tile.walkable || tile.owner == "neutral") {
                tile.material[2].color.set(0x000000)
            }
            // if own tile
            else if (tile.owner == index) {
                tile.material[2].color.set(0x00ff00)
                this.spawnTiles.push(tile)
            }
            // if everyone can spawn here
            else if (tile.owner == "everyone") {
                this.spawnTiles.push(tile)
            }
            // if enemy tile
            else {
                tile.material[2].color.set(0xff0000)
            }
        }
    }
    clearSpawnZones() {
        for (let tile of this.map.group.children) {
            tile.material[2].color.set(tile.color)
        }
    }
    selectUnitToSpawn(unitName) {
        if (this.avalUnits[unitName] > 0) {
            this.unitToSpawn = unitName
            return true
        }
        return false
    }
    initRaycaster_spawns() {
        var raycaster = new THREE.Raycaster();
        this.raycaster_spawns = raycaster
        this.debug_log(`Raycaster.spawns.initialized`, 0)

        $('#game').click(() => {
            if (!this.unitToSpawn || this.avalUnits[this.unitToSpawn] < 1 || !this.myTurn) return
            console.log('canSpawn');
            var mouseVector = new THREE.Vector2()
            mouseVector.x = (event.clientX / $(window).width()) * 2 - 1
            mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1
            raycaster.setFromCamera(mouseVector, this.camera);

            var intersects = raycaster.intersectObjects(this.spawnTiles, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object
                console.log(obj);
                if (!obj.walkable) return
                let tile = this.map.level.find(tile => tile.id == obj.tileID)
                console.log(tile);
                if (tile && !tile.unit) {
                    this.spawnUnit(tile.id, new Unit(this.unitToSpawn, token), true)
                }
            }
        })
    }
    async selectUnit(intersects) {
        this.selectedUnit = intersects[0].object.parent
        console.log("selu", this.selectedUnit);
        if (this.selectedUnit.owner != token) { // do nothing if someone else's unit
            this.selectedUnit = null
            return
        }
        let tile = this.map.level.find(tile => tile.x == this.selectedUnit.tileData.x && tile.z == this.selectedUnit.tileData.z)
        console.log(tile.unit);
        if (!tile.unit || !tile.unit.canMakeMove) { // unit made move this turn
            this.selectedUnit = null
            return
        }

        tile.unit.moveIndicator.material.color.set(0xffff00)
        $("#ui-top-selected-unit").html(`${tile.unit.name} / ${tile.unit.model.mesh.uuid.slice(-4)}`)
        let attackRange = MASTER_Units[this.selectedUnit.model.name].stats.range
        console.log(attackRange);
        let moveRange = MASTER_Units[this.selectedUnit.model.name].stats.mobility
        console.log(moveRange);
        var tempMoves = []
        for (var i = -moveRange; i <= moveRange + 1; i++) {
            for (var j = -moveRange; j <= moveRange + 1; j++) {
                if (parseInt(this.selectedUnit.tileData.z) + i >= 0 &&
                    parseInt(this.selectedUnit.tileData.z) + i < this.map.size &&
                    parseInt(this.selectedUnit.tileData.x) + j >= 0 &&
                    parseInt(this.selectedUnit.tileData.x) + j < this.map.size &&
                    Math.abs(i) + Math.abs(j) <= moveRange) {
                    let avalMove = {
                        x: parseInt(this.selectedUnit.tileData.x) + j,
                        z: parseInt(this.selectedUnit.tileData.z) + i
                    }
                    let tile = this.map.level.find(tile => tile.x == avalMove.x && tile.z == avalMove.z)
                    // console.log(tile)
                    if (Math.abs(tile.x - this.selectedUnit.tileData.x) <= attackRange && Math.abs(tile.z - this.selectedUnit.tileData.z) <= attackRange && Math.abs(tile.height - this.selectedUnit.position.y) <= 16 && tile.unit && tile.unit.owner != token) {
                        this.evemyHighlights.push(this.map.matrix[avalMove.z][avalMove.x])
                        this.map.matrix[avalMove.z][avalMove.x].material[2].color.set(0xff0000)
                        console.log('marked enemy on tile ' + tile.id);
                    }
                    if (this.map.matrix[avalMove.z][avalMove.x].walkable) {
                        tempMoves.push(avalMove)
                    }
                }
            }
        }
        let lengths = await socket.checkPaths(this.selectedUnit.tileData, tempMoves)
        this.avalMoveTiles = []
        for (let i in tempMoves) {
            if (lengths[i] < 1 || lengths[i] - 1 > moveRange) continue
            let avalMove = tempMoves[i]
            this.map.matrix[avalMove.z][avalMove.x].material[2].color.set(0x000000)
            this.avalMoveTab.push(this.map.matrix[avalMove.z][avalMove.x])
            this.avalMoveTiles.push(this.map.level.find(tile => tile.x == avalMove.x && tile.z == avalMove.z))
        }
    }
    initRaycaster_unitSelect() {
        var raycaster = new THREE.Raycaster()
        this.debug_log(`Raycaster.units.initialized`, 0)
        $('#game').on('click', async () => {
            console.log('raycaste click');
            if (!this.myTurn || this.spawnTurn) {
                console.log('wrong turn');
                return
            }

            var mouseVector = new THREE.Vector2()
            mouseVector.x = (event.clientX / $(window).width()) * 2 - 1
            mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1
            raycaster.setFromCamera(mouseVector, this.camera);

            // intersects with models
            var modelsIntersects = raycaster.intersectObjects(this.unitsSpawned, true);
            if (modelsIntersects.length > 0) {
                console.log('click on unit');
                let clickedUnit = modelsIntersects[0].object.parent
                let targetTile = this.map.level.find(tile => tile.x == clickedUnit.tileData.x && tile.z == clickedUnit.tileData.z)
                let targetUnit = targetTile.unit
                console.log(targetUnit);
                if (targetUnit.owner == token) { // own unit

                    // reset highlights
                    for (let t of this.evemyHighlights) {
                        t.material[2].color.set(t.color)
                    }
                    this.evemyHighlights = []
                    for (let recolor of this.avalMoveTab) {
                        recolor.material[2].color.set(recolor.color)
                    }
                    this.avalMoveTab = []

                    // click on already selected unit
                    if (clickedUnit == this.selectedUnit) {
                        $("#ui-top-selected-unit").html('')
                        targetUnit.moveIndicator.material.color.set(0x578be0)
                        this.selectedUnit = null
                    }
                    else {
                        let tile = this.map.level.find(tile => tile.x == clickedUnit.tileData.x && tile.z == clickedUnit.tileData.z)
                        if (this.selectedUnit) {
                            console.log(this.selectedUnit);
                            let t = this.map.level.find(tile => tile.x == this.selectedUnit.tileData.x && tile.z == this.selectedUnit.tileData.z)
                            console.log(t.unit);
                            t.unit.moveIndicator.material.color.set(0x578be0)
                        }
                        // console.log(tile.unit);
                        if (!tile.unit || !tile.unit.canMakeMove) { // unit made move this turn
                            $("#ui-top-selected-unit").html('')
                            this.selectedUnit = null
                            return
                        }
                        this.selectUnit(modelsIntersects)
                    }
                    return
                }

                // click on hostile unit
                console.log('click on hostile unit');

                if (!this.selectedUnit) {
                    console.log('no unit selected');
                    return
                }

                // distance check
                let tile = this.map.level.find(tile => tile.x == this.selectedUnit.tileData.x && tile.z == this.selectedUnit.tileData.z)
                let unit = tile.unit
                // distance check
                if (Math.abs(tile.x - targetTile.x) > unit.range || Math.abs(tile.z - targetTile.z) > unit.range || Math.abs(tile.height - targetTile.height) > 16) {
                    console.log('invalid attack range');
                    return
                }

                // reset highlights
                for (let recolor of this.avalMoveTab) {
                    recolor.material[2].color.set(recolor.color)
                }
                this.avalMoveTab = []
                for (let t of this.evemyHighlights) {
                    t.material[2].color.set(t.color)
                }
                this.evemyHighlights = []

                // deselect unit
                $("#ui-top-selected-unit").html('')
                this.selectedUnit = null
                tile.unit.moveIndicator.material.color.set(0xff0000)


                // trigger attack
                this.attackUnit(tile.id, targetTile.id, true)
                return
            }

            // intersects with tiles
            var tilesIntersects = raycaster.intersectObjects(this.map.group.children, true);
            if (tilesIntersects.length > 0) {
                console.log('click on tile');
                let obj = tilesIntersects[0].object
                let tile = this.map.level.find(tile => tile.id == obj.tileID)

                if (!this.selectedUnit) {
                    console.log('no unit selected');
                    return
                }

                // if tile in avalMoveTIles
                if (/* tile.type != "rock" && tile.type != "river" && tile.type != "sea" && */ this.avalMoveTiles.indexOf(tile) != -1) {
                    console.log('valid tile');

                    this.selectedTile = tile

                    // reset highlight
                    for (let recolor of this.avalMoveTab) {
                        recolor.material[2].color.set(recolor.color)
                    }
                    this.avalMoveTab = []
                    for (let t of this.evemyHighlights) {
                        t.material[2].color.set(t.color)
                    }
                    this.evemyHighlights = []

                    socket.sendPFData({
                        x: this.selectedUnit.tileData.x,
                        z: this.selectedUnit.tileData.z,
                        xn: tile.x,
                        zn: tile.z
                    }).then((result) => {
                        let tile = this.map.level.find(tile => tile.x == this.selectedUnit.tileData.x && tile.z == this.selectedUnit.tileData.z)
                        tile.unit.moveIndicator.material.color.set(0xff0000)
                        this.moveUnit(result, tile.id, true)
                        this.avalMoveTab = []
                        $("#ui-top-selected-unit").html('')
                        this.selectedUnit = null
                    })
                }
                return
            }
        })
    }
    loadModels() { // load all models to single array
        return new Promise(async resolve => {
            let session = await socket.getSession()

            // loading models
            for (let unitName in session.unitsToSpawn) { // each unit
                this.models[unitName] = []
                for (let i in session.clients) { // * player count
                    for (let j = 0; j < session.unitsToSpawn[unitName]; j++) { // * units per player
                        let model = new Model(MASTER_Units[unitName].modelURL, unitName)
                        await model.load()
                        this.models[unitName].push(model)
                    }
                }
            }
            this.modelsLoaded = true
            resolve('End')
        })
    }
    loadMap(mapData) {
        return new Promise((resolve, reject) => {
            this.map = new MapDisplay(mapData)
            this.map.renderMap(this.scene)
            resolve('End')
        })
    }
    renderMoves(moves, reconnect) {
        if (help.enemyTurn && !reconnect) DisplayEnemyTurn()
        console.log('renering moves:')
        console.log(moves)
        for (let move of moves) {
            if (move.action == 'spawn') {
                this.spawnUnit(move.tileID, new Unit(move.unitData.name, move.unitData.owner))
            }
            else if (move.action == 'move') {
                console.log("selu", move);
                this.moveUnit(move.moves, move.tileID, false, reconnect)
            }
            else if (move.action == 'attack') {
                console.log('attack');
                this.attackUnit(move.attackerTileID, move.targetTileID)
            }
        }
        setTimeout(() => ui.UpdateMinimapUnits(), 1000)
    }
    async spawnUnit(tileID, unit, addToMoves) {
        let size = MASTER_BlockSizeParams.blockSize
        let tile = this.map.level.find(tile => tile.id == tileID)
        if (tile.unit) { // something is already spawned there
            console.error(`Attempted to spawn unit ${unit.name} on taken tile ${tile}`);
            return
        }
        tile.unit = unit
        this.unitsInPlay.push(unit)
        this.unitsSpawned.push(unit.container.clickBox)
        unit.addTo(this.scene)
        socket.sendSpawnData({
            x: tile.x,
            z: tile.z
        })
        this.map.matrix[tile.z][tile.x].walkable = false
        unit.position.set(size * tile.x, parseInt(tile.height), size * tile.z)
        unit.container.tileData = {}
        unit.container.tileData.x = tile.x
        unit.container.tileData.z = tile.z
        console.log(unit.container.tileData);
        if (unit.owner == token) {
            this.myUnits.push(unit)
            unit.canMakeMove = true // reset moves status on rejoin
        }


        // add spawning unit to moves array - to be sent with turn end & notify server thta spawn wa used
        // should be true when performed manually, undefind when performed by script rendering other player's moves
        if (addToMoves) {
            moves.push({
                action: 'spawn',
                unitData: {
                    name: unit.name,
                    owner: token,
                },
                tileID: tile.id
            })
            this.avalUnits[unit.name]--
            ui.UpdateSpawnControls()
            if (!(Object.values(game.avalUnits).some(val => val > 0))) { // no more units to spawn
                if (help.spawnEnd) DisplaySpawnEnd()
                $("#button-end-turn").attr("disabled", false)
                $('#ui-top-turn-status').html('No available moves').css('background-color', '#7F2F2F')
                this.clearSpawnZones()
            }
        }
    }
    moveUnit(path, tileID, addToMoves, fast_forward) {
        console.log('moving');
        let tile = this.map.level.find(tile => tile.id == tileID)
        if (!tile || !tile.unit) return
        let unit = tile.unit.container

        if (addToMoves) {
            moves.push({
                action: 'move',
                tileID: tileID,
                moves: path,
            })
            tile.unit.canMakeMove = false
        }



        var movePath = path
        var map = this.map
        var matrix = map.matrix

        let lastPos = movePath[movePath.length - 1]
        map.matrix[movePath[0][1]][movePath[0][0]].walkable = true
        map.matrix[lastPos[1]][lastPos[0]].walkable = false
        let newTile = this.map.level.find(tile => tile.x == lastPos[0] && tile.z == lastPos[1])
        newTile.unit = tile.unit
        tile.unit = null

        if (fast_forward) { // reconnecting
            console.warn('!!!reconnecting!!! !!!fast forward!!!');
            let almostLastPos = movePath[movePath.length - 2]
            unit.position.set(almostLastPos[0] * MASTER_BlockSizeParams.blockSize, matrix[almostLastPos[1]][almostLastPos[0]].position.y * 2, almostLastPos[1] * MASTER_BlockSizeParams.blockSize)
            unit.tileData.z = lastPos[1]
            unit.tileData.x = lastPos[0]
            unit.position.y = matrix[unit.tileData.z][unit.tileData.x].position.y * 2
            unit.lookAt(new THREE.Vector3(unit.tileData.x * MASTER_BlockSizeParams.blockSize, unit.position.y, unit.tileData.z * MASTER_BlockSizeParams.blockSize))
            unit.position.set(unit.tileData.x * MASTER_BlockSizeParams.blockSize, unit.position.y, unit.tileData.z * MASTER_BlockSizeParams.blockSize)
            return
        }

        if (addToMoves && this.myUnits.every(unit => unit.canMakeMove == false)) { // no more unit moves available
            $('#ui-top-turn-status').html('No available moves').css('background-color', '#7F2F2F')
        }

        let move = 0
        var moveInterval = setInterval(() => {
            if (move > movePath.length - 1) {
                window.clearInterval(moveInterval)
            } else {
                unit.lookAt(new THREE.Vector3(movePath[move][0] * MASTER_BlockSizeParams.blockSize, unit.position.y, movePath[move][1] * MASTER_BlockSizeParams.blockSize))
                unit.tileData.z = movePath[move][1]
                unit.tileData.x = movePath[move][0]
                unit.position.y = matrix[unit.tileData.z][unit.tileData.x].position.y * 2
                unit.position.set(unit.tileData.x * MASTER_BlockSizeParams.blockSize, unit.position.y, unit.tileData.z * MASTER_BlockSizeParams.blockSize)
                move++
            }
        }, 250)


        /* Pathfinder.moveTiles(moves, this.map.matrix, this.map, unit.container) */
    }
    attackUnit(attackerTileID, targetTileID, addToMoves) {
        let tile = this.map.level.find(tile => tile.id == attackerTileID)
        let unit = tile.unit
        let enemyTile = this.map.level.find(tile => tile.id == targetTileID)
        let enemyUnit = enemyTile.unit

        unit.lookAt(enemyUnit.position)

        console.log('attacker: ' + unit.element);
        console.log('target: ' + enemyUnit.element);

        let multi = 1 // damage multiplier
        if (MASTER_Counters[unit.element] == enemyUnit.element || MASTER_Counters[unit.element] == "all") {
            console.log('mathching element - bonus damage!');
            multi = 1.75
        }

        enemyUnit.health -= unit.damage * multi
        if (enemyUnit.health < 1) { // rip
            this.scene.remove(enemyUnit.container)
            this.unitsInPlay.splice(this.unitsInPlay.indexOf(enemyUnit), 1)
            this.unitsSpawned.splice(this.unitsSpawned.indexOf(enemyUnit.container.clickBox), 1)
            this.map.matrix[enemyTile.z][enemyTile.x].walkable = true
            enemyTile.unit = null
            if (addToMoves) socket.notifyUnitKilled({ x: enemyTile.x, z: enemyTile.z })
            if (enemyUnit.owner == token) {
                this.myUnits.splice(this.myUnits.indexOf(enemyUnit), 1)
                if (this.myUnits.length < 1) { // no units left
                    this.defeated = true
                }
            }
        }

        // --- update hp display, state display ---
        enemyUnit.statBar.hp.scale.x = (enemyUnit.health / (enemyUnit.health + unit.damage)) * enemyUnit.statBar.hp.scale.x
        console.log(unit);


        $('#game').on('click', this.selectU)

        if (addToMoves) {
            moves.push({
                action: 'attack',
                attackerTileID: attackerTileID,
                targetTileID: targetTileID,
            })
            console.log(tile.unit);

            tile.unit.canMakeMove = false
            if (this.myUnits.every(unit => unit.canMakeMove == false)) { // no more unit moves available
                $('#ui-top-turn-status').html('No available moves').css('background-color', '#7F2F2F')
            }
        }
    }
    // #endregion functions
}
