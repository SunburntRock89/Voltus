const auth = require("../Configuration/auth.json");

const Sequelize = require("sequelize");
const mysql = require("mysql2/promise");

module.exports = async(client, sequelize) => {
	const connection = await mysql.createConnection({ host: auth.db.host, user: auth.db.user, password: auth.db.pwd });
	await connection.execute(`CREATE DATABASE IF NOT EXISTS ${auth.db.name};`);
	await connection.close();

	const ServerConfigs = sequelize.define("ServersConfigs", {
		id: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
		// Prefix
		prefix: { type: Sequelize.STRING, defaultValue: "!" },
		// Agree
		agreeEnabled: { type: Sequelize.BOOLEAN, defaultValue: false },
		agreeChannel: { type: Sequelize.STRING, allowNull: true },
		// New Member
		newMemberEnabled: { type: Sequelize.BOOLEAN, defaultValue: false },
		newMemberMessage: { type: Sequelize.STRING, allowNull: true },
	});

	const Strikes = sequelize.define("Strikes", {
		id: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
		offender: { type: Sequelize.STRING, allowNull: false },
		creator: { type: Sequelize.STRING, allowNull: false },
		reason: { type: Sequelize.STRING, allowNull: false },
	});

	const Admins = sequelize.define("Admins", {
		// This is the Admin's ID
		id: { type: Sequelize.STRING, allowNull: false },
		// Server's ID
		serverID: { type: Sequelize.STRING, allowNull: false },
		level: { type: Sequelize.INTEGER, allowNull: false },
	});

	global.ServerConfigs = ServerConfigs;
	global.Strikes = Strikes;
	global.Admins = Admins;

	sequelize.sync();
};
