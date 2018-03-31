const { maintainers } = require("../../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let doc = await Admins.findOne({ where: { serverID: msg.guild.id, userID: msg.author.id } });
	if ((!doc || doc.dataValues.level !== 4) && !maintainers.includes(msg.author.id) && !msg.member.hasPermission(["ADMINISTRATOR", "MANAGE_GUILD"])) {
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
				description: "Not a valid user!",
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

	let bans;
	try {
		bans = await msg.guild.fetchBans();
	} catch (err) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "There are no users banned from this server!",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	let userBan = bans.get(user);
	if (!userBan) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "This user is not banned!",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	await msg.guild.members.unban(userBan.user, reason);
	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: ":white_check_mark: Success!",
			description: `Successfully unbanned **${name}** with ${reason == "No reason" ? "no reason." : `reason: ${reason}`}`,
			footer: {
				text: `You now have ${msg.guild.members.size} members.`,
			},
		},
	});
};
module.exports.info = {
	name: "Unban",
	description: "Allows you to unban users from your server.",
	pack: "moderation",
	level: 4,
};
