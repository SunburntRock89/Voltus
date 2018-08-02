module.exports = async(member, doc) => {
	let admins = member.guild.members.filter(m => m.hasPermission("ADMINISTRATOR"));
	for (let i of admins.values()) {
		try {
			client.users.get(i.dataValues.userID).send({
				color: 0xFF0000,
				title: ":exclamation: Raid Mode",
				description: `**${member.user.name}** has just joined **${member.guild.name}**`,
				footer: {
					text: require("../package.json").version,
				},
			});
		} catch (_) {
			// Ignore
		}
	}
};
