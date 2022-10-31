const db = require('../db/index')

exports.getProjects = (req, res) => {
    const sql = 'select username from fm_users where id=?'
    // req 对象上的 auth 属性，是token解析成功，express-jwt 中间件帮我们挂载上去的
    console.log(req.auth);
    db.query(sql, req.auth.id, (err, results) => {

        if (err) return res.cc(err)
        if (results.length !== 1) return res.cc('获取用户信息失败!')

     
        const username = results[0].username
        let sqlStr = 'SELECT fm_app.username,fm_app.appid, fm_app.appname, fm_app.appdesc FROM fm_app INNER JOIN fm_users ON fm_app.username = fm_users.username WHERE fm_app.username = ?'

        db.query(sqlStr, username , (err, results) => {
            if (err) return res.cc(err)
            return res.send({ status: 0, message: '获取项目信息成功!', data: results })
        })


    })
}

exports.createProject = (req, res) => {
    
    const projectInfo = req.body
    console.log(req.body);


    db.query('select * from fm_app where appid=?', projectInfo.appid, (err, results) => {

        if (err) return res.cc(err)
        if (results.length > 0) return res.cc('项目ID已被占用!')

        const sql = 'select username from fm_users  where id=?'
        db.query(sql, req.auth.id, (err, results) => {

            if (err) return res.cc(err)
            console.log(results);
            const username = results[0].username
            const sqlStr = 'INSERT INTO fm_app set ?'
            db.query(sqlStr, { username: username, appid: projectInfo.appid, appname: projectInfo.appname, appdesc: projectInfo.appdesc }, (err, results) => {

                if (err) return res.cc(err)
                // 判断影响行数是否为1
                if (results.affectedRows !== 1) return res.cc('创建失败，请稍后重试!')
                return res.cc('创建成功!', 0)
            })

        })
    })
   

}


exports.deleteProject = (req, res) => {
    const sqlStr = 'DELETE FROM `fm_app` WHERE appid=?'
    
    console.log(req);
    console.log(req.body);
    db.query(sqlStr, req.body.appid, (err, results) => {

        if (err) return res.cc(err)
        // 判断影响行数是否为1
        if (results.affectedRows !== 1) return res.cc('删除失败，请稍后重试!')
        return res.cc('删除成功!', 0)
    })
}