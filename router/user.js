const express = require('express')
const router = express.Router()
const user_handle = require('../router_handle/user')
// 验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 验证规则对象
const { reg_login_schema } = require('../schema/user')


// 注册
router.post('/register', expressJoi(reg_login_schema), user_handle.register)

// 登录
router.post('/login', expressJoi(reg_login_schema), user_handle.login)

// 获取所有帐号信息
router.get('/accounts', user_handle.accounts)


// 处理项目上报信息
router.post('/tracker', user_handle.postProjectInfo)

module.exports = router