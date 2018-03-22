const auth = require("../Configuration/auth.json");

const Sequelize = require("sequelize");
const mysql = require("mysql2/promise");

module.exports = async sequelize => {
	const connection = await mysql.createConnection({ host: auth.db.host, user: auth.db.user, password: auth.db.pwd });
	await connection.execute(`CREATE DATABASE IF NOT EXISTS ${auth.db.name};`);
	await connection.close();

	const ServerConfigs = sequelize.define("ServerConfigs", {
		id: {
			type: Sequelize.STRING,
			allowNull: false,
			primaryKey: true,
		},
		prefix: {
			type: Sequelize.STRING(10),
			allowNull: true,
			defaultValue: "-",
		},
		muteEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		muteRole: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		newMemberEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		newMemberChannel: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		agreeEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		agreeChannel: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		agreeRole: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		kickConfirms: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
		banConfirms: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
		ownerEndsGiveaway: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		nukeLimit: {
			type: Sequelize.INTEGER,
			defaultValue: 100,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});

	const Strikes = sequelize.define("Strikes", {
		id: {
			type: Sequelize.STRING,
			allowNull: false,
			primaryKey: true,
		},
		guild: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		offender: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		creator: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		reason: {
			type: Sequelize.STRING,
			allowNull: true,
		},
	}, {
		timestamps: false,
	});

	const Admins = sequelize.define("Admins", {
		id: {
			type: Sequelize.STRING,
			allowNull: true,
			primaryKey: true,
		},
		/* How admin levels work
			1: Strike
			2: Kick ^
			3: Ban ^
			4: Config, hackban and unban ^
			5: Maintainers ^
		*/
		serverID: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		level: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
	});

	const Giveaways = sequelize.define("Giveaways", {
		id: {
			type: Sequelize.STRING,
			allowNull: true,
			primaryKey: true,
		},
		owner: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		created: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		serverID: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		winnerMsg: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		status: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
		allowReroll: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
		winner: {
			type: Sequelize.STRING,
			allowNull: true,
		},
	});

	const GiveawayParticipants = sequelize.define("GiveawayParticipants", {
		giveawayID: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		guildID: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		userID: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	});

	global.ServerConfigs = ServerConfigs;
	global.Strikes = Strikes;
	global.Admins = Admins;
	global.Giveaways = Giveaways;
	global.GiveawayParticipants = GiveawayParticipants;

	ServerConfigs.sync();
	Strikes.sync();
	Admins.sync();
	Giveaways.sync();
	GiveawayParticipants.sync();
};
