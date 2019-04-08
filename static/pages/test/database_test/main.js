$(document).ready(async () => {
    console.log("document ready");

    // >>> initialazing database
    testDB1 = new Database("test1")
    let res = await testDB1.create()
    console.log(res);

    // >>> inserting entry <<<
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

    let testentry2 = { xd: "aaa" }
    await testDB1.insert(testentry2)

    // >>> requesting whole database <<<
    res = await testDB1.getAll()
    // alternative methods:
    // res = await testDB1.findAll()
    // res = await testDB1.requestAll()
    console.log(res);

    // >>>  finding single matching entry <<<
    res = await testDB1.findOne({ xd: "xdddd" })
    console.log(res);

    // >>>  finding all matching entries <<<
    res = await testDB1.find({ xd: "aaa" })
    console.log(res);

    // >>>  counting all matching entries <<<
    res = await testDB1.count({ xd: "aaa" })
    console.log(res);

    // >>>  counting all entries <<<
    res = await testDB1.countAll()
    console.log(res);

    // >>>  removing single matching entry <<<
    res = await testDB1.removeOne({ xd: "xdddd" })
    console.log(`removed ${res} entry`);

    // >>>  removing all matching entries <<<
    res = await testDB1.remove({ xd: "aaa" })
    console.log(`removed ${res} entries`);

    // display db after remove
    res = await testDB1.getAll()
    console.log(res);
})