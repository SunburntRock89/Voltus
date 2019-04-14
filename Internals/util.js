const { maintainers } = require("../Configuration/config.js");

module.exports = class Utils {
	static async getAdminLevel(msg, level) {
		if (maintainers.includes(msg.author.id)) return 4;
		if (msg.member.hasPermission(["ADMINISTRATOR", "MANAGE_GUILD"])) return 4;

		let doc = await Admins.findOne({ where: { serverID: msg.guild.id, userID: msg.author.id } });
		if (doc) return doc.dataValues.level;
		return 0;
	}
	static async getServerDoc(id) {
		let doc = await ServerConfigs.findOne({ where: { id } });
		return doc;
	}
};
