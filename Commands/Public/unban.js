const { maintainers } = require("../../Configuration/config.js");

module.exports = async(client, msg, suffix) => {
	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "No arguments were specified.",
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
			},
		});
	}

	await msg.guild.members.unban(userBan.user, reason);
	modLogger.log({
		type: "Unban",
		moderator: {
			id: msg.author.id,
			tag: msg.user.tag,
		},
		user: {
			id: user.id,
			tag: user.id,
		},
		reason,
	});
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
	aliases: [],
};
