module.exports = async(client, msg, suffix, doc) => {
	if (doc.dataValues.massDMConfig) {
		let all = Admins.findAll({ where: { serverID: msg.guild.id, level: 4 } });
		for (let i of all) {
			try {
				if (i.dataValues.userID === msg.author.id) return;
				client.users.get(i.dataValues.userID).send({
					embed: {
						color: 0xFF0000,
						title: ":exclamation: Warning!",
						description: `**${msg.author.tag}** has ran config in **${msg.guild.name}**`,
					},
				});
			} catch (_) {
				// Ignore
			}
		}
	}

	const stringConfig = async(item, full, menu) => {
		await mainmsg.edit({
			embed: {
				color: 0x7452A2,
				title: `${item.emoji} ${item.name}`,
				description: `${item.explanation}\n**Would you like to change it?**`,
			},
		});

		mainmsg.react("✅").then(() => {
			mainmsg.react("❌");
		});

		let collector = mainmsg.createReactionCollector((r, u) => u.id == msg.author.id && ["✅", "❌"].includes(r.emoji.name), { time: 30000 });
		collector.on("collect", async(reaction, user) => {
			switch (reaction.emoji.name) {
				case "❌": {
					mainmsg.reactions.removeAll();
					generateMenu(mainMenu);
					break;
				}
				case "✅": {
					mainmsg.reactions.removeAll();
					await mainmsg.edit({
						embed: {
							color: 0x7452A2,
							title: `${item.emoji} ${item.name}`,
							description: `Enter a new value for your ${item.name}`,
						},
					});
					let msgcollector = mainmsg.channel.createMessageCollector(m => m.author.id == msg.author.id, { time: 30000 });
					msgcollector.on("collect", cmsg => {
						msgcollector.stop();
						doc.set({ [item.dbEntry]: cmsg.content });
						menu.find(m => m.name == item.name).value = cmsg.content;
						return generateMenu(mainMenu);
					});
				}
			}
		});
	};

	const onOrOff = async(item, full, menu) => {
		await mainmsg.edit({
			embed: {
				color: 0x7452A2,
				title: `${item.emoji} ${item.name}`,
				description: `${item.explanation}\n**Would you like to enable it?**`,
			},
		});

		mainmsg.react("✅").then(() => {
			mainmsg.react("❌");
		});

		let collector = mainmsg.createReactionCollector((r, u) => u.id == msg.author.id && ["✅", "❌"].includes(r.emoji.name), { time: 30000 });
		collector.on("collect", async(reaction, user) => {
			switch (reaction.emoji.name) {
				case "❌": {
					mainmsg.reactions.removeAll();
					doc.set({ [item.dbEntry]: false })
					menu.find(m => m.name == item.name).newval = false;
					generateMenu(mainMenu);
					break;
				}
				case "✅": {
					mainmsg.reactions.removeAll();
					doc.set({ [item.dbEntry]: true })
					menu.find(m => m.name == item.name).newval = true;
					generateMenu(mainMenu);
					break;
				}
			}
		});
	};

	const discordID = async(item, full, menu, type) => {
		
	}

	let mainmsg;

	const generateMenu = async items => {
		let fields = [];

		for (let i of items) {
			fields.push({
				name: `${i.emoji} ${i.name}`,
				value: `${i.description} ${i.value ? [true, false].includes(i.value) ? i.value == true ? "(on)" : "(off)" : `(${i.value})` : ""}`,
				inline: false,
			});
		}

		let embed = {
			embed: {
				color: 0x7452A2,
				title: "Voltus",
				description: "Select an emoji",
				fields,
			},
		};

		if (!mainmsg) {
			mainmsg = await msg.channel.send(embed);
		} else {
			await mainmsg.edit(embed);
		}

		(() => {
			for (let i of items) {
				mainmsg.react(i.emoji);
			}
		})();

		let collector = mainmsg.createReactionCollector((r, u) => u.id == msg.author.id && items.find(i => i.emoji == r.emoji.name), { time: 30000 });
		collector.on("collect", async(reaction, user) => {
			collector.stop();
			let item = items.find(i => i.emoji == reaction.emoji.name);
			mainmsg.reactions.removeAll();
			item.function(item, true, items);
		});
	};

	let mainMenu = [{
		name: "Prefix",
		emoji: "❗",
		description: "Change the prefix used to invoke commands in Voltus.",
		explanation: "The prefix in a server is used to invoke any command in the bot.",
		dbEntry: "prefix",
		function: stringConfig,
	}, {
		name: "Save Changes",
		emoji: "💾",
		description: "Save the changes you have made to your configuration.",
		function: doc.save,
	}];

	let moderationMenu = [{
		name: "Mute role",
		emoji: "🔇",
		description: "",
		explanation: "",
		dbEntry: "muteRole",
		function: ,
	}, {
		name: "Agree channel",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "agreeChannel",
		function: ,
	}, {
		name: "Agree role",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "agreeRole",
		function: ,
	}, {
		name: "Kick confirms",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "kickConfirms",
		function: onOrOff,
	}, {
		name: "Ban confirms",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "banConfirms",
		function: onOrOff,
	}, {
		name: "Nuke limit",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "nukeLimit",
		function: onOrOff,
	}, {
		name: "IP filter",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "ipFilter",
		function: onOrOff,
	}, {
		name: "Raid mode",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "raidMode",
		function: onOrOff,
	}, {
		name: "Go back",
		emoji: "◀️",
		description: "Goes back to the previous menu",
		function: () => {
			generateMenu(mainMenu);
		}
	}];

	let utilityMenu = [{
		name: "Starboard enabled",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "starboardEnabled",
		function: onOrOff,
	}, {
		name: "Starboard channel",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "starboardChannel",
		function: ,
	}, {
		name: "Leave Messages Enabled",
		emoji:"",
		description: "",
		explanation: "",
		dbEntry: "leaveEnabled",
		function: onOrOff,
	}, {
		name: "Leave channel",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "leaveChannel",
		function: ,
	}, {
		name: "Leave Message",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "leaveChannel",
		function: stringConfig,
	}, {
		name: "Join messages",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "newMemberEnabled",
		function: ,
	}, {
		name: "Join channel",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "newMemberChannel",
		function: ,
	}, {
		name: "Join message",
		emoji: "",
		description: "",
		explanation: "",
		dbEntry: "newMemberMessage",
		function: stringConfig,
	}, {
		name: "Go back",
		emoji: "◀️",
		description: "Goes back to the previous menu",
		function: () => {
			generateMenu(mainMenu);
		}
	}];

	generateMenu(mainMenu);
};
module.exports.info = {
	name: "Config",
	description: "Allows you to change your server settings.",
	pack: "Essential",
	level: 4,
	aliases: ["setup"],
};
