class Database {
    constructor(filename) {
        if (!filename.endsWith(".db")) filename += ".db"
        this.filename = filename
        this.id
    }
    create() { // crease db object on server
        console.log("creating database on server");
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/database_create",
                data: {
                    filename: this.filename
                },
                type: "POST",
                success: data => {
                    this.id = data.id
                    resolve(data)
                },
                error: (xhr, status, error) => {
                    console.log(xhr);
                    reject(new Error("promise rejected"))
                },
            });
        })
    }
}