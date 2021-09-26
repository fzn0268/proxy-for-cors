var sqlite3 = require('sqlite3').verbose()

const DBSOURCE_PREFIX = '/var/lib/proxy-cors/'
const DBSOURCE = "db.sqlite"

var db = new sqlite3.Database(DBSOURCE, function (err) {
    if (err) {
        console.error(err)
        throw err
    } else {
        console.info('Connected to database.')
        db.run(`CREATE TABLE IF NOT EXISTS proxies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT NOT NULL UNIQUE,
                options TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                CONSTRAINT path_unique UNIQUE (path)
                )`)
    }
})

module.exports = db