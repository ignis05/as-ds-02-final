// database for unit types
const MASTER_Units = {
    spider: {
        modelURL: '/static/res/models/spider/spider.fbx',
        scale: 0.8,
        posY: 0,
        stats: {
            mobility: 5,
            health: 10,
            damage: 15,
            range: 1
        },
    },
    raptoid: {
        modelURL: '/static/res/models/raptoid/scene.gltf',
        scale: 1,
        posY: 0,
        stats: {
            mobility: 8,
            health: 10,
            damage: 5,
            range: 1
        },
    },
    overlord: {
        modelURL: '/static/res/models/overlord/model.fbx',
        scale: 0.2,
        posY: 20,
        stats: {
            mobility: 8,
            health: 10,
            damage: 50,
            range: 1
        },
    },
}