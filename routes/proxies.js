// var express = require('express');
// var router = express.Router();
// var db = require('../repositories/proxies')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { PREFIX_PROXY_PATH } = require('../const')

function addRoute(app, path, options) {
  var middleware = createProxyMiddleware(options)
  app.use(PREFIX_PROXY_PATH + path, function proxy(req, res, next) {
    middleware(req, res, next)
  });
}

function removeRoute(app, path) {
  var routes = app._router.stack;
  routes.forEach(function (route, i, routes) {
    if (route.path === PREFIX_PROXY_PATH + path) {
      routes.splice(i, 1)
    }
  })
}

function proxies(app, db) {
  /* GET users listing. */
  app.route('/proxies-management').get(function(req, res, next) {
    db.all('SELECT * FROM proxies', [], function (err, rows) {
      if (err) {
        res.status(400).json({"error": err.message});
        return;
      }
      res.json({
        "message": "success",
        "data": rows
      })
    })
  }).post(function(req, res, next) {
    const {path, options} = req.body
    db.run('INSERT INTO proxies(path, options) VALUES (?,json(?))', [path, JSON.stringify(options)], function (err, result) {
      if (err) {
        res.status(400).json({'error': err.message});
        return;
      }
      addRoute(app, path, options)
      res.json({'message': 'success'})
    })
  })
  app.route('/proxies-management/:id').delete(function(req, res, next) {
    db.get('SELECT * FROM proxies WHERE id = ?', req.params.id, function (err, result) {
      if (!result) {
        res.status(404).json({'error': 'not found'});
        return;
      }
      removeRoute(app, result.path)
      db.run('DELETE FROM proxies WHERE id = ?', req.params.id, function (err, result) {
        if (err) {
          res.status(400).json({"error": res.message})
          return;
        }
        res.json({"message": "deleted", 'changes': this.changes})
      })
    })
  }).put(function (req, res, next) {
    const {path, options} = req.body
    db.get('SELECT * FROM proxies WHERE id = ?', req.params.id, function (err, result) {
      if (!result) {
        res.status(404).json({'error': 'not found'});
        return;
      }
      removeRoute(app, result.path)
      db.run('UPDATE proxies SET path = ?, options = json(?), updated_at = current_timestamp WHERE id = ?', [path, JSON.stringify(options), req.params.id], function (err, result) {
        if (err) {
          res.status(400).json({"error": res.message})
          return;
        }
        addRoute(app, path, options)
        res.json({"message": "updated", 'changes': this.changes})
      })
    })
  })
}

module.exports = proxies;
