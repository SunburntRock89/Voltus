module.exports = async sequelize => {
	const ServerConfigs = global.ServerConfigs = sequelize.define("ServerConfigs", {
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
		leaveEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		// New member message channel
		leaveChannel: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		// New member message
		leaveMessage: {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: "**@member** has left the server. :(",
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

		// Starboard
		starboardEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},

		starboardChannel: {
			type: Sequelize.STRING,
			defaultValue: false,
			allowNull: false,
		},
		starboardCount: {
			type: Sequelize.INTEGER,
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

		// Fun Pack enabled
		funEnabled: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});

	await ServerConfigs.sync();
};
