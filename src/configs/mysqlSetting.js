const { Sequelize } = require('sequelize');
const { db, mysqlUsername, mysqlPassword, host, mysqlPort } = process.env;

const mysql = new Sequelize(db, mysqlUsername, mysqlPassword, {
  host: host,
  dialect: 'mysql',
  port: mysqlPort,
  timestamps: true,
  pool: {
    maxConnections: 10,
    minConnections: 0,
    maxIdleTime: 600000,
    acquire: 600000,
    idle: 600000
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
