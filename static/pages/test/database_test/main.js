$(document).ready(async ()=>{
    console.log("document ready");
    testDB1 = new Database("test1")
    let res = await testDB1.create()
    console.log(res);
})