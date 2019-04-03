class ModelFBX extends Model {
    constructor(path, name) { // path to fbx file & optional mesh name
        super(path, name)
    }

    load() { // loads file, always call with "await" or ".then()"
        return new Promise(resolve => {
            const loader = new THREE.FBXLoader();
            loader.load(this.path, mesh => {
                console.log(mesh);
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
}