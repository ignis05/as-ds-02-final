class MapDB extends Database {
    constructor() {
        super("maps")
    }
    importMap(mapName) {
        return this.findOne({ mapName: mapName })
    }
    exportMap(mapName, mapData) {
        return new Promise(async resolve => {
            await this.remove({ mapName: mapName })
            let resp = await this.insert({ mapName: mapName, mapData: mapData, modDate: new Date() })
            resolve(resp)
        })
    }
    getMaps() {
        return new Promise(async resolve => {
            let maps = await this.getAll()
            let mapNames = maps.map(entry => {
                return {
                    mapName: entry.mapName,
                    modDate: new Date(entry.modDate),
                    mapSize: entry.mapData.size, // Map size needed for Lobby MapList
                    playerCount: 8 // Temp value
                }
            })
            resolve(mapNames)
        })
    }
}