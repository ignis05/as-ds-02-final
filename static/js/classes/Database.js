class Database {
    constructor(filename) {
        if (!filename.endsWith(".db")) filename += ".db"
        this.filename = filename
        this.id
    }
    create() { // saves database id required for other operations
        console.log("initialazing database on server");
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
    insert(entry) {
        console.log(`inserting to db:`, entry);
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/database_insert",
                data: {
                    id: this.id,
                    entry: entry
                },
                type: "POST",
                success: data => {
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