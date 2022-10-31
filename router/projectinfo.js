const express = require('express')
const router = express.Router()
const projectinfo_handler = require('../router_handle/projectinfo')



// 获取项目错误信息
router.post('/projecterrorinfo', projectinfo_handler.getProjectErrorInfo)

// 获取项目性能网络信息
router.post('/projectperformanceinfo/network', projectinfo_handler.getProjectNetworkInfo)

// 获取项目性能渲染信息
router.post('/projectperformanceinfo/render', projectinfo_handler.getProjectRenderInfo)

// 获取项目性能资源信息
router.post('/projectperformanceinfo/resource', projectinfo_handler.getProjectResourceInfo)

// 获取项目用户信息
router.post('/projectuserinfo', projectinfo_handler.getProjectUserInfo)

module.exports = router