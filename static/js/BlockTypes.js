const MASTER_BlockTypes = {
    dirt: {
        editor: {
            color: '#2F7F2F',
        },
        game: {
            color: 0x2F7F2F,
            walkable: true,
        }
    },
    rock: {
        editor: {
            color: '#7F7F7F',
        },
        game: {
            color: 0x7F7F7F,
            walkable: false,
        }
    },
}
// additional const for size in game (same for all block types)
const MASTER_BlockSizeParams = {
    blockSize: 150,
}