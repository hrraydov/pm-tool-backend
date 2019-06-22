const bodyToModel = (body, fields) => {
    const result = {};
    Object.keys(fields).forEach(fieldName => {
        result[fieldName] = body[fieldName];
    })
    return result;
};

const modelToBody = (model, fields) => {
    const result = {};
    Object.keys(fields).forEach(fieldName => {
        if (!fields[fieldName].hide) {
            result[fieldName] = model[fieldName];
        }
    })
    result.id = model._id;
    result.createdOn = model.createdOn;
    result.createdBy = model.createdBy;
    result.modifiedOn = model.modifiedOn;
    result.modifiedBy = model.modifiedBy;
    return result;
};

module.exports = {
    bodyToModel,
    modelToBody
};