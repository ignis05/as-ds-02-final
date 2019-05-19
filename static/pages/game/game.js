const dtOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
}

// will be heavly integrated with socket.js so i suggest keeping it as local file instead of global class
class Game {
    constructor(domElement) {
        var scene = new THREE.Scene()
        this.scene = scene

        let aaOn = Cookies.get('settings-aaOn') === 'true'
        let resScale = Cookies.get('settings-resScale')
        this.debug_log('Renderer.antialias: ' + aaOn, 0)
        this.debug_log('Renderer.resScale: ' + resScale, 0)

        var renderer = new THREE.WebGLRenderer({ antialias: aaOn })
        this.renderer = renderer

        renderer.setPixelRatio(resScale) // Resolution scale :)

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
        this.debug_log('Game.consoleEnable: ' + true, 1)
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
    loadMap(mapData) {
        return new Promise((resolve, reject) => {
            this.map = new Map(mapData)
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
    spawnUnit(tileID, unit) {
        let size = MASTER_BlockSizeParams.blockSize
        let tile = this.map.level.find(tile => tile.id == tileID)
        if (tile.unit) { // something is already spawned there
            console.error(`Attempted to spawn unit ${unit} on taken tile ${tile}`);
            return
        }
        tile.unit = unit
        unit.addTo(this.scene)
        unit.position.set(size * tile.x, parseInt(tile.height) / 2, size * tile.z)
    }
    // #endregion functions
}
