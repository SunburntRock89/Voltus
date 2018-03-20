const { maintainers } = require("../../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let doc = await Admins.findOne({ where: { serverID: msg.guild.id, id: msg.author.id } });
	if ((!doc || doc.dataValues.level !== 2) && !maintainers.includes(msg.author.id)) {
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

	if (member.user.bot || !member.kickable) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "This user cannot be kicked.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	let memberDoc = await Admins.findOne({ where: { serverID: msg.guild.id, id: member.id } });
	if (memberDoc && memberDoc.dataValues.level >= doc.dataValues.level) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You cannot strike a member with the same or higher admin level than you.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	const kickFunc = async() => {
		try {
			await member.kick(reason);
		} catch (err) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "This user cannot be kicked.",
					footer: {
						text: require("../../package.json").version,
					},
				},
			});
		}
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

	let serverDoc = await ServerConfigs.findOne({ where: { id: msg.guild.id } });
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
							footer: {
								text: require("../../package.json").version,
							},
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
};
