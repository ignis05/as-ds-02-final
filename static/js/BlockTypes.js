const MASTER_BlockTypes = {
    road: {
        editor: {
            color: '#7F2F00',
            fontColor: '#000000',
        },
        game: {
            color: '#7F2F00',
            walkable: true,
            moveCost: 1,
        }
    },
    land: {
        editor: {
            color: '#2F7F2F',
            fontColor: '#000000',
        },
        game: {
            color: '#2F7F2F',
            walkable: true,
            moveCost: 2,
        }
    },
    dirt: {
        editor: {
            color: '#CFCF2F',
            fontColor: '#000000',
        },
        game: {
            color: '#CFCF2F',
            walkable: true,
            moveCost: 2,
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
            moveCost: 255,
        }
    },
    river: {
        editor: {
            color: '#2F7FCF',
            fontColor: '#000000',
        },
        game: {
            color: '#2F7FCF',
            walkable: false,
            moveCost: 255,
        }
    },
    ford: {
        editor: {
            color: '#2F2FCF',
            fontColor: '#000000',
        },
        game: {
            color: '#2F2FCF',
            walkable: true,
            moveCost: 3,
        }
    },
    sea: {
        editor: {
            color: '#2FCFCF',
            fontColor: '#000000',
        },
        game: {
            color: '#2FCFCF',
            walkable: false,
            moveCost: 255,
        }
    },
    marsh: {
        editor: {
            color: '#2F007F',
            fontColor: '#000000',
        },
        game: {
            color: '#2F007F',
            walkable: true,
            moveCost: 4,
        }
    },
    oil: {
        editor: {
            color: '#500050',
            fontColor: '#000000',
        },
        game: {
            color: '#500050',
            walkable: true,
            moveCost: 4,
        }
    },
}
// additional const for size in game (same for all block types)
const MASTER_BlockSizeParams = {
    blockSize: 150,
}