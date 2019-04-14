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

	if (isNaN(suffix)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Message count must be a number.",
			},
		});
	}

	if (serverDoc.dataValues.nukeLimit < parseInt(suffix)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Message count larger than nuke limit.",
			},
		});
	}

	let nukeFunc = async() => {
		try {
			msg.channel.bulkDelete(Math.floor(parseInt(suffix) + 2));
		} catch (err) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "Messages could not be deleted.",
				},
			});
		}
		msg.channel.send({
			embed: {
				color: 0x00FF00,
				title: ":white_check_mark: Success!",
				description: `Successfully nuked ${suffix} messages.`,
			},
		});
	};

	if (parseInt(suffix) > 40) {
		msg.channel.send({
			embed: {
				color: 0xFFFF00,
				title: ":question: Are you sure?",
				description: `Are you sure you want to nuke ${suffix} messages?`,
				footer: {
					text: "Reply with yes or no.",
				},
			},
		});
		let collector = await msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000, max: 1 });
		collector.on("collect", async cmsg => {
			switch (cmsg.content.toLowerCase()) {
				case "no": {
					await collector.stop();
					return msg.channel.send({
						embed: {
							color: 0xFF0000,
							description: "Cancelling nuke...",
						},
					});
				}
				case "yes": {
					let admins = await Admins.findAll({ where: { guildID: msg.guild.id } });
					for (let i of admins) {
						try {
							client.users.get(i.userID).send({
								embed: {
									color: 0xFF0000,
									title: ":exclamation: Warning!",
									description: `**${msg.author.name}** has just nuked **${suffix}** messages in **${msg.channel.name}** of **${msg.guild.name}**`,
								},
							});
						} catch (_) {
							// Ignore
						}
					}
					return nukeFunc();
				}
			}
		});
	} else {
		await nukeFunc();
	}
};
module.exports.info = {
	name: "Nuke",
	description: "Allows you to bulk delete messages.",
	level: 2,
	pack: "Moderation",
	aliases: [],
};
