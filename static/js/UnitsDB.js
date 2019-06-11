// database for unit types
const MASTER_Units = {
    overlord: {
        modelURL: '/static/res/models/overlord/model.fbx',
        scale: 0.2,
        posY: 40,
        stats: {
            mobility: 5,
            health: 10,
            damage: 5,
            range: 1,
            element: "magic"
        }
    },
    dragon: {
        modelURL: '/static/res/models/dragon/model.fbx',
        scale: 0.015,
        posY: 0,
        stats: {
            mobility: 5,
            health: 10,
            damage: 5,
            range: 1,
            element: "fire"
        }
    },
    tiger: {
        modelURL: '/static/res/models/tiger/model.fbx',
        scale: 1.3,
        posY: 0,
        stats: {
            mobility: 5,
            health: 10,
            damage: 5,
            range: 1,
            element: "nature"
        }
    },
    skeleton: {
        modelURL: '/static/res/models/skeleton/model.obj',
        scale: 15,
        posY: 127,
        stats: {
            mobility: 5,
            health: 10,
            damage: 5,
            range: 1,
            element: "death"
        }
    },
}

const MASTER_Counters = {
    "magic": "all",
    "fire": "nature",
    "nature": "death",
    "death": "fire"
}