module.exports = async(client, member, doc) => {
	let admins = member.guild.members.filter(m => m.hasPermission("ADMINISTRATOR"));
	for (let i of admins.values()) {
		try {
			i.send({
				embed: {
					color: 0xFF0000,
					title: ":exclamation: Raid Mode",
					description: `**${member.user.tag}** has just left **${member.guild.name}**`,
					footer: {
						text: require("../package.json").version,
					},
				},
			});
		} catch (_) {
			// Ignore
		}
	}
};
