const InsertPlaceholders = (columns) => {
    return columns.split(', ').map(() => '?').join(', ');
}

const UpdatePlaceholder = (columns) => {
    return columns.split(', ').map((el) => `${el} = ?`).join(', ');
}

module.exports = {
    InsertPlaceholders,
    UpdatePlaceholder
}