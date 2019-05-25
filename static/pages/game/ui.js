class UI {
    constructor() {
        $('#ui').removeAttr('style')

        this.buildCategories = Array.from($('.ui-build-cat'))
        this.buildTabs = Array.from($('.ui-build-tab'))
    }

    UpdateMinimap(levelPack) {
        let canvas = $('#minimap-canvas')
            .attr('width', parseInt(levelPack.size) * 8)
            .attr('height', parseInt(levelPack.size) * 8)

        let ctx = canvas[0].getContext('2d')

        ctx.scale(8, 8)

        for (let i in levelPack.level) {
            ctx.fillStyle = MASTER_BlockTypes[levelPack.level[i].type].editor.color
            ctx.fillRect(parseInt(levelPack.level[i].x), parseInt(levelPack.level[i].z), parseInt(levelPack.level[i].x) + 1, parseInt(levelPack.level[i].z) + 1)
        }
    }

    debug_uiDisable(boolean) {
        game.debug_log('ui.debug_uiDisable: ' + boolean, 2)
        if (boolean)
            $('#ui').css('display', 'none')
        else
            $('#ui').removeAttr('style')
    }

    UpdateSpawnControls() {
        let div = $('#ui-placeholder-spawn-controls')

        if (!(Object.values(game.avalUnits).some(val => val > 0))) { // no units left to spawn
            game.debug_log(`All units spawned - removing spawn controls`, 0)
            div.remove()
            return
        }

        div.html('')

        for (let unitName in game.avalUnits) {
            let container = $(`<div class='ui-spawn-controls-container'>`)
            container.appendTo(div)
            container.html(`${unitName} : ${game.avalUnits[unitName]}`)
            container.click(() => {
                if (game.selectUnitToSpawn(unitName)) {
                    event.target.classList.add('ui-spawn-controls-container-active')
                }
            })
        }
    }
}