const express = require('express');
const helper = require('./../models/helper');
const user = require('./../models/user');
const md5 = require('md5');
const ObjectId = require('mongodb').ObjectID;
const getUserMiddleware = require('./../components/get-user-middleware');

const router = express.Router();

router.post('/', async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, user.fields);
    console.log(model);
    model.password = md5(model.password);
    const result = await db.collection('users').insertOne({
        ...model,
        createdOn: new Date()
    });
    model = await db.collection('users').findOne({
        _id: new ObjectId(result.insertedId)
    });
    return res.status(201).location(`/users/${model._id}`).json(helper.modelToBody(model, user.fields));
});

router.get('/:userId/account', getUserMiddleware, (req, res) => {
    return res.json(helper.modelToBody(req.user, user.fields));
});

router.put('/:userId/account', getUserMiddleware, async(req, res) => {
    const db = require('./../components/mongodb').db;
    let model = helper.bodyToModel(req.body, user.fields);
    const result = await db.collection('users').updateOne({
        _id: req.user._id
    }, {
        $set: {
            ...model,
            modifiedOn: new Date(),
        }
    });
    model = await db.collection('users').findOne({
        _id: req.user._id
    });
    return res.status(200).json(helper.modelToBody(model, user.fields));
});

module.exports = router;
