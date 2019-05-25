// database for unit types
const MASTER_Units = {
    spider: {
        modelURL: '/static/res/models/spider/spider.fbx',
        scale: 0.8,
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
        stats: {
            mobility: 8,
            health: 10,
            damage: 5,
            range: 1
        },
    },
}

if (typeof window == undefined) { // for server - used when creating room
    module.exports.MASTER_Units = MASTER_Units
}