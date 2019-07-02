const express = require('express');
const helper = require('./../models/helper');
const project = require('./../models/project');
const ObjectId = require('mongodb').ObjectID;
const getProjectMiddleware = require('./../components/get-project-middleware');

const router = express.Router();

router.use(require('./../components/auth-middleware'));

router.get('/', async(req, res) => {
    const db = require('./../components/mongodb').db;
    const skip = req.query.offset || 0;
    const take = req.query.size || 20;
    const search = req.query.search || '';
    const result = await db.collection('projects').find({
        users: {
            $all: [req.logged._id]
        }
    }, {
        skip,
        take
    }).toArray();
    return res.json(result.map(doc => helper.modelToBody(doc, project.fields)));
});

router.post('/', async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, project.fields);
    const result = await db.collection('projects').insertOne({
        ...model,
        createdOn: new Date(),
        createdBy: req.logged._id,
        users: [
            req.logged._id
        ]
    });
    model = await db.collection('projects').findOne({
        _id: new ObjectId(result.insertedId)
    });
    return res.status(201).location(`/projects/${model._id}`).json(helper.modelToBody(model, project.fields));
});

router.get('/:projectId', getProjectMiddleware, (req, res) => {
    return res.json(helper.modelToBody(req.project, project.fields));
});

router.put('/:projectId', getProjectMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, project.fields);
    const result = await db.collection('projects').updateOne({
        _id: req.project._id
    }, {
        $set: {
            ...model,
            modifiedOn: new Date(),
            modifiedBy: req.logged._id
        }
    });
    model = await db.collection('projects').findOne({
        _id: req.project._id
    });
    return res.status(200).json(helper.modelToBody(model, project.fields));
});

router.delete('/:projectId', getProjectMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    await db.collection('projects').deleteOne({
        _id: req.project._id
    });
    return res.json(helper.modelToBody(req.project, project.fields));
});
module.exports = router;