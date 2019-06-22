const ObjectId = require('mongodb').ObjectID;

const getProjectMiddleware = async(req, res, next) => {
    const id = req.params.projectId;
    const db = require('./../components/mongodb').db;
    const project = await db.collection('projects').findOne({
        _id: new ObjectId(id)
    });
    if (!project) {
        return res.status(404).json({
            error: 'Project Not Found'
        });
    }
    if (project.users.map(id => id.toString()).indexOf(req.logged._id.toString()) === -1) {
        return res.status(403).json({
            error: 'Project is forbidden'
        });
    }
    req.project = project;
    return next();
};

module.exports = getProjectMiddleware;