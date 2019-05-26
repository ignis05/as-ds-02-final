class UI {
    static get memberColors() {
        return ['#CF2F2F', '#CF7F2F', '#CFCF2F', '#2F2FCF', '#2F2F2F', '#CF2FCF', '#2FCFCF', '#2FCF2F']
    }
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