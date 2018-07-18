module.exports = async sequelize => {
	const GiveawayParticipants = global.GiveawayParticipants = sequelize.define("GiveawayParticipants", {
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

	await GiveawayParticipants.sync();
};
