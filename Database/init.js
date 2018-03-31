const auth = require("../Configuration/auth.json");

const Sequelize = require("sequelize");
const mysql = require("mysql2/promise");

module.exports = async sequelize => {
	const connection = await mysql.createConnection({ host: auth.db.host, user: auth.db.user, password: auth.db.pwd });
	await connection.execute(`CREATE DATABASE IF NOT EXISTS ${auth.db.name};`);
	await connection.close();

	const ServerConfigs = sequelize.define("ServerConfigs", {
		// Server ID
		id: {
			type: Sequelize.STRING,
			allowNull: false,
			primaryKey: true,
		},
		// Prefix
		prefix: {
			type: Sequelize.STRING(10),
			allowNull: true,
			defaultValue: "-",
		},
		// Mute command enabled
		muteEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		// Mute role
		muteRole: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		// New member message enabled
		newMemberEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		// New member message channel
		newMemberChannel: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		// New member message
		newMemberMessage: {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: "Please welcome @mention to **@guild**!",
		},
		// Agree enabled
		agreeEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		// Agree channel
		agreeChannel: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		// Agree role
		agreeRole: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		// Are you sure you want to kick?
		kickConfirms: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
		// Are you sure you want to ban?
		banConfirms: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
		// If only the giveaway owner can end giveaways
		ownerEndsGiveaway: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		// Nuke max message count
		nukeLimit: {
			type: Sequelize.INTEGER,
			defaultValue: 100,
			allowNull: false,
		},
		// IP Filter enabled
		ipFilter: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
		// Should the IP filter strike?
		ipFilterStrike: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		// Raid Mode enabled
		raidMode: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},

		// Packs

		// Moderation Pack enabled
		moderationEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
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
		timestamps: true,
	});

	const Admins = sequelize.define("Admins", {
		userID: {
			type: Sequelize.STRING,
			allowNull: true,
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
			allowNull: false,
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
