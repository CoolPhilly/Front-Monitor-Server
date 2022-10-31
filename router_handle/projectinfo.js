const db = require('../db/index')


// 获取项目错误信息
exports.getProjectErrorInfo = (req, res) => {
    const sql = 'select * from fm_app_error where appid = ? and time>= ? and time <= ?'
    console.log(req.body);

    db.query(sql, [req.body.appid, req.body.starttime, req.body.endtime] , (err, results) => {

        if (err) return res.cc(err)

        return res.send({ status: 0, message: '获取项目信息成功!', data: results })

        

    })
}

// 获取项目性能网络信息

exports.getProjectNetworkInfo = (req, res) => {
    const sql = 'select * from fm_app_performance_network where appid = ? and time>= ? and time <= ?'
    console.log(req.body);

    db.query(sql, [req.body.appid, req.body.starttime, req.body.endtime], (err, results) => {

        if (err) return res.cc(err)

        return res.send({ status: 0, message: '获取项目信息成功!', data: results })



    })
}

// 获取项目性能渲染信息

exports.getProjectRenderInfo = (req, res) => {
    const sql = 'select * from fm_app_performance_render where appid = ? and time>= ? and time <= ?'
    console.log(req.body);

    db.query(sql, [req.body.appid, req.body.starttime, req.body.endtime], (err, results) => {

        if (err) return res.cc(err)

        return res.send({ status: 0, message: '获取项目信息成功!', data: results })



    })
}

// 获取项目性能资源信息

exports.getProjectResourceInfo = (req, res) => {
    const sql = 'select * from fm_app_performance_resource where appid = ? and time>= ? and time <= ?'
    console.log(req.body);

    db.query(sql, [req.body.appid, req.body.starttime, req.body.endtime], (err, results) => {

        if (err) return res.cc(err)

        return res.send({ status: 0, message: '获取项目信息成功!', data: results })



    })
}

// 获取项目用户信息

exports.getProjectUserInfo = (req, res) => {
    const sql = 'select * from fm_app_user where appid = ? and time>= ? and time <= ?'
    console.log(req.body);

    db.query(sql, [req.body.appid, req.body.starttime, req.body.endtime], (err, results) => {

        if (err) return res.cc(err)

        return res.send({ status: 0, message: '获取项目信息成功!', data: results })



    })
}