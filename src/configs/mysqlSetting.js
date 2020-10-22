const { Sequelize } = require('sequelize');
const { db, username, password, host, mysqlPort } = process.env;

const mysql = new Sequelize(db, username, password, {
  host: host,
  dialect: 'mysql',
  port: mysqlPort,
  timestamps: true,
  pool: {
    maxConnections: 10,
    minConnections: 0,
    maxIdleTime: 30000
  },
  dialectOptions: {
    // socketPath: '',
    // ssl: {
    //   key: fs.readFileSync(path.join(__dirname, keyPath)),
    //   cert: fs.readFileSync(path.join(__dirname, certPath)),
    //   ca: fs.readFileSync(path.join(__dirname, caPath)),
    //   connectTimeout: 60000
    // }
  },
  logging: false,
  timezone: '+08:00'
});

module.exports = { mysql };
