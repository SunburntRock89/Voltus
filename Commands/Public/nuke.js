const { maintainers } = require("../../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let doc = await Admins.findOne({ where: { serverID: msg.guild.id, id: msg.author.id } });
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

	if (isNaN(suffix)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Message count must be a number.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	let serverDoc = await ServerConfigs.findOne({ where: { id: msg.guild.id } });
	if (serverDoc.dataValues.nukeLimit < parseInt(suffix)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Message count larger than nuke limit.",
				footer: {
					text: require("../../package.json").version,
				},
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
				description: `Successfully nuked ${suffix} messages.`,
				footer: {
					text: require("../../package.json").version,
				},
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
};
