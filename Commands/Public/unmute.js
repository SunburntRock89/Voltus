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
		muteRole = msg.guild.roles.get(serverDoc.dataValues.muteRole);
	} catch (err) {
		msg.channel.send("Mute is not properly configured in this server.");
	}

	if (serverDoc.dataValues.newMemberEnabled && serverDoc.dataValues.newMemberRole) newMemberRole = serverDoc.dataValues.newMemberRole || null;

	try {
		member.roles.remove(muteRole);
		if (newMemberRole) member.roles.add(newMemberRole);
		modLogger.log({
			type: "Unmute",
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
};
module.exports.info = {
	name: "Unmute",
	description: "Allows you to add back a user's permissions to type in channels.",
	pack: "moderation",
	level: 1,
	aliases: [],
};
