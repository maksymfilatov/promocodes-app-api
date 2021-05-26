const authorize = roles => {
    return (req, res, next) => {
        if (typeof roles === 'string') {
            roles = [roles]
        }
        const matches = roles.some(role => role === req.user.role)
        if (!matches)
            return res.status(401).send({ error: 'Please authenticate.' })
        next()
    }
}

module.exports = authorize