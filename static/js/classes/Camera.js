let cameraLimits = { // Private variable through scoping (at least i attempted this)
    maxDist: 1500,
    minDist: 250,
}

class CameraController { // camera controller
    constructor(cameraObject) { // Takes camera as a parameter, i'd prefer spawning it inside the class, but whatever
        this.anchor = new THREE.Object3D()

        this.camera = cameraObject

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
        document.onkeydown = e => {
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
        }

        document.onkeyup = e => {
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
        }
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

        document.onmousemove = e => {
            if (e.clientX < 20) this.inputMouse.moveLeft = true
            else this.inputMouse.moveLeft = false

            if (window.innerWidth - e.clientX < 20) this.inputMouse.moveRight = true
            else this.inputMouse.moveRight = false

            if (e.clientY < 20) this.inputMouse.moveUp = true
            else this.inputMouse.moveUp = false

            if (window.innerHeight - e.clientY < 20) this.inputMouse.moveDown = true
            else this.inputMouse.moveDown = false

            if (this.inputMouse.rot) {
                if (this.inputMouse.lastX - e.clientX < -10) {
                    this.inputMouse.rotLeft = false
                    this.inputMouse.rotRight = true
                }
                if (this.inputMouse.lastX - e.clientX > 10) {
                    this.inputMouse.rotRight = false
                    this.inputMouse.rotLeft = true
                }
            }
        }

        document.onwheel = e => {
            if (e.deltaY > 0) this.distance += this.zoomSpeed * 5
            else this.distance -= this.zoomSpeed * 5
        }

        document.onmousedown = e => {
            if (e.which == 2) {
                e.preventDefault()
                this.inputMouse.rot = true
                this.inputMouse.lastX = e.clientX
            }
        }
        document.onmouseup = e => {
            if (e.which == 2) {
                e.preventDefault()
                this.inputMouse.rot = false
                this.inputMouse.rotLeft = false
                this.inputMouse.rotRight = false
            }
        }
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
        if (this.input.moveUp || this.inputMouse.moveUp) {
            this.anchor.position.x -= Math.sin(this.angle) * this.moveSpeed
            this.anchor.position.z -= Math.cos(this.angle) * this.moveSpeed
        }
        if (this.input.moveDown || this.inputMouse.moveDown) {
            this.anchor.position.x += Math.sin(this.angle) * this.moveSpeed
            this.anchor.position.z += Math.cos(this.angle) * this.moveSpeed
        }

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
        game.debug_log('CameraController.debug_showAnchor: ' + boolean)
    }

    debug_showTriggerZones(boolean) {
        game.debug_log('CameraController.debug_showTriggerZones: ' + boolean)
        if (boolean)
            $('#camera-debug-triggers').removeAttr('style')
        else
            $('#camera-debug-triggers').css('display', 'none')
    }
}