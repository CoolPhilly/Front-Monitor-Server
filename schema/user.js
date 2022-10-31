const joi = require('joi')

const username = joi.string().alphanum().min(3).max(12).required()// 用户名是最小长度为3最大长度为12的只能是包含a-z A-Z 0-9 的字符串

const password = joi.string().pattern(/^[\S]{6,15}$/).required()// 6-15位且中间不包含空格

// const id = joi.number().integer().min(1).required()

const nickname = joi.string().required()

// data:image/png;base64,VE9PTUFOWVNFQ1JFVFN=
const avatar = joi.string().dataUri()

exports.reg_login_schema = {
    // 表示需要对 req.body 中的数据进行验证
    body: {
        username,
        password
    }
}

exports.update_userinfo_schema = {
    body: {
        nickname,
        avatar
    }
}

exports.update_password_schema = {
    body: {
        oldPwd: password,
        newPwd: joi.not(joi.ref('oldPwd')).concat(password)
    }
}
