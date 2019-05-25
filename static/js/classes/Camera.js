let cameraLimits = { // Private variable through scoping (at least i attempted this)
    maxDist: 1500,
    minDist: 250,
}

class CameraController { // camera controller
    constructor(cameraObject) { // Takes camera as a parameter, i'd prefer spawning it inside the class, but whatever
        this.anchor = new THREE.Object3D()

        this.camera = cameraObject

        this.camMouseMove
        this.camMouseZoom
        this.camMouseRotateStart
        this.camMouseRotateStop

        this.initInput()
        this.initDebugMarker()
        this.initMouseTriggers()
    }

    initInput() {
        this.inputKeys = { // default inputs for testing, will be later loaded from cookies or sth
            rotLeft: 'KeyQ',
            rotRight: 'KeyE',

            zoomIn: 'KeyR',
            zoomOut: 'KeyF',

            moveLeft: 'KeyA',
            moveRight: 'KeyD',
            moveUp: 'KeyW',
            moveDown: 'KeyS',
        }
        this.input = {
            rotLeft: false,
            rotRight: false,

            zoomIn: false,
            zoomOut: false,

            moveLeft: false,
            moveRight: false,
            moveUp: false,
            moveDown: false,
        }
        this.angle = 0
        this.distance = 500
        this.moveSpeed = 10
        this.zoomSpeed = 25

        // #region Input Listeners
        document.addEventListener('keydown', e => {
            let keys = this.inputKeys
            let input = this.input
            switch (e.code) {
                case keys.rotLeft:
                    input.rotLeft = true
                    break
                case keys.rotRight:
                    input.rotRight = true
                    break

                case keys.zoomIn:
                    input.zoomIn = true
                    break
                case keys.zoomOut:
                    input.zoomOut = true
                    break

                case keys.moveLeft:
                    input.moveLeft = true
                    break
                case keys.moveRight:
                    input.moveRight = true
                    break
                case keys.moveUp:
                    input.moveUp = true
                    break
                case keys.moveDown:
                    input.moveDown = true
                    break
            }
        })

        document.addEventListener('keyup', e => {
            let keys = this.inputKeys
            let input = this.input
            switch (e.code) {
                case keys.rotLeft:
                    input.rotLeft = false
                    break
                case keys.rotRight:
                    input.rotRight = false
                    break

                case keys.zoomIn:
                    input.zoomIn = false
                    break
                case keys.zoomOut:
                    input.zoomOut = false
                    break

                case keys.moveLeft:
                    input.moveLeft = false
                    break
                case keys.moveRight:
                    input.moveRight = false
                    break
                case keys.moveUp:
                    input.moveUp = false
                    break
                case keys.moveDown:
                    input.moveDown = false
                    break
            }
        })
        // #endregion
    }

    initDebugMarker() {
        // #region DEBUG MARKER
        let geo = new THREE.SphereGeometry(20, 6, 2)
        let mat = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
        })
        this.marker = new THREE.Mesh(geo, mat)
        this.anchor.add(this.marker)
        this.marker.visible = false
        // #endregion
    }

    initMouseTriggers() {
        this.inputMouse = {
            rot: false,
            rotLeft: false,
            rotRight: false,
            lastX: null,

            moveLeft: false,
            moveRight: false,
            moveUp: false,
            moveDown: false,
        }

        let camClass = this // No better idea rn, gotta fix it

        document.addEventListener('mousemove', this.camMouseMove = function (e) {
            if (e.clientX < 20) camClass.inputMouse.moveLeft = true
            else camClass.inputMouse.moveLeft = false

            if (window.innerWidth - e.clientX < 20) camClass.inputMouse.moveRight = true
            else camClass.inputMouse.moveRight = false

            if (e.clientY < 20) camClass.inputMouse.moveUp = true
            else camClass.inputMouse.moveUp = false

            if (window.innerHeight - e.clientY < 20) camClass.inputMouse.moveDown = true
            else camClass.inputMouse.moveDown = false

            if (camClass.inputMouse.rot) {
                if (camClass.inputMouse.lastX - e.clientX < -10) {
                    camClass.inputMouse.rotLeft = false
                    camClass.inputMouse.rotRight = true
                }
                if (camClass.inputMouse.lastX - e.clientX > 10) {
                    camClass.inputMouse.rotRight = false
                    camClass.inputMouse.rotLeft = true
                }
            }
        })

        document.addEventListener('wheel', this.camMouseZoom = e => {
            if (e.deltaY > 0) camClass.distance += camClass.zoomSpeed * 5
            else camClass.distance -= camClass.zoomSpeed * 5
        })

        document.addEventListener('mousedown', this.camMouseRotateStart = e => {
            if (e.which == 2) {
                e.preventDefault()
                camClass.inputMouse.rot = true
                camClass.inputMouse.lastX = e.clientX
            }
        })

        document.addEventListener('mouseup', this.camMouseRotateStop = e => {
            if (e.which == 2) {
                e.preventDefault()
                camClass.inputMouse.rot = false
                camClass.inputMouse.rotLeft = false
                camClass.inputMouse.rotRight = false
            }
        })
    }

    update() {
        if (this.input.rotLeft || (this.inputMouse.rotLeft && this.inputMouse.rot)) this.angle -= 0.05
        if (this.input.rotRight || (this.inputMouse.rotRight && this.inputMouse.rot)) this.angle += 0.05

        if (this.input.zoomIn) this.distance -= this.zoomSpeed
        if (this.input.zoomOut) this.distance += this.zoomSpeed

        if (this.input.moveLeft || this.inputMouse.moveLeft) {
            this.anchor.position.x -= Math.cos(-this.angle) * this.moveSpeed
            this.anchor.position.z -= Math.sin(-this.angle) * this.moveSpeed
        }
        if (this.input.moveRight || this.inputMouse.moveRight) {
            this.anchor.position.x += Math.cos(-this.angle) * this.moveSpeed
            this.anchor.position.z += Math.sin(-this.angle) * this.moveSpeed
        }
        if (this.input.moveUp || this.inputMouse.moveUp && anchorWorldPos.z > - MASTER_BlockSizeParams.blockSize / 2) {
            this.anchor.position.x -= Math.sin(this.angle) * this.moveSpeed
            this.anchor.position.z -= Math.cos(this.angle) * this.moveSpeed
        }
        if (this.input.moveDown || this.inputMouse.moveDown) {
            this.anchor.position.x += Math.sin(this.angle) * this.moveSpeed
            this.anchor.position.z += Math.cos(this.angle) * this.moveSpeed
        }

        let blockSize = MASTER_BlockSizeParams.blockSize
        let anchorWorldPos = this.anchor.getWorldPosition(new THREE.Vector3(0, 0, 0))
        if (this.anchor.position.x < - blockSize / 2) this.anchor.position.x = - blockSize / 2
        if (this.anchor.position.z < - blockSize / 2) this.anchor.position.z = - blockSize / 2
        if (this.anchor.position.x > mapData.size * blockSize - blockSize / 2) this.anchor.position.x = mapData.size * blockSize - blockSize / 2
        if (this.anchor.position.z > mapData.size * blockSize - blockSize / 2) this.anchor.position.z = mapData.size * blockSize - blockSize / 2

        if (this.distance < cameraLimits.minDist) this.distance = cameraLimits.minDist
        if (this.distance > cameraLimits.maxDist) this.distance = cameraLimits.maxDist

        this.camera.position.x = this.anchor.position.x + this.distance * Math.sin(this.angle)
        this.camera.position.z = this.anchor.position.z + this.distance * Math.cos(this.angle)
        this.camera.position.y = this.distance
        this.camera.lookAt(this.anchor.position)
    }

    getAnchor() {
        return this.anchor
    }

    fov(int) {
        this.camera.fov = parseInt(int)
        this.camera.updateProjectionMatrix()
        game.debug_log('CameraController.fov: ' + int)
    }

    debug_showAnchor(boolean) {
        this.marker.visible = boolean
        game.debug_log('CameraController.debug_showAnchor: ' + boolean, 1)
    }

    debug_showTriggerZones(boolean) {
        game.debug_log('CameraController.debug_showTriggerZones: ' + boolean, 1)
        if (boolean)
            $('#camera-debug-triggers').removeAttr('style')
        else
            $('#camera-debug-triggers').css('display', 'none')
    }

    debug_disableTriggers(boolean) {
        game.debug_log('CameraController.debug_disableTriggers: ' + boolean, 2)
        if (boolean) {
            document.removeEventListener('mousemove', this.camMouseMove)
            document.removeEventListener('wheel', this.camMouseZoom)
            document.removeEventListener('mousedown', this.camMouseRotateStart)
            document.removeEventListener('mouseup', this.camMouseRotateStop)
        } else {
            this.initMouseTriggers()
        }
    }
}