class ModelGLTF extends Model {
    constructor(path, name) { // path to gltf file & optional mesh name
        super(path, name)
    }

    load() { // loads file, always call with "await" or ".then()"
        return new Promise(resolve => {
            const loader = new THREE.GLTFLoader();
            loader.load(this.path, gltf => {
                console.log(gltf);
                this.gltf = gltf
                this.mesh = gltf.scene
                this.mesh.name = this.name

                this.animations = gltf.animations
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
}