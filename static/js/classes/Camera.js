let cameraLimits = { // Private variable through scoping (at least i attempted this)
    maxDist: 1500,
    minDist: 250,
}

class CameraController { // camera controller
    constructor(cameraObject) { // Takes camera as a parameter, i'd prefer spawning it inside the class, but whatever
        this.anchor = new THREE.Object3D()
        
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

        this.camera = cameraObject

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
        this.moveSpeed = 25
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

    update() {
        if (this.input.rotLeft) this.angle -= 0.05
        if (this.input.rotRight) this.angle += 0.05

        if (this.input.zoomIn && this.distance > cameraLimits.minDist) this.distance -= this.zoomSpeed
        if (this.input.zoomOut && this.distance < cameraLimits.maxDist) this.distance += this.zoomSpeed

        if (this.input.moveLeft) {
            this.anchor.position.x -= Math.cos(-this.angle) * this.moveSpeed
            this.anchor.position.z -= Math.sin(-this.angle) * this.moveSpeed
        }
        if (this.input.moveRight) {
            this.anchor.position.x += Math.cos(-this.angle) * this.moveSpeed
            this.anchor.position.z += Math.sin(-this.angle) * this.moveSpeed
        }
        if (this.input.moveUp) {
            this.anchor.position.x -= Math.sin(this.angle) * this.moveSpeed
            this.anchor.position.z -= Math.cos(this.angle) * this.moveSpeed
        }
        if (this.input.moveDown) {
            this.anchor.position.x += Math.sin(this.angle) * this.moveSpeed
            this.anchor.position.z += Math.cos(this.angle) * this.moveSpeed
        }

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
    }

    debug_showAnchor(boolean) {
        this.marker.visible = boolean
    }
}