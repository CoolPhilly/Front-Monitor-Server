const joi = require('joi')


const projectID = joi.string().pattern(/^[\S]{1,30}$/).required()

const projectname = joi.string().required()

const projectdesc = joi.string().min(0).allow('').allow(null)


exports.create_project_schema = {
    body: {
        appid:projectID,
        appname:projectname,
        appdesc:projectdesc
    }
}
