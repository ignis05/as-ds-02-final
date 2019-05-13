const MASTER_BlockTypes = {
    dirt: {
        editor: {
            color: '#2F7F2F',
            fontColor: '#000000',
        },
        game: {
            color: '#2F7F2F',
            walkable: true,
        }
    },
    rock: {
        editor: {
            color: '#7F7F7F',
            fontColor: '#000000',
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