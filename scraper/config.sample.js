var config = {};
config.mysql = {};

config.mysql.host = 'localhost';
config.mysql.port = 3306;
config.mysql.user = 'root';
config.mysql.password = 'root';
config.mysql.database = 'cars';
config.mysql.socketPatth = '/var/lib/mysql/mysql.sock';

module.exports = config;