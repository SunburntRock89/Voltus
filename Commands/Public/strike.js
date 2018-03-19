const { maintainers } = require("../../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let doc = await Admins.findOne({ where: { serverID: msg.guild.id } });
	if (!doc && !maintainers.includes(msg.author.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You do not have permission to execute this command.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	let member, reason;
	if (suffix.indexOf("|") > -1 && suffix.length > 3) {
		member = await client.memberSearch(suffix.substring(0, suffix.indexOf("|")).trim(), msg.guild).catch(() => {
			member = undefined;
		});
		reason = suffix.substring(suffix.indexOf("|") + 1).trim();
	} else {
		reason = "No reason";
		member = await client.memberSearch(suffix, msg.guild).catch(() => {
			member = undefined;
		});
	}

	if (!member) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Could not resolve a member.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}
};
