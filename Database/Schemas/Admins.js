module.exports = async sequelize => {
	const databaseModel = sequelize.define("Admins", {
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
		type: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	});

	await databaseModel.sync();

	const Admins = global.Admins = new cache(databaseModel);
};
