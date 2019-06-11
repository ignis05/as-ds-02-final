class UI {
    static get memberColors() {
        return ['#CF2F2F', '#CF7F2F', '#CFCF2F', '#2F2FCF', '#2F2F2F', '#CF2FCF', '#2FCFCF', '#2FCF2F']
    }
    constructor(levelData) {
        $('#ui').removeAttr('style')

        this.buildCategories = Array.from($('.ui-build-cat'))
        this.buildTabs = Array.from($('.ui-build-tab'))

        this.levelData = levelData
    }

    UpdateMinimap() {
        let levelPack = this.levelData

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

    UpdateMinimapCamera(posX, posZ, distance, rotation) {
        let levelPack = this.levelData
        let wrkDistance = distance / CameraController.cameraLimits().minDist
        let blockSize = 8

        let canvas = $('#minimap-camera')
            .attr('width', parseInt(levelPack.size) * blockSize * blockSize)
            .attr('height', parseInt(levelPack.size) * blockSize * blockSize)

        let ctx = canvas[0].getContext('2d')

        ctx.scale(8, 8)

        let drawX = posX * 8
        let drawZ = posZ * 8

        ctx.translate(drawX, drawZ)
        ctx.rotate(-rotation)

        ctx.lineWidth = "1"
        ctx.strokeStyle = "#FFFFFF"

        ctx.beginPath()
        ctx.moveTo(-blockSize * 3 * wrkDistance, -blockSize * 5 / 2 * wrkDistance)
        ctx.lineTo(blockSize * 3 * wrkDistance, -blockSize * 5 / 2 * wrkDistance)
        ctx.lineTo(blockSize * wrkDistance, blockSize * 3 / 2 * wrkDistance)
        ctx.lineTo(-blockSize * wrkDistance, blockSize * 3 / 2 * wrkDistance)
        ctx.closePath()
        ctx.stroke()

        ctx.rotate(rotation)
        ctx.translate(-drawX, -drawZ)
    }

    async UpdateMinimapUnits() {
        let levelPack = this.levelData

        let canvas = $('#minimap-units')
            .attr('width', parseInt(levelPack.size) * 8)
            .attr('height', parseInt(levelPack.size) * 8)

        let ctx = canvas[0].getContext('2d')

        ctx.scale(8, 8)

        ctx.clearRect(0, 0, parseInt(levelPack.size) * 8, parseInt(levelPack.size) * 8)

        let session = await socket.getSession()

        for (let i in game.unitsInPlay) {
            ctx.fillStyle = "#000000"
            for (let j in session.clients) {
                if (session.clients[j].token == game.unitsInPlay[i].owner)
                    ctx.fillStyle = UI.memberColors[j]
            }
            ctx.fillRect(parseInt(game.unitsInPlay[i].container.tileData.x), parseInt(game.unitsInPlay[i].container.tileData.z), 1, 1)
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
        let div = $('#ui-spawn-controls')

        if (!(Object.values(game.avalUnits).some(val => val > 0))) { // no units left to spawn
            game.debug_log(`All units spawned - removing spawn controls`, 0)
            div.html('')
            return
        }

        console.log(game.avalUnits)

        div.html('')

        for (let unitName in game.avalUnits) {
            let container = $(`<div class='ui-spawn-controls-container'>`)
            container.appendTo(div)
            container.html(`<img src="/static/res/img/thumb_${unitName}.png"><p>${unitName}: ${game.avalUnits[unitName]} left</p>`)

            if (!parseInt(game.avalUnits[unitName]))
                container.addClass('ui-spawn-controls-container-empty') // Slightly fade out menu item when no more units available

            container.click(() => {
                let marked = Array.from($('.ui-spawn-controls-container-active'))
                for (let i in marked) {
                    marked[i].classList.remove('ui-spawn-controls-container-active')
                }
                if (game.selectUnitToSpawn(unitName)) {
                    event.target.classList.add('ui-spawn-controls-container-active')
                }
            })
            console.log(game.unitToSpawn + ' == ' + unitName)
            if (game.unitToSpawn == unitName && game.avalUnits[unitName]) {
                console.log(true)
                container.addClass('ui-spawn-controls-container-active')
            } else console.log(false)
        }
    }

    initChat() {
        game.debug_log('Chat.enabled', 0)
        $('#socket-chat-input').on('keyup', () => {
            if (event.code === 'Enter') {
                // Moved retired button function
                if ($('#socket-chat-input').val() !== '') { // Blocking empty messages
                    let msg = {
                        author: socket.id, // id of current connection - will always be unique
                        content: $('#socket-chat-input').val().replace('<', '&lt;').replace('>', '&gt;')  // Sanitization on send, server gets sanitized content
                    }
                    socket.send(msg) // trigger event 'chat' for every user in room (including self) and pass msg obj as data
                    $('#socket-chat-input').val('') // Clear message field to prevent accidental spam
                }
            }
        })
    }

    debug_perfMonitor() {
        var stats = new Stats();
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(stats.dom);

        function animate() {

            stats.begin();

            // monitored code goes here

            stats.end();

            requestAnimationFrame(animate);

        }
        requestAnimationFrame(animate);
    }

    async UpdateChat(msg) { // placeholder function triggered by 'chat' event
        let session = await socket.getSession()
        let author = session.clients.find(client => client.id == msg.author)
        let uid = session.clients.indexOf(author)

        let msgContent = msg.content.replace('<', '&lt;').replace('>', '&gt;') // Sanitization on recieve (in case someone bypases the send sanitizer)

        let chat = $('#socket-chat-display').html()
        chat += `<div style="display: inline; color: ` + UI.memberColors[uid] + `; text-shadow: 2px 0px 1px #000000;">${author.name}</div>: ` + msgContent + `<br>`
        $('#socket-chat-display').html(chat)


        $("#socket-chat-display").scrollTop($("#socket-chat-display")[0].scrollHeight) // scroll chat to bottom
    }
}
