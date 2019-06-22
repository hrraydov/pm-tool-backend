const express = require('express');
const helper = require('./../models/helper');
const task = require('./../models/task');
const ObjectId = require('mongodb').ObjectID;
const getTaskMiddleware = require('./../components/get-task-middleware');
const router = express.Router({ mergeParams: true });

router.use(require('./../components/auth-middleware'));
router.use(require('./../components/get-project-middleware'));

router.get('/', async(req, res) => {
    console.log(req.params);
    const db = require('./../components/mongodb').db;
    const skip = req.query.offset || 0;
    const take = req.query.size || 20;
    const search = req.query.search || '';
    const result = await db.collection('tasks').find({
        project: req.project._id
    }, {
        skip,
        take
    }).toArray();
    return res.json(result.map(doc => helper.modelToBody(doc, task.fields)));
});

router.post('/', async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, task.fields);
    const result = await db.collection('tasks').insertOne({
        ...model,
        createdOn: new Date(),
        createdBy: req.logged._id,
        project: req.project._id,
    });
    model = await db.collection('tasks').findOne({
        _id: new ObjectId(result.insertedId)
    });
    return res.status(201).location(`/projects/${req.project._id}/tasks/${model._id}`).json(helper.modelToBody(model, task.fields));
});

router.get('/:taskId', getTaskMiddleware, (req, res) => {
    return res.json(helper.modelToBody(req.task, task.fields));
});

router.put('/:taskId', getTaskMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, task.fields);
    const result = await db.collection('tasks').updateOne({
        _id: req.task._id
    }, {
        $set: {
            ...model,
            modifiedOn: new Date(),
            modifiedBy: req.logged._id
        }
    });
    model = await db.collection('tasks').findOne({
        _id: req.task._id
    });
    return res.status(200).json(helper.modelToBody(model, task.fields));
});

router.delete('/:id', getTaskMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    await db.collection('tasks').deleteOne({
        _id: req.task._id
    });
    return res.json(helper.modelToBody(req.task, task.fields));
});
module.exports = router;