const { maintainers } = require("../../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let doc = await Admins.findOne({ where: { serverID: msg.guild.id, id: msg.author.id } });
	if ((!doc || doc.dataValues.level !== 4) && !maintainers.includes(msg.author.id)) {
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

	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "No arguments were specified.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	let user, reason;
	if (suffix.indexOf("|") > -1 && suffix.length > 3) {
		user = suffix.substring(0, suffix.indexOf("|")).trim();
		reason = suffix.substring(suffix.indexOf("|") + 1).trim();
	} else {
		reason = "No reason";
		user = suffix;
	}

	if (!/\d{17,19}/.test(user)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Not a valid user!.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	let name;
	try {
		name = client.users.get(user).tag;
	} catch (err) {
		name = suffix;
	}
	// TODO: FINISH THIS
};
