$(document).ready(() => {
    console.log("document ready");

    //#region menu listeners
    $("#bMain0").click(() => {
        window.location = "/"
    })

    $("#bMain1").click(() => {
        window.location = "/"
    })

    $("#bMain2").click(() => {
        window.location = "/"
    })

    $("#bMain3").click(() => {
        window.location = "/"
    })

    $("#bMain4").click(() => {
        window.location = "/"
    })

    $("#btDatabaseTest").click(() => {
        window.location = "/static/pages/test/database_test/main.html"
    })

    $("#test").click(() => {
        setTimeout(() => {
            let status = document.getElementById("test").open
            if (status) {
                $("#btTest").css("background-color", "#aaaaaa")
            }
            else {
                $("#btTest").css("background-color", "")
            }
        })
    })
    //#endregion


})