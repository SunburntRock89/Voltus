module.exports = async sequelize => {
	const Giveaways = global.Giveaways = sequelize.define("Giveaways", {
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

	await Giveaways.sync();
};
