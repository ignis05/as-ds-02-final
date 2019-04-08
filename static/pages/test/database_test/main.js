$(document).ready(async () => {
    console.log("document ready");

    // initialazing database
    testDB1 = new Database("test1")
    let res = await testDB1.create()
    console.log(res);

    // inserting entry
    let testentry1 = {
        xd: "xdddd",
        2137: "asdds",
        tab: ["sad", "dasdd", "dsa"],
        obj: {
            xd: "xd",
            dx: ["dx"]
        }
    }
    res = await testDB1.insert(testentry1)
    console.log(res);
})