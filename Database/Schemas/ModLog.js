module.exports = async sequelize => {
	const databaseModel = sequelize.define("ModLog", {
		id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		moderator: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		user: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		reason: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	});

	await databaseModel.sync();

	const ModLog = global.ModLog = new cache(databaseModel);
};
