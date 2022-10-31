const express = require('express')
const router = express.Router()
const project_handler = require('../router_handle/project')

// 验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 验证规则对象
const { create_project_schema } = require('../schema/project')


// 获取项目基本信息
router.get('/project', project_handler.getProjects)


// 创建项目
router.post('/project', expressJoi(create_project_schema), project_handler.createProject)

// 删除项目
router.delete('/project', project_handler.deleteProject)


module.exports = router