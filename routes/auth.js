const express = require('express');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/token', async(req, res) => {
    const db = require('./../components/mongodb').db;
    const result = await db.collection('users').findOne({
        email: req.body.email,
        password: md5(req.body.password)
    });
    if (result) {
        const token = jwt.sign({ sub: req.body.email }, 'secret', {
            expiresIn: '2days'
        });
        return res.json(token);
    }
    return res.status(401).json({
        error: 'Bad credentials'
    });
});

module.exports = router;
