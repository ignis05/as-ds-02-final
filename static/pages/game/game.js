const dtOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
}

// will be heavly integrated with socket.js so i suggest keeping it as local file instead of global class

// ======================================================================= //
//  Debug will be moved (mostly intact) to a global class at a later date  //
// ======================================================================= //

class Game {
    constructor(domElement) {
        var scene = new THREE.Scene()
        this.scene = scene

        this.models = {} // all models meshes will be loaded here when game is started
        this.modelsLoaded = false

        let aaOn = Cookies.get('settings-aaOn') === 'true'
        let resScale = Cookies.get('settings-resScale')
        this.debug_log('Renderer.antialias: ' + aaOn, 0)
        this.debug_log('Renderer.resScale: ' + resScale, 0)

        var renderer = new THREE.WebGLRenderer({ antialias: aaOn })
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

        this.myTurn = false
        this.unitToSpawn = null // unit that will be spawned on click
        this.avalUnits // units avalible for this player to spawn
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
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
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

        var light = new THREE.DirectionalLight(0xffffff, 1);
        this.scene.add(light);

        // position light above middle of the scene and aim it directly down
        light.position.set(this.map.size * 150 / 2, 1000, this.map.size * 150 / 2)
        light.target = new THREE.Object3D
        this.scene.add(light.target)
        light.target.position.set(light.position.x, 0, light.position.z)

        // enable shadows and set up quality 
        light.castShadow = true
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        // set up shadow-rendering zone
        light.shadow.camera.near = 2;
        light.shadow.camera.far = 1024;
        light.shadow.camera.left = this.map.size * 150 / 2 + 75
        light.shadow.camera.right = -this.map.size * 150 / 2 - 75
        light.shadow.camera.top = this.map.size * 150 / 2 + 75
        light.shadow.camera.bottom = -this.map.size * 150 / 2 - 75

        if (dsiplayZone) {
            // helper thast visualizes shadow-rendering zone
            var helper = new THREE.CameraHelper(light.shadow.camera);
            this.scene.add(helper);
        }

        if (displayTest) {
            // sphere to test shadows without models
            var sphereGeometry = new THREE.SphereBufferGeometry(20, 32, 32);
            var sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.castShadow = true;
            this.scene.add(sphere);
            sphere.position.set(200, 100, 200)
        }
    }
    activateMyTurn() {
        console.log('My turn');
        if (Object.values(this.avalUnits).some(val => val > 0)) {  // if spawning turn
            $("#button-end-turn").attr("disabled", true)
            $("#button-end-turn").css("color", "blue")
        }
        else { // if normal turn
            $("#button-end-turn").attr("disabled", false)
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
        var raycaster = new THREE.Raycaster(); // obiekt symulujący "rzucanie" promieni
        this.raycaster_spawns = raycaster
        this.debug_log(`Raycaster.spawns.initialized`, 0)

        $('#game').click(() => {
            if (!this.unitToSpawn || this.avalUnits[this.unitToSpawn] < 1 || !this.myTurn) return
            console.log('canSpawn');
            var mouseVector = new THREE.Vector2()
            mouseVector.x = (event.clientX / $(window).width()) * 2 - 1
            mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1
            raycaster.setFromCamera(mouseVector, this.camera);

            var intersects = raycaster.intersectObjects(this.map.group.children, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object
                console.log(obj);
                let tile = this.map.level.find(tile => tile.id == obj.tileID)
                console.log(tile);
                if (tile && !tile.unit) {
                    this.spawnUnit(tile.id, new Unit(this.unitToSpawn, token), true)
                }
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
    renderMoves(moves) {
        // list of moves: - in case any new moves are possible to be sent, they should be added to this list
        /*
            {
            action: 'spawn',
            unitData: {
                name: '_name_of_unit',
                owner: _owner's_token,
                },
            tileID: _id_of_tile_unit_should_be_spawned_on
            }
        */
        console.log('renering moves:');
        console.log(moves);
        for (let move of moves) {
            if (move.action == 'spawn') {
                this.spawnUnit(move.tileID, new Unit(move.unitData.name, move.unitData.owner))
            }
        }
    }
    async spawnUnit(tileID, unit, addToMoves) {
        let size = MASTER_BlockSizeParams.blockSize
        let tile = this.map.level.find(tile => tile.id == tileID)
        if (tile.unit) { // something is already spawned there
            console.error(`Attempted to spawn unit ${unit.name} on taken tile ${tile}`);
            return
        }
        tile.unit = unit
        unit.addTo(this.scene)
        unit.position.set(size * tile.x, parseInt(tile.height), size * tile.z)

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
                $("#button-end-turn").attr("disabled", false);
                $("#button-end-turn").css("color", "initial");
            }
        }
    }
    // #endregion functions
}
