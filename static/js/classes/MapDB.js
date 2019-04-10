class MapDB extends Database {
    constructor() {
        super("maps")
    }
    importMap(mapName) {
        return this.findOne({ mapName: mapName })
    }
    exportMap(mapName, mapData) {
        return this.insert({ mapName: mapName, mapData: mapData })
    }
    getMaps() {
        return new Promise(async (resolve, reject) => {
            let maps = await this.getAll()
            let mapNames = maps.map(entry => entry.mapName)
            resolve(mapNames)
        })
    }
}