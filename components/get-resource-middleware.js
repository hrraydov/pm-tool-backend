const ObjectId = require('mongodb').ObjectID;

const getResourceMiddleware = async(req, res, next) => {
    const id = req.params.resourceId;
    const db = require('./../components/mongodb').db;
    const resource = await db.collection('resources').findOne({
        _id: new ObjectId(id)
    });
    if (!resource) {
        return res.status(404).json({
            error: 'resource Not Found'
        });
    }
    if (resource.project.toString() !== req.project._id.toString()) {
        return res.status(400).json({
            error: 'resource not part of this project'
        });
    }
    req.resource = resource;
    return next();
};

module.exports = getResourceMiddleware;