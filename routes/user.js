const express = require('express');
const helper = require('./../models/helper');
const user = require('./../models/user');
const md5 = require('md5');
const ObjectId = require('mongodb').ObjectID;

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

router.get('/', async(req, res) => {

});

module.exports = router;