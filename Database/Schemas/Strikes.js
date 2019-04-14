module.exports = async sequelize => {
	const databaseModel = sequelize.define("Strikes", {
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

	await databaseModel.sync();

	const Strikes = global.Strikes = new cache(databaseModel);
};
