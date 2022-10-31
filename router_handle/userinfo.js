const db = require('../db/index')
const bcrypt = require('bcryptjs')

exports.getUserInfo = (req, res) => {
    const sql = 'select id, username, nickname, avatar, routes from fm_users where id=?'
    // req 对象上的 auth 属性，是token解析成功，express-jwt 中间件帮我们挂载上去的
    console.log(req.auth);
    db.query(sql, req.auth.id, (err, results) => {

        if (err) return res.cc(err)
        if (results.length !== 1) return res.cc('获取用户信息失败!')

        //根据id获取权限id
        const routesId = JSON.parse(results[0].routes)
        let sqlStr = 'SELECT * FROM fm_routes where id = ' + routesId[0]
        for (let i = 1; i < routesId.length; i++) {
            sqlStr = sqlStr + ' or id =' + routesId[i];
        }
        const uesrData = results[0]

        db.query(sqlStr, (err, results) => {
            const routes = arrayToMenu(results)
            uesrData.routes = routes
            return res.send({ status: 0, message: '获取用户信息成功!', data: uesrData })
        })


    })
}

exports.updateUserInfo = (req, res) => {
    const sql = 'update fm_users set ? where id=?'

    // console.log(req.body);
    db.query(sql, [req.body, req.auth.id], (err, results) => {

        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('修改用户基本信息失败!')

        return res.cc('修改用户基本信息成功!', 0)
    })
}

exports.updatePassword = (req, res) => {
    const sql = 'select * from fm_users where id=?'

    db.query(sql, req.auth.id, (err, results) => {

        if (err) return res.cc(err)
        if (results.length !== 1) return res.cc('用户不存在!')

        const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)

        if (!compareResult) return res.cc('原密码密码错误!')
        const sqlStr = 'update fm_users set password=? where id=?'
        const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

        db.query(sqlStr, [newPwd, req.auth.id], (err, results) => {

            if (err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc('更新密码失败!')

            res.cc('更新密码成功!', 0)
        })
    })
}


function exists(rows, parentId) {
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].id === parentId) return true
    }
    return false
}

function arrayToMenu(array) {
    const nodes = []
    // 获取顶级节点
    for (let i = 0; i < array.length; i++) {
        const row = array[i]
        // 这个exists方法就是判断下有没有子级
        if (!exists(array, row.parentId)) {
            nodes.push({
                id: row.id,
                path: row.path,
                component: row.component,
                meta: { title: row.title, icon: row.icon },
                redirect: row.redirect
            })
        }
    }
    const toDo = Array.from(nodes)
    while (toDo.length) {
        const node = toDo.shift()
        // 获取子节点
        for (let i = 0; i < array.length; i++) {
            const row = array[i]
            // parentId等于哪个父级的id，就push到哪个
            if (row.parentId === node.id) {
                const child = {
                    path: row.path,
                    name: row.name,
                    component: row.component,
                    meta: { ptitle: node.meta.title, title: row.title, icon: row.icon },
                }
                if (node.children) {
                    node.children.push(child)
                } else {
                    node.children = [child]
                }
            }
        }
    }
    return nodes
}
