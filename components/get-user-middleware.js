const ObjectId = require('mongodb').ObjectID;

const getUserMiddleware = async(req, res, next) => {
    const id = req.params.userId;
    const db = require('./../components/mongodb').db;
    const user = await db.collection('users').findOne({
        _id: new ObjectId(id)
    });
    if (!user) {
        return res.status(404).json({
            error: 'user Not Found'
        });
    }
    req.user = user;
    return next();
};

module.exports = getUserMiddleware;
