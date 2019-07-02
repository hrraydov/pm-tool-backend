const express = require('express');
const helper = require('./../models/helper');
const task = require('./../models/task');
const ObjectId = require('mongodb').ObjectID;
const getTaskMiddleware = require('./../components/get-task-middleware');
const getResourceMiddleware = require('./../components/get-resource-middleware');
const getBudgetMiddleware = require('./../components/get-budget-middleware');
const router = express.Router({ mergeParams: true });

router.use(require('./../components/auth-middleware'));
router.use(require('./../components/get-project-middleware'));

router.get('/', async(req, res) => {
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

router.delete('/:taskId', getTaskMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    await db.collection('tasks').deleteOne({
        _id: req.task._id
    });
    return res.json(helper.modelToBody(req.task, task.fields));
});

router.get('/:taskId/resources', getTaskMiddleware, async(req, res) => {
    const skip = req.query.offset || 0;
    const take = req.query.size || 20;
    const search = req.query.search || '';
    const db = require('./../components/mongodb').db;
    console.log(req.task.resources);
    let result = [];
    if (req.task.resources) {
        result = await db.collection('resources').find({
            project: req.project._id,
            _id: {
                $in: req.task.resources
            }
        }, {
            skip,
            take
        }).toArray();
    }
    return res.json(result.map(doc => helper.modelToBody(doc, task.fields)));
});

router.post('/:taskId/resources/:resourceId/link', getTaskMiddleware, getResourceMiddleware, async(req, res) => {
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

router.delete('/:taskId/resources/:resourceId', getTaskMiddleware, getResourceMiddleware, async(req, res) => {
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


router.get('/:taskId/budgets', getTaskMiddleware, async(req, res) => {
    const skip = req.query.offset || 0;
    const take = req.query.size || 20;
    const search = req.query.search || '';
    const db = require('./../components/mongodb').db;
    console.log(req.task.budgets);
    const result = await db.collection('budgets').find({
        project: req.project._id,
        _id: {
            $in: req.task.budgets
        }
    }, {
        skip,
        take
    }).toArray();
    return res.json(result.map(doc => helper.modelToBody(doc, task.fields)));
});

router.post('/:taskId/budgets/:budgetId/link', getTaskMiddleware, getBudgetMiddleware, async(req, res) => {
    const task = req.task;
    const budget = req.budget;
    const db = require('./../components/mongodb').db;
    await db.collection('tasks').updateOne({
        _id: task._id
    }, {
        $push: {
            budgets: budget._id
        }
    });
    await db.collection('budgets').updateOne({
        _id: budget._id
    }, {
        $push: {
            tasks: task._id
        }
    });
    return res.json({});
});

router.delete('/:taskId/budgets/:budgetId', getTaskMiddleware, getBudgetMiddleware, async(req, res) => {
    const task = req.task;
    const budget = req.budget;
    const db = require('./../components/mongodb').db;
    await db.collection('tasks').updateOne({
        _id: task._id
    }, {
        $pull: {
            budgets: budget._id
        }
    });
    await db.collection('budgets').updateOne({
        _id: budget._id
    }, {
        $pull: {
            tasks: task._id
        }
    });
    return res.json({});
});

module.exports = router;