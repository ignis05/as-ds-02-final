// script requesting token from server
// console.log("generating token");

$.ajax({
    url: "/token",
    data: {},
    type: "POST",
    success: data => { },
    error: (xhr, status, error) => {
        console.log(xhr);
        reject(new Error("promise rejected"))
    },
});
