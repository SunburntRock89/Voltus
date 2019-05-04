
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
					doc.set({ [item.dbEntry]: false });
					menu.find(m => m.name == item.name).newval = false;
					generateMenu(mainMenu);
					break;
				}
				case "✅": {
					mainmsg.reactions.removeAll();
					doc.set({ [item.dbEntry]: true });
					menu.find(m => m.name == item.name).newval = true;
					generateMenu(mainMenu);
					break;
				}
			}
		});
	};

	const discordID = async(item, full, menu, type) => {
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
					msgcollector.on("collect", async cmsg => {
						await cmsg.delete();
						let res;
						switch (type) {
							case "role": {
								res = cmsg.mentions.roles.first();
								if (!res) res = cmsg.guild.roles.find(r => r.name == cmsg.content);
								if (!res) res = cmsg.guild.roles.get(cmsg.content);
								if (!res) {
									await mainmsg.edit({
										embed: {
											color: 0xFF0000,
											title: ":x: Invalid Entry.",
											description: `Enter a new value for your ${item.name}`,
										},
									});
								}
								break;
							}
							case "channel": {
								res = cmsg.mentions.channlels.first();
								if (!res) res = cmsg.guild.channels.find(r => r.name == cmsg.content);
								if (!res) res = cmsg.guild.channels.get(cmsg.content);
								if (!res) {
									await mainmsg.edit({
										embed: {
											color: 0xFF0000,
											title: ":x: Invalid Entry.",
											description: `Enter a new value for your ${item.name}`,
										},
									});
								}
								break;
							}
						}
						msgcollector.stop();
						doc.set({ [item.dbEntry]: res.id });
						menu.find(m => m.name == item.name).value = `<@${res.id}>`;
						return generateMenu(mainMenu);
					});
				}
			}
		});
	};

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
			item.function(item, true, items, item.type);
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
		name: "Moderation Settings",
		emoji: "🔨",
		description: "Goes back to the previous menu",
		function: () => {
			generateMenu(moderationMenu);
		},
	}, {
		name: "Utility Settings",
		emoji: "🙋",
		description: "Goes back to the previous menu",
		function: () => {
			generateMenu(utilityMenu);
		},
	}, {
		name: "Save Changes",
		emoji: "💾",
		description: "Save the changes you have made to your configuration.",
		function: doc.save,
	}];

	let moderationMenu = [{
		name: "Moderation Enabled",
		emoji: "🔨",
		description: "Enables the moderation pack.",
		explanation: "The moderation pack allows server Administrators to perform moderative actions on rule breaking users.",
		dbEntry: "muteRole",
		function: discordID,
		type: "role",
	}, {
		name: "Mute Role",
		emoji: "🔇",
		description: "Changes the role that is given to muted users.",
		explanation: "The mute role defines the role given to a user when they are muted.",
		dbEntry: "muteRole",
		function: discordID,
		type: "role",
	}, {
		name: "Agree Channel",
		emoji: "💬",
		description: "Change the channel that is used for running the agree command.",
		explanation: "The agree channel is the channel that is used for users to accept the rules in using the agree command.",
		dbEntry: "agreeChannel",
		function: discordID,
		type: "channel",
	}, {
		name: "Agree Role",
		emoji: "🚪",
		description: "Change the role given to members who run the agree command.",
		explanation: "The agree role is the role that is given to users who run the agree command.",
		dbEntry: "agreeRole",
		function: discordID,
		type: "role",
	}, {
		name: "Kick confirms",
		emoji: "❔",
		description: "Make the moderator confirm that they want to kick a user.",
		explanation: "Kick confirms make the moderator confirm that they want to kick a user from a server.",
		dbEntry: "kickConfirms",
		function: onOrOff,
	}, {
		name: "Ban confirms",
		emoji: "❓",
		description: "Make the moderator confirm that they want to ban a user.",
		explanation: "Ban confirms make the moderator confirm that they want to ban a user from a server.",
		dbEntry: "banConfirms",
		function: onOrOff,
	}, {
		name: "Nuke limit",
		emoji: "💣",
		description: "Change the maximum amount of messages that can be nuked.",
		explanation: "Nuke limit is the maximum amount of messages that can be removed with the nuke command.",
		dbEntry: "nukeLimit",
		function: stringConfig,
	}, {
		name: "IP Filter",
		emoji: "💻",
		description: "Enable a filter to prevent users from having their IP address leaked.",
		explanation: "The IP filter prevents users from leaking other users' IPs in chat.",
		dbEntry: "ipFilter",
		function: onOrOff,
	}, {
		name: "Raid mode",
		emoji: "❗️",
		description: "Put your server into raid mode - Voltus' Raid Security System.",
		explanation: "Raid mode DMs admins when users join during a raid to increase security.",
		dbEntry: "raidMode",
		function: onOrOff,
	}, {
		name: "Go back",
		emoji: "◀️",
		description: "Goes back to the previous menu",
		function: () => {
			generateMenu(mainMenu);
		},
	}];

	let utilityMenu = [{
	// 	name: "Starboard enabled",
	// 	emoji: "⭐️",
	// 	description: "",
	// 	explanation: "",
	// 	dbEntry: "starboardEnabled",
	// 	function: onOrOff,
	// }, {
	// 	name: "Starboard channel",
	// 	emoji: "🌠",
	// 	description: "",
	// 	explanation: "",
	// 	dbEntry: "starboardChannel",
	// 	function: discordID,
	// 	type: "channel",
	// }, 
	// {
		name: "Join Messages Enabled",
		emoji: "✅",
		description: "Enable messages that are sent when a user joins the server.",
		explanation: "Join messages are sent in a channel when users join the server.",
		dbEntry: "newMemberEnabled",
		function: stringConfig,
	}, {
		name: "Join Message Channel",
		emoji: "💯",
		description: "Change the channel that join messages are sent in.",
		explanation: "Join message channel configures the channel where join messages are sent to.",
		dbEntry: "newMemberChannel",
		function: discordID,
		type: "channel",
	}, {
		name: "Join Message",
		emoji: "📥",
		description: "The join message is the message that is sent when someone joins the server.",
		explanation: "Changing the join message will configure the message that is sent when a user joins the server.++",
		dbEntry: "newMemberMessage",
		function: stringConfig,
	}, {
		name: "Leave Messages Enabled",
		emoji: "☑️",
		description: "",
		explanation: "",
		dbEntry: "leaveEnabled",
		function: onOrOff,
	}, {
		name: "Leave channel",
		emoji: "🚶",
		description: "",
		explanation: "",
		dbEntry: "leaveChannel",
		function: discordID,
		type: "channel",
	}, {
		name: "Leave Message",
		emoji: "👋",
		description: "",
		explanation: "",
		dbEntry: "leaveChannel",
		function: stringConfig,
	}, {
		name: "Go back",
		emoji: "◀️",
		description: "Goes back to the previous menu",
		function: () => {
			generateMenu(mainMenu);
		},
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
