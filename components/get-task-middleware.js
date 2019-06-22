const ObjectId = require('mongodb').ObjectID;

const getTaskMiddleware = async(req, res, next) => {
    const id = req.params.taskId;
    const db = require('./../components/mongodb').db;
    const task = await db.collection('tasks').findOne({
        _id: new ObjectId(id)
    });
    if (!task) {
        return res.status(404).json({
            error: 'Task Not Found'
        });
    }
    if (task.project.toString() !== id) {
        return res.status(400).json({
            error: 'Task not part of this project'
        });
    }
    req.task = task;
    return next();
};

module.exports = getTaskMiddleware;