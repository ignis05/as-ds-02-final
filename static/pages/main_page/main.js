$(document).ready(() => {
    console.log("document ready");

    // #region menu listeners
    $("#btPlay").click(() => {
        window.location = "/"
    })

    $("#btInstructions").click(() => {
        window.location = "/"
    })

    $("#btModelTest").click(() => {
        window.location = "/static/pages/test/loader_test/test.html"
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
    // #endregion menu listeners
})