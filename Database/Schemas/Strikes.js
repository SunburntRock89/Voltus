module.exports = async sequelize => {
	const Strikes = global.Strikes = sequelize.define("Strikes", {
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

	await Strikes.sync();
};
