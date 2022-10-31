const express = require('express')
const router = express.Router()
const userinfo_handler = require('../router_handle/userinfo')

// 验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 验证规则对象
const { update_userinfo_schema, update_password_schema} = require('../schema/user')


// 获取用户基本信息
router.get('/userinfo', userinfo_handler.getUserInfo)

// 更新用户基本信息
router.post('/userinfo', expressJoi(update_userinfo_schema), userinfo_handler.updateUserInfo)

// 重置密码
router.post('/updatepwd', expressJoi(update_password_schema), userinfo_handler.updatePassword)


module.exports = router