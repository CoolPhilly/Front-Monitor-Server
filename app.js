const express = require('express')
const cors = require('cors')
const userRouter = require('./router/user')
const userinfoRouter = require('./router/userinfo')
const projectRouter = require('./router/project')
const projectinfoRouter = require('./router/projectinfo')
const joi = require('joi')
const { expressjwt: expressJWT } = require("express-jwt")
const config = require('./config')

const app = express()


 // 配置跨域
 app.use(cors({
    // 允许跨域的服务器地址,可以写多个
     origin: ['http://localhost:5501', 'http://127.0.0.1:5501', 'http://localhost:5173', 'http://127.0.0.1:5173','http://192.168.0.101:5173' ],
    // 使用cookie时需要设置为true
    credentials: true
}));


// app.use(express.static('./views'))

// 配置解析表单数据的中间件,只能解析application/ x-www-form-urlencoded格式
app.use(express.urlencoded({ limit:'50mb', extended: false }))

// 响应数据的中间件
app.use(function (req, res, next) {
    // status = 0 为成功 | 1 为失败
    res.cc = function (err, status = 1) {
        res.send({ status, message: err instanceof Error ? err.message : err })
    }
    next()
})

// 解析token
app.use(expressJWT({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/api/] }))

app.use('/api', userRouter)

app.use('/my', userinfoRouter)

app.use('/my', projectRouter)

app.use('/my', projectinfoRouter)

// 错误级别中间件
app.use((err, req, res, next) => {
    // 验证失败导致的错误
    if (err instanceof joi.ValidationError) return res.cc(err)
    // token 身份认证失败
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败!')
    // 未知错误
    res.send(err)
})


app.listen(3000, () => console.log(`Example app listening on http://127.0.0.1:3000/`))