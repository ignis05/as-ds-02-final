const MASTER_BlockTypes = {
    dirt: {
        editor: {
            color: '#338833',
        },
        game: {
            color: '#2F7F2F',
            walkable: true,
        }
    },
    rock: {
        editor: {
            color: '#888888',
        },
        game: {
            color: '#7F7F7F',
            walkable: false,
        }
    },
}
// additional const for size in game (same for all block types)
const MASTER_BlockSizeParams = {
    blockSize: 150,
}