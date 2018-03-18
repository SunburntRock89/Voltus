const Sequelize = require("sequelize");

module.exports = async(client, sequelize) => {
	global.ServerConfig = sequelize.define("ServersConfig", {
		id: Sequelize.STRING,
		// Agree
		agreeEnabled: Sequelize.BOOLEAN,
		agreeChannel: Sequelize.STRING,
		// New Member
		newMemberEnabled: Sequelize.BOOLEAN,
		newMemberMessage: Sequelize.STRING,
	});
};
