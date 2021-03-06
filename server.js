const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const mongodb = require('./components/mongodb');
mongodb.connect();

app.use(bodyParser.json());

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/user'));
app.use('/projects', require('./routes/project'));
app.use('/projects/:projectId/tasks', require('./routes/task'));
app.use('/projects/:projectId/resources', require('./routes/resource'));
app.use('/projects/:projectId/budgets', require('./routes/budget'));
app.get('/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

app.get('/test', (req, res) => {
    res.json();
});

app.listen(3000, () => {
    console.log('App listens on port 3000');
});
