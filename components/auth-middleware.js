var jwt = require('jsonwebtoken');

const auth = async(req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return res.status(401).json({ error: 'missing authorization header' });
    }
    if (!authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Invalid Authorization header'
        });
    }
    const token = authorizationHeader.substring(7, authorizationHeader.length);
    try {
        const decoded = jwt.verify(token, 'secret');
        const db = require('./mongodb').db;
        const user = await db.collection('users').findOne({
            email: decoded.sub
        });
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized'
            })
        }
        req.logged = user;
        return next();
    } catch (error) {
        return res.json({
            error: error.message
        });
    }
}

module.exports = auth;