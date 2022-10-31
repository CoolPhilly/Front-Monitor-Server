const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const avatarCode = require('./defaultavatar')
const util = require('./util')

exports.register = (req, res) => {
    const userinfo = req.body

    const sqlStr = 'select * from fm_users where username=?'

    db.query(sqlStr, userinfo.username, (err, results) => {

        if (err) return res.cc(err)
        if (results.length > 0) return res.cc('用户名已被占用!')


        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        const sql = 'insert into fm_users set ?'
        const baseroutes = '[1001,1002,1003,1004,1006,1007,1008,1009,1010,1011,1012,1014,1016,1017]'
        const defaultavatar = avatarCode.defaultavatar
        db.query(sql, { username: userinfo.username, password: userinfo.password, routes: baseroutes, avatar: defaultavatar, time: util.timestampToTime(Date.now()) }, (err, results) => {

            if (err) return res.cc(err)
            // 判断影响行数是否为1
            if (results.affectedRows !== 1) return res.cc('注册用户失败，请稍后重试!')
            res.cc('注册成功!', 0)
        })


    })
}

exports.login = (req, res) => {
    const userinfo = req.body

    const sql = 'select * from fm_users where username=?'

    db.query(sql, userinfo.username, (err, results) => {

        if (err) return res.cc(err)
        if (results.length !== 1) return res.cc('帐号不存在!')

        // console.log(results);
        //把用户输入的密码和与数据库中的密码进行比较
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)

        if (!compareResult) return res.cc('密码错误!')

        // 剔除密码和头像的值
        const user = { ...results[0], password: '', avatar: '' }

        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        res.send({ status: 0, message: '登录成功!', token: 'Bearer ' + tokenStr })
    })
}

exports.accounts = (req, res) => {

    const sql = 'select username,nickname, time from fm_users '

    db.query(sql, (err, results) => {

        if (err) return res.cc(err)

        return res.send({ status: 0, message: '获取帐号成功!', data: results })
    })
}


// 处理项目上报信息
exports.postProjectInfo = (req, res) => {

    //  第一次见那么长的键  打印在控制台 md我还以为一个字符串对象 浪费时间！！！！！！！！

    //  处理上报数据
    let bodyStr = ''
    Object.keys(req.body).forEach((element) => {
        bodyStr = bodyStr + element + req.body[element]
    })

    let reportData = JSON.parse(bodyStr)
    // console.log(reportData);


    // 延迟上报处理
    if (Array.isArray(reportData)) {

        let errorArr = []
        let behaviorArr = []
        let performanceResource = []
        let performanceRender = []
        let performanceNetwork = []

        for (let index = 0; index < reportData.length - 1; index++) {
            const element = reportData[index];
            if (element.type === 'error') {
                let errorinfo = element.error || element.html || element.reason
                errorArr.push([
                    // uuid
                    reportData[reportData.length - 1].uuid,
                    // appid
                    reportData[reportData.length - 1].appid,
                    // type
                    element.subType,
                    // pageURL
                    element.pageURL,
                    // errorinfo
                    errorinfo,
                    // time
                    util.timestampToTime(reportData[reportData.length - 1].reportTime)
                ])
            }
            else if (element.type === 'behavior') {
                behaviorArr.push([
                    // uuid
                    reportData[reportData.length - 1].uuid,
                    // appid
                    reportData[reportData.length - 1].appid,
                    // type
                    element.subType,
                    // form
                    element.from || element.referrer,
                    // to
                    element.to || element.pageURL,
                    // start
                    element.startTime,

                    // time
                    util.timestampToTime(reportData[reportData.length - 1].reportTime)
                ])
            }
            else if (element.type === 'performance') {
                if (element.subType === 'resource' || element.subType === 'navigation') {
                    performanceResource.push([
                        // uuid
                        reportData[reportData.length - 1].uuid,
                        // appid
                        reportData[reportData.length - 1].appid,
                        // subType
                        element.subType,
                        // sourceType
                        element.sourceType,
                        // url
                        element.name,
                        // protocol
                        element.protocol,
                        // dns
                        element.dns,
                        //duration
                        element.duration,
                        // redirect
                        element.redirect,
                        // tcp
                        element.tcp,
                        // ttfb
                        element.ttfb,
                        // time
                        util.timestampToTime(reportData[reportData.length - 1].reportTime)
                    ])
                }
                else if (element.subType === 'xhr' || element.subType === 'fetch') {
                    performanceNetwork.push([
                        // uuid
                        reportData[reportData.length - 1].uuid,
                        // appid
                        reportData[reportData.length - 1].appid,
                        // type
                        element.subType,

                        // url
                        element.url,
                        // status
                        element.status,
                        //duration
                        element.duration,
                        // method
                        element.method,
                        // time
                        util.timestampToTime(element.startTime)
                    ])
                }
                else {
                    performanceRender.push([
                        // uuid
                        reportData[reportData.length - 1].uuid,
                        // appid
                        reportData[reportData.length - 1].appid,
                        // type
                        element.subType,

                        // pageURL
                        element.pageURL,
                        //duration
                        element.startTime,
                        // time
                        util.timestampToTime(reportData[reportData.length - 1].reportTime)
                    ])
                }
            }
        }
        // 判断数据是否储存完毕,好了告诉浏览器关闭请求
        let alllength = errorArr.length + behaviorArr.length + performanceResource.length + performanceRender.length + performanceNetwork.length

        if (errorArr.length) {
            const sql = 'INSERT INTO fm_app_error(uuid, appid, type, pageURL,errorinfo,time)VALUES ?'
            // console.log(errorArr);
            db.query(sql, [errorArr], (err, results) => {
                if (err) return res.write(err.message)
                // 判断影响行数是否为正确
                if (results.affectedRows !== errorArr.length) return res.write('errorArr fail!')
                res.write('errorArr success!')
                alllength = alllength - errorArr.length
                if (alllength === 0) res.end('AllSUCESS')
            })

        }

        if (behaviorArr.length) {
            const sqlstr = 'INSERT INTO fm_app_user(uuid, appid, type, `from`, `to`, start ,time)   VALUES ?'
            // console.log(behaviorArr);
            db.query(sqlstr, [behaviorArr], (err, results) => {
                if (err) return res.write(err.message)
                // 判断影响行数是否为正确
                if (results.affectedRows !== behaviorArr.length) return res.write('behaviorArr fail!')
                res.write('behaviorArr success!')
                alllength = alllength - behaviorArr.length
                if (alllength === 0) res.end('AllSUCESS')
            })

        }


        if (performanceResource.length) {
            const sqlstr = 'INSERT INTO fm_app_performance_resource(uuid, appid, subType, sourceType, url, protocol,dns,duration,redirect,tcp,ttfb ,time)  VALUES ?'

            db.query(sqlstr, [performanceResource], (err, results) => {
                if (err) return res.write(err.message)
                // 判断影响行数是否为正确
                if (results.affectedRows !== performanceResource.length) return res.write('performanceResource fail!')
                res.write('performanceResource success!')
                alllength = alllength - performanceResource.length
                if (alllength === 0) res.end('AllSUCESS')
            })

        }
        // console.log(performanceRender);
        if (performanceRender.length) {
            const sqlstr = 'INSERT INTO fm_app_performance_render(uuid, appid, type, pageURL, duration,time)  VALUES ?'

            db.query(sqlstr, [performanceRender], (err, results) => {
                if (err) return res.write(err.message)
                // 判断影响行数是否为正确
                if (results.affectedRows !== performanceRender.length) return res.write('performanceRender fail!')

                res.write('performanceRender success!')
                alllength = alllength - performanceRender.length
                if (alllength === 0) res.end('AllSUCESS')
            })

        }
        if (performanceNetwork.length) {
            const sqlstr = 'INSERT INTO fm_app_performance_network(uuid, appid, type, url, status, duration,method ,time)   VALUES ?'
            // console.log(behaviorArr);
            db.query(sqlstr, [performanceNetwork], (err, results) => {
                if (err) return res.write(err.message)
                // 判断影响行数是否为正确
                if (results.affectedRows !== performanceNetwork.length) return res.write('performanceNetwork fail!')

                res.write('performanceNetwork success!')
                alllength = alllength - performanceNetwork.length
                if (alllength === 0) res.end('AllSUCESS')
            })

        }


    }
    // 及时上报处理
    else {
        if (reportData.type === 'error') {
            let errorinfo = reportData.error || reportData.html || reportData.reason
            // console.log(reportData.subType);
            const sql = 'INSERT INTO fm_app_error set ?'


            db.query(sql, { uuid: reportData.uuid, appid: reportData.appid, type: reportData.subType, pageURL: reportData.pageURL, errorinfo: errorinfo, time: util.timestampToTime(reportData.reportTime) }, (err, results) => {

                if (err) return res.send(err)
                // 判断影响行数是否为正确
                if (results.affectedRows !== 1) return res.send('发送失败!')
                return res.send('发送成功!')

            })
        }

        else if (reportData.type === 'behavior') {

            const sql = 'INSERT INTO fm_app_user set ?'
            // console.log(reportData);

            db.query(sql, { uuid: reportData.uuid, appid: reportData.appid, type: reportData.subType, from: reportData.referrer || reportData.from, to: reportData.to || reportData.pageURL, start: reportData.startTime, time: util.timestampToTime(reportData.reportTime) }, (err, results) => {

                if (err) return res.send(err)
                // 判断影响行数是否为正确
                if (results.affectedRows !== 1) return res.send('发送失败!')
                return res.send('发送成功!')

            })

        }

        else if (reportData.type === 'performance') {
            if (reportData.subType === 'resource' || reportData.subType === 'navigation') {
                let parms = {
                    // uuid
                    uuid: reportData.uuid,
                    // appid
                    appid: reportData.appid,
                    // subType
                    subType: reportData.subType,
                    // sourceType
                    sourceType: reportData.sourceType,
                    // url
                    url: reportData.name,
                    // protocol
                    protocol: reportData.protocol,
                    // dns
                    dns: reportData.dns,
                    //duration
                    duration: reportData.duration,
                    // redirect
                    redirect: reportData.redirect,
                    // tcp
                    tcp: reportData.tcp,
                    // ttfb
                    ttfb: reportData.ttfb,
                    // time
                    time: util.timestampToTime(reportData.reportTime)
                }



                const sql = 'INSERT INTO fm_app_performance_resource set ?'
                // console.log(reportData);

                db.query(sql, parms, (err, results) => {

                    if (err) return res.send(err)
                    // 判断影响行数是否为正确
                    if (results.affectedRows !== 1) return res.send('发送失败!')
                    return res.send('发送成功!')

                })


            }
            else if (reportData.subType === 'xhr' || reportData.subType === 'fetch') {
                let parms = {
                    // uuid
                    uuid: reportData.uuid,
                    // appid
                    appid: reportData.appid,
                    // type
                    type: reportData.subType,

                    // url
                    url: reportData.url,
                    // status
                    status: reportData.status,
                    //duration
                    duration: reportData.duration,
                    // method
                    method: reportData.method,
                    // time
                    time: util.timestampToTime(reportData.startTime)
                }
                const sql = 'INSERT INTO fm_app_performance_network set ?'
                // console.log(reportData);

                db.query(sql, parms, (err, results) => {

                    if (err) return res.send(err)
                    // 判断影响行数是否为正确
                    if (results.affectedRows !== 1) return res.send('发送失败!')
                    return res.send('发送成功!')

                })

            }
            else {
                let parms = {
                    // uuid
                    uuid: reportData.uuid,
                    // appid
                    appid: reportData.appid,
                    // type
                    type: reportData.subType,

                    // pageURL
                    pageURL: reportData.pageURL,
                    //duration
                    duration: reportData.startTime,
                    // time
                    time: util.timestampToTime(reportData.reportTime)
                }

                const sql = 'INSERT INTO fm_app_performance_render set ?'
                // console.log(reportData);

                db.query(sql, parms, (err, results) => {

                    if (err) return res.send(err)
                    // 判断影响行数是否为正确
                    if (results.affectedRows !== 1) return res.send('发送失败!')
                    return res.send('发送成功!')

                })


            }


        }

    }
}
