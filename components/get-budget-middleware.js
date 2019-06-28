const ObjectId = require('mongodb').ObjectID;

const getBudgetMiddleware = async(req, res, next) => {
    const id = req.params.budgetId;
    const db = require('./../components/mongodb').db;
    const budget = await db.collection('budgets').findOne({
        _id: new ObjectId(id)
    });
    if (!budget) {
        return res.status(404).json({
            error: 'budget Not Found'
        });
    }
    if (budget.project.toString() !== req.project._id.toString()) {
        return res.status(400).json({
            error: 'budget not part of this project'
        });
    }
    req.budget = budget;
    return next();
};

module.exports = getBudgetMiddleware;
