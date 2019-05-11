const MASTER_BlockTypes = {
    dirt: {
        editor: {
            color: '#338833',
        },
        game: {
            color: 0x338833,
            walkable: true,
        }
    },
    rock: {
        editor: {
            color: '#888888',
        },
        game: {
            color: 0x888888,
            walkable: false,
        }
    },
}
// additional const for size in game (same for all block types)
const MASTER_BlockSizeParams = {
    blockSize: 150,
}