const express = require('express');
const helper = require('./../models/helper');
const budget = require('./../models/budget');
const ObjectId = require('mongodb').ObjectID;
const getBudgetMiddleware = require('./../components/get-budget-middleware');
const getTaskMiddleware = require('./../components/get-task-middleware');
const getResourceMiddleware = require('./../components/get-resource-middleware');
const router = express.Router({ mergeParams: true });

router.use(require('./../components/auth-middleware'));
router.use(require('./../components/get-project-middleware'));

router.get('/', async(req, res) => {
    console.log(req.params);
    const db = require('./../components/mongodb').db;
    const skip = req.query.offset || 0;
    const take = req.query.size || 20;
    const search = req.query.search || '';
    const result = await db.collection('budgets').find({
        project: req.project._id
    }, {
        skip,
        take
    }).toArray();
    return res.json(result.map(doc => helper.modelToBody(doc, budget.fields)));
});

router.post('/', async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, budget.fields);
    const result = await db.collection('budgets').insertOne({
        ...model,
        createdOn: new Date(),
        createdBy: req.logged._id,
        project: req.project._id,
    });
    model = await db.collection('budgets').findOne({
        _id: new ObjectId(result.insertedId)
    });
    return res.status(201).location(`/projects/${req.project._id}/budgets/${model._id}`).json(helper.modelToBody(model, budget.fields));
});

router.get('/:budgetId', getBudgetMiddleware, (req, res) => {
    return res.json(helper.modelToBody(req.budget, budget.fields));
});

router.put('/:budgetId', getBudgetMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, budget.fields);
    const result = await db.collection('budgets').updateOne({
        _id: req.budget._id
    }, {
        $set: {
            ...model,
            modifiedOn: new Date(),
            modifiedBy: req.logged._id
        }
    });
    model = await db.collection('budgets').findOne({
        _id: req.budget._id
    });
    return res.status(200).json(helper.modelToBody(model, budget.fields));
});

router.delete('/:budgetId', getBudgetMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    await db.collection('budgets').deleteOne({
        _id: req.budget._id
    });
    return res.json(helper.modelToBody(req.budget, budget.fields));
});

router.get('/:budgetId/tasks', getBudgetMiddleware, async(req, res) => {
    const skip = req.query.offset || 0;
    const take = req.query.size || 20;
    const search = req.query.search || '';
    const db = require('./../components/mongodb').db;
    const result = await db.collection('tasks').find({
        project: req.project._id,
        _id: {
            $in: req.budget.tasks
        }
    }, {
        skip,
        take
    }).toArray();
    return res.json(result.map(doc => helper.modelToBody(doc, budget.fields)));
});

router.post('/:budgetId/tasks/:taskId/link', getBudgetMiddleware, getTaskMiddleware, async(req, res) => {
    const budget = req.budget;
    const task = req.task;
    const db = require('./../components/mongodb').db;
    await db.collection('budgets').updateOne({
        _id: budget._id
    }, {
        $push: {
            tasks: task._id
        }
    });
    await db.collection('tasks').updateOne({
        _id: task._id
    }, {
        $push: {
            budgets: budget._id
        }
    });
    return res.json({});
});

router.delete('/:budgetId/tasks/:taskId', getBudgetMiddleware, getTaskMiddleware, async(req, res) => {
    const budget = req.budget;
    const task = req.task;
    const db = require('./../components/mongodb').db;
    await db.collection('budgets').updateOne({
        _id: budget._id
    }, {
        $pull: {
            tasks: task._id
        }
    });
    await db.collection('tasks').updateOne({
        _id: task._id
    }, {
        $pull: {
            budgets: budget._id
        }
    });
    return res.json({});
});

router.get('/:budgetId/resources', getBudgetMiddleware, async(req, res) => {
    const skip = req.query.offset || 0;
    const take = req.query.size || 20;
    const search = req.query.search || '';
    const db = require('./../components/mongodb').db;
    console.log(req.budget.resources);
    const result = await db.collection('resources').find({
        project: req.project._id,
        _id: {
            $in: req.budget.resources
        }
    }, {
        skip,
        take
    }).toArray();
    return res.json(result.map(doc => helper.modelToBody(doc, budget.fields)));
});

router.post('/:budgetId/resources/:resourceId/link', getBudgetMiddleware, getResourceMiddleware, async(req, res) => {
    const budget = req.budget;
    const resource = req.resource;
    const db = require('./../components/mongodb').db;
    await db.collection('budgets').updateOne({
        _id: budget._id
    }, {
        $push: {
            resources: resource._id
        }
    });
    await db.collection('resources').updateOne({
        _id: resource._id
    }, {
        $push: {
            budgets: budget._id
        }
    });
    return res.json({});
});

router.delete('/:budgetId/resources/:resourceId', getBudgetMiddleware, getResourceMiddleware, async(req, res) => {
    const budget = req.budget;
    const resource = req.resource;
    const db = require('./../components/mongodb').db;
    await db.collection('budgets').updateOne({
        _id: budget._id
    }, {
        $pull: {
            resources: resource._id
        }
    });
    await db.collection('resources').updateOne({
        _id: resource._id
    }, {
        $pull: {
            budgets: budget._id
        }
    });
    return res.json({});
});

module.exports = router;

