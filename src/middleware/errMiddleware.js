const duplicateKeyErrorHandler = (err, res) => {
    const field = Object.keys(err.keyValue);
    const code = 400;
    const error = `This ${field} already exists.`;
    res.status(code).send({ messages: error, fields: field });
}

const validationErrHandler = (err, res) => {
    let errors = Object.values(err.errors).map(el => {
        if (el.name === 'CastError')
            return 'Must be a positive number.'
        return el.message
    });
    let fields = Object.values(err.errors).map(el => el.path);
    let code = 400;
    if (errors.length > 1) {
        const errMessages = errors.join(' ');
        res.status(code).send({ messages: errMessages, fields: fields });
    } else {
        res.status(code).send({ messages: errors, fields: fields })
    }
}

module.exports = (err, req, res, next) => {
    if (err.name === 'ValidationError') return err = validationErrHandler(err, res);
    if (err.code && err.code == 11000) return err = duplicateKeyErrorHandler(err, res);
    res.status(500).send();
}