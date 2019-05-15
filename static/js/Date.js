// changes in Date prototype for easier date formatting

Date.prototype.getMapFormat = function () {
    let val = new Intl.DateTimeFormat('en-GB', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(this).replace(',', '')

    return val
}

// just load file to html and use .getMapFormat() method