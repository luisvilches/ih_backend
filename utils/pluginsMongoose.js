const countProperties = myObj => {
    var length = 0;
    if (typeof myObj != 'object') return false;
    for (var i in myObj) length++;
    return length;
}

exports.uniqueValid = (schema, options = {}) => {
    console.log(this.constructor)
    schema.pre("save", async function (next) {
        let index = 1, length = countProperties(schema.obj);
        for (let key in schema.obj) {
            if (schema.obj[key]['unique']) {
                let query = {};
                query[key] = this[key];
                if (Boolean(await this.constructor.countDocuments(query))) {
                    var err = new Error('existing record');
                    err.value = key;
                    err.msg = this[key] + ' ' + options.default;
                    err.code = 11000;
                    next(err);
                }
            }

            if (index == length) next();
            index++;
        }
    });
}