var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const { PREFIX_PROXY_PATH } = require('./const')

var indexRouter = require('./routes/index');
var proxiesRouter = require('./routes/proxies');

var db = require('./repositories/db')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
proxiesRouter(app, db);
// app.use('/proxy/smps-test', createProxyMiddleware({ target: 'https://smps-test.sgmwsales.com:8443', changeOrigin: true, pathRewrite: { '^/proxy/smps-test': '' } }));
// app.use('/proxy/sipswitches/50', createProxyMiddleware({ target: 'https://50.sipswitches.com/fiveUrl', changeOrigin: true, pathRewrite: { '^/proxy/sipswitches/50': '' } }));
// app.use('/proxy/sipswitches/4s', createProxyMiddleware({ target: 'https://4s.sipswitches.com/cac_cloud', changeOrigin: true, pathRewrite: { '^/proxy/sipswitches/4s': '' } }));
db.all('SELECT * FROM proxies', [], function (err, rows) {
    if (err) {
        console.info("welcome, startup first time, no proxy set");
        return;
    }
    rows.forEach(function (row) {
        var middleware = createProxyMiddleware(JSON.parse(row.options))
        app.use(PREFIX_PROXY_PATH + row.path, function proxy(req, res, next) {
            middleware(req, res, next)
        })
    })
})

module.exports = app;
