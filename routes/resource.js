const express = require('express');
const helper = require('./../models/helper');
const resource = require('./../models/resource');
const ObjectId = require('mongodb').ObjectID;
const getresourceMiddleware = require('./../components/get-resource-middleware');
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
    const result = await db.collection('resources').find({
        project: req.project._id
    }, {
        skip,
        take
    }).toArray();
    return res.json(result.map(doc => helper.modelToBody(doc, resource.fields)));
});

router.post('/', async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, resource.fields);
    const result = await db.collection('resources').insertOne({
        ...model,
        createdOn: new Date(),
        createdBy: req.logged._id,
        project: req.project._id,
    });
    model = await db.collection('resources').findOne({
        _id: new ObjectId(result.insertedId)
    });
    return res.status(201).location(`/projects/${req.project._id}/resources/${model._id}`).json(helper.modelToBody(model, resource.fields));
});

router.get('/:resourceId', getresourceMiddleware, (req, res) => {
    return res.json(helper.modelToBody(req.resource, resource.fields));
});

router.put('/:resourceId', getresourceMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, resource.fields);
    const result = await db.collection('resources').updateOne({
        _id: req.resource._id
    }, {
        $set: {
            ...model,
            modifiedOn: new Date(),
            modifiedBy: req.logged._id
        }
    });
    model = await db.collection('resources').findOne({
        _id: req.resource._id
    });
    return res.status(200).json(helper.modelToBody(model, resource.fields));
});

router.delete('/:resourceId', getresourceMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    await db.collection('resources').deleteOne({
        _id: req.resource._id
    });
    return res.json(helper.modelToBody(req.resource, resource.fields));
});


router.get('/:resourceId/tasks', getresourceMiddleware, async(req, res) => {
    const skip = req.query.offset || 0;
    const take = req.query.size || 20;
    const search = req.query.search || '';
    const db = require('./../components/mongodb').db;
    const result = await db.collection('tasks').find({
        project: req.project._id,
        _id: {
            $in: req.resource.tasks
        }
    }, {
        skip,
        take
    }).toArray();
    return res.json(result.map(doc => helper.modelToBody(doc, resource.fields)));
});

router.post('/:resourceId/tasks/:taskId/link', getTaskMiddleware, getresourceMiddleware, async(req, res) => {
    const task = req.task;
    const resource = req.resource;
    const db = require('./../components/mongodb').db;
    await db.collection('tasks').updateOne({
        _id: task._id
    }, {
        $push: {
            resources: resource._id
        }
    });
    await db.collection('resources').updateOne({
        _id: resource._id
    }, {
        $push: {
            tasks: task._id
        }
    });
    return res.json({});
});

router.delete('/:resourceId/tasks/:taskId', getTaskMiddleware, getresourceMiddleware, async(req, res) => {
    const task = req.task;
    const resource = req.resource;
    const db = require('./../components/mongodb').db;
    await db.collection('tasks').updateOne({
        _id: task._id
    }, {
        $pull: {
            resources: resource._id
        }
    });
    await db.collection('resources').updateOne({
        _id: resource._id
    }, {
        $pull: {
            tasks: task._id
        }
    });
    return res.json({});
});

module.exports = router;