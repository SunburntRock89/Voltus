const { maintainers } = require("../../Configuration/config.js");

module.exports = async(client, msg, suffix) => {
	let doc = await Admins.findOne({ where: { serverID: msg.guild.id, userID: msg.author.id } });
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

	let serverDoc = await ServerConfigs.findOne({ where: { id: msg.guild.id } });
	if (!serverDoc.dataValues.muteEnabled) msg.channel.send("Mute is not enabled in this server.");
	if (!serverDoc.dataValues.muteRole) msg.channel.send("Mute is not properly configured in this server.");

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

	let member;
	try {
		member = await client.memberSearch(suffix, msg.guild);
	} catch (err) {
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

	let muteRole, newMemberRole;
	try {
		muteRole = msg.guild.roles.get(serverDoc.dataValues.muteRole);
	} catch (err) {
		msg.channel.send("Mute is not properly configured in this server.");
	}

	if (serverDoc.dataValues.newMemberEnabled && serverDoc.dataValues.newMemberRole) newMemberRole = serverDoc.dataValues.newMemberRole || null;

	try {
		member.roles.add(muteRole);
		if (newMemberRole) member.roles.remove(newMemberRole);
	} catch (err) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "I am unable to add roles to that member.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	try {
		member.send({
			embed: {
				color: 0xFF0000,
				title: ":exclamation: Uh oh!",
				description: `You've been muted in **${msg.guild.name}**!`,
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	} catch (_) {
		// Ignore
	}
	return msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: `I have successfully muted **${member.user.tag}**.`,
			footer: {
				text: require("../../package.json").version,
			},
		},
	});
};
module.exports.info = {
	name: "Mute",
	description: "Allows you to remove a user's perms for typing in chat. -- MASSIVELY UNFINISHED",
	pack: "moderation",
	level: 1,
	aliases: [],
};
