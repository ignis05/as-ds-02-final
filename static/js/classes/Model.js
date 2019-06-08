class Model {
    constructor(path, name) { // path to file & optional mesh name
        this.path = path
        this.name = name
        this.mesh = null
        this.animations = null
        this.mixer = null
        this.currentAnimation = null
        this.clock = new THREE.Clock();
    }

    load() { // recognizes extention and loads model, always call with `await` or `.then()`
        return new Promise(async (resolve, reject) => {
            console.log('LOADING MODEL: ' + this.name);
            let extention = this.path.split(".")[this.path.split(".").length - 1]
            switch (extention) {
                case "gltf":
                    await this.loadGLTF()
                    resolve()
                    break;
                case "fbx":
                    await this.loadFBX()
                    resolve()
                    break;
                case "obj":
                    await this.loadOBJ()
                    resolve()
                    break;
                default:
                    reject("invalid extention")
            }
        })
    }

    // update mixera
    animate() {
        var delta = this.clock.getDelta();
        if (this.mixer) this.mixer.update(delta)
    }

    // animations
    setAnimation(animation) {
        if (this.currentAnimation != animation) {
            this.currentAnimation = animation
            this.mixer.uncacheRoot(this.mesh)
            this.mixer.clipAction(animation).play();
        }
    }

    // adds appropriate element to parent
    addTo(parent) {
        parent.add(this.mesh)
    }

    // generate animations buttons on page
    createButtons() {
        if (!this.animations) return
        $("#animationDisplayButtonsContainer").remove()
        let container = document.createElement("div")
        container.id = "animationDisplayButtonsContainer"
        container.style.position = "absolute"
        container.style.top = "0"
        container.style.left = "0"
        document.body.appendChild(container)
        this.animations.forEach((animation, index) => {
            var button = $("<div>")
            button.text(animation.name)
            button.addClass(`animationDisplayButton`)
            button.css(`background`, `#000000cc`)
            button.css(`padding`, `3px`)
            button.css(`color`, `white`)
            button.css(`width`, `auto`)
            button.css(`display`, `flex`)
            button.css(`align-items`, `center`)
            button.css(`justify-content`, `center`)
            // button.css(`border-radius`, `20px`)
            button.css(`margin`, `2px`)
            button.click(e => {
                var i = index
                if (this.currentAnimation != e.target.innerText) {
                    $(".animationDisplayButton").css("color", "white")
                    e.target.style.color = "red"
                    this.mixer.uncacheRoot(this.mesh)
                    console.log(e.target.innerText);
                    this.mixer.clipAction(this.animations[i]).play()
                    this.currentAnimation = e.target.innerText
                }
                else {
                    $(".animationDisplayButton").css("color", "white")
                    this.mixer.uncacheRoot(this.mesh)
                    this.currentAnimation = null
                }
            })
            $(container).append(button)
        })
    }

    // #region loaders
    loadGLTF() { // loads gltf file
        return new Promise(resolve => {
            const loader = new THREE.GLTFLoader();
            loader.load(this.path, gltf => {
                // console.log(gltf);
                this.gltf = gltf
                this.mesh = this.gltf.scene
                this.mesh.name = this.name

                this.animations = this.gltf.animations
                this.mixer = new THREE.AnimationMixer(this.mesh);
                resolve()
            },
                (xhr) => {
                    // called while loading is progressing
                    console.log(`${~~((xhr.loaded / xhr.total * 100))}% loaded`);
                },
                (error) => {
                    // called when loading has errors
                    console.error('An error happened', error);
                },
            );
        })
    }
    loadFBX() { // loads fbx file
        return new Promise(resolve => {
            const loader = new THREE.FBXLoader();
            loader.load(this.path, mesh => {
                // console.log(mesh);
                this.mesh = mesh
                this.mesh.name = this.name

                this.animations = this.mesh.animations
                this.mixer = new THREE.AnimationMixer(this.mesh);
                resolve()
            },
                (xhr) => {
                    // called while loading is progressing
                    console.log(`${~~((xhr.loaded / xhr.total * 100))}% loaded`);
                },
                (error) => {
                    // called when loading has errors
                    console.error('An error happened', error);
                },
            );
        })
    }
    loadOBJ() { // loads obj file
        return new Promise(resolve => {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath((this.path.split('/').slice(0, this.path.split('/').length - 1)).join("/") + "/");
            mtlLoader.load(this.path.split('/')[this.path.split('/').length - 1], materials => {
                materials.preload();
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load(this.path, mesh => {
                    // console.log(mesh);
                    this.mesh = mesh
                    this.mesh.name = this.name

                    this.animations = this.mesh.animations
                    this.mixer = new THREE.AnimationMixer(this.mesh);
                    resolve()
                },
                    (xhr) => {
                        // called while loading is progressing
                        console.log(`${~~((xhr.loaded / xhr.total * 100))}% loaded`);
                    },
                    (error) => {
                        // called when loading has errors
                        console.error('An error happened', error);
                    },
                );
            });
            // const loader = new THREE.OBJLoader();
            // loader.load(this.path, mesh => {
            //     // console.log(mesh);
            //     this.mesh = mesh
            //     this.mesh.name = this.name

            //     this.animations = this.mesh.animations
            //     this.mixer = new THREE.AnimationMixer(this.mesh);
            //     resolve()


            // },
            //     (xhr) => {
            //         // called while loading is progressing
            //         console.log(`${~~((xhr.loaded / xhr.total * 100))}% loaded`);
            //     },
            //     (error) => {
            //         // called when loading has errors
            //         console.error('An error happened', error);
            //     },
            // );
        })
    }
    // #endregion loaders
}