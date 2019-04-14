const { maintainers } = require("../../Configuration/config.js");

module.exports = async(client, msg, suffix, serverDoc) => {
	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "No arguments were specified.",
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
			},
		});
	}

	if (member.user.bot || !member.kickable) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "This user cannot be kicked.",
			},
		});
	}


	let memberDoc = await Admins.findOne({ where: { serverID: msg.guild.id, userID: member.id } });
	if (memberDoc && memberDoc.dataValues.level >= msg.author.adminLevel.level) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are not allowed to kick this user!",
			},
		});
	}

	const kickFunc = async() => {
		try {
			member.send({
				embed: {
					color: 0xFF0000,
					title: ":exclamation: Uh oh!",
					description: `You've just been kicked from **${msg.guild.name}** with ${reason == "No reason" ? "no reason." : `reason: **${reason}**`}`,
					footer: {
						text: `You now have ${msg.guild.members.size} members.`,
					},
				},
			});
		} catch (_) {
			// Ignore
		}
		try {
			await member.kick(reason);
		} catch (err) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "This user cannot be kicked.",
				},
			});
		}
		modLogger.log({
			type: "Kick",
			moderator: {
				id: msg.author.id,
				tag: msg.user.tag,
			},
			user: {
				id: member.id,
				tag: member.tag,
			},
			reason,
		});
		msg.channel.send({
			embed: {
				color: 0x00FF00,
				title: ":white_check_mark: Success!",
				description: `Successfully kicked **${member.user.tag}** with ${reason == "No reason" ? "no reason." : `reason: **${reason}**`}`,
				footer: {
					text: `You now have ${msg.guild.members.size} members.`,
				},
			},
		});
	};

	if (serverDoc.dataValues.kickConfirms) {
		msg.channel.send({
			embed: {
				color: 0xFFFF00,
				title: ":question: Are you sure?",
				description: `Are you sure you want to kick ${member.toString()}?`,
				footer: {
					text: "Reply with yes or no",
				},
			},
		});
		let collector = await msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000, number: 1 });
		collector.on("collect", async cmsg => {
			switch (cmsg.content.toLowerCase()) {
				case "yes": {
					await kickFunc();
					await collector.stop();
					break;
				}
				case "no": {
					msg.channel.send({
						embed: {
							color: 0x7452A2,
							title: "Voltus",
							description: "Ban cancelled.",
						},
					});
					await collector.stop();
					break;
				}
				default: {
					await collector.stop();
					break;
				}
			}
		});
	} else {
		await kickFunc();
	}
};

module.exports.info = {
	name: "Kick",
	description: "Allows you to kick a user.",
	pack: "moderation",
	level: 3,
	aliases: [],
};
