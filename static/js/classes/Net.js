class Net {

    static getTestPages() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/getTestPages",
                data: {},
                type: "POST",
                success: data => {
                    resolve(data.testPages)
                },
                error: (xhr, status, error) => {
                    console.log(xhr);
                    reject(new Error("promise rejected"))
                },
            });
        })
    }
}