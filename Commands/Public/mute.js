const { maintainers } = require("../../Configuration/config.js");

module.exports = async(client, msg, suffix, serverDoc) => {
	if (!serverDoc.dataValues.muteEnabled) msg.channel.send("Mute is not enabled in this server.");
	if (!serverDoc.dataValues.muteRole) msg.channel.send("Mute is not properly configured in this server.");

	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "No arguments were specified.",
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
			},
		});
	}

	let muteRole, newMemberRole;
	try {
		muteRole = await msg.guild.roles.get(serverDoc.dataValues.muteRole);
	} catch (err) {
		msg.channel.send("Mute is not properly configured in this server.");
	}

	if (serverDoc.dataValues.newMemberEnabled && serverDoc.dataValues.newMemberRole) newMemberRole = serverDoc.dataValues.newMemberRole || null;

	try {
		member.roles.add(muteRole);
		if (newMemberRole) member.roles.remove(newMemberRole);
		modLogger.log({
			type: "Mute",
			moderator: {
				id: msg.author.id,
				tag: msg.user.tag,
			},
			user: {
				id: member.id,
				tag: member.tag,
			},
		});
	} catch (err) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "I am unable to add roles to that member.",
			},
		});
	}

	member.send({
		embed: {
			color: 0xFF0000,
			title: ":exclamation: Uh oh!",
			description: `You've been muted in **${msg.guild.name}**!`,
		},
	}).catch(() => null);
	return msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: `I have successfully muted **${member.user.tag}**.`,
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
