module.exports = async(client, msg, suffix) => {
	let serverDoc = await ServerConfigs.findOne({ where: { id: msg.guild.id } });
	if (serverDoc.dataValues.massDMConfig) {
		let all = Admins.findAll({ where: { serverID: msg.guild.id, level: 4 } });
		for (let i of all) {
			try {
				if (i.dataValues.userID === msg.author.id) return;
				client.users.get(i.dataValues.userID).send({
					embed: {
						color: 0xFF0000,
						title: ":exclamation: Warning!",
						description: `**${msg.author.tag}** has ran config in **${msg.guild.name}**`,
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			} catch (_) {
				// Ignore
			}
		}
	}

	let mainEmbed = await msg.channel.send({
		embed: {
			color: 0xFF0000,
			description: `Starting...`,
		},
	});
	const makeMenu = async(conditions, main) => {
		let descriptionarray = ["```ini"];
		for (let i of conditions) {
			i.id = descriptionarray.length;
			descriptionarray.push(`[${i.id}] ${i.name} ${i.changed !== undefined && i.changed ? `[ ${i.type == "yesno" ? `${serverDoc.dataValues[i.keyToChange] == true ? "Yes" : "No"}` : serverDoc.dataValues[i.keyToChange]} ]` : ""}`);
		}
		descriptionarray.push("```");
		if (main) {
			descriptionarray.push(`Type **s** to save || Type **e** to exit`);
		} else {
			descriptionarray.push(`Type **b** to go back || Type **e** to exit`);
		}
		mainEmbed = await mainEmbed.edit({
			embed: {
				color: 0x7452A2,
				title: "Enter a number",
				description: descriptionarray.join("\n"),
			},
		});
		let collector = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000 });
		collector.on("collect", async cmsg => {
			await cmsg.delete();
			if (!conditions.find(c => c.id == cmsg.content) && (main && cmsg.content !== "e" && cmsg.content !== "s") && (!main && cmsg.content !== "e" && cmsg.content !== "b")) {
				mainEmbed = await mainEmbed.edit({
					embed: {
						color: 0xFF0000,
						title: "Invalid option. Enter a number",
						description: descriptionarray.join("\n"),
					},
				});
			}
			await collector.stop();
			for (let i of conditions) {
				if (cmsg.content == i.id) {
					if (i.type == "custom") i.custom();
					if (i.type == "yesno") {
						await mainEmbed.edit({
							embed: {
								color: 0x7452A2,
								title: i.name,
								description: i.description,
								footer: {
									text: "Reply with yes or no. Invalid options will be counted as no.",
								},
							},
						});
						let subcollector = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { timeout: 60000 });
						subcollector.on("collect", async c2msg => {
							await subcollector.stop();
							await c2msg.delete();
							if (c2msg.content.toLowerCase() !== ("yes" || "no")) c2msg.content = "no";
							switch (c2msg.content.toLowerCase()) {
								case "yes": {
									serverDoc.set({ [i.keyToChange]: true });
									i.changed = true;
									backToMain();
									break;
								}
								case "no": {
									serverDoc.set({ [i.keyToChange]: false });
									i.changed = true;
									backToMain();
									break;
								}
							}
						});
					}
				}
				if (i.type == "values") {
					await mainEmbed.edit({
						embed: {
							color: 0x7452A2,
							title: i.name,
							description: i.description,
							footer: {
								text: "Reply with the value to set.",
							},
						},
					});
					let subcollector = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { timeout: 60000 });
					subcollector.on("collect", async c2msg => {
						await subcollector.stop();
						await c2msg.delete();
						serverDoc.set({ [i.keyToChange]: i.value });
						i.changed = true;
						backToMain();
					});
				}
			}
			if (main && cmsg.content === "s") {
				await mainEmbed.edit({
					embed: {
						color: 0xFFFF00,
						description: "Saving...",
					},
				});
				await serverDoc.save().then(async() => {
					await mainEmbed.edit({
						embed: {
							color: 0x00FF00,
							description: "Saved!",
						},
					});
					setTimeout(async() => {
						await mainEmbed.delete();
					}, 5000);
				});
			}
			if (cmsg.content === "e") {
				await mainEmbed.edit({
					embed: {
						color: 0xFF0000,
						description: "Exiting config...",
					},
				});
				setTimeout(async() => {
					await mainEmbed.delete();
				}, 5000);
			}
			if (!main && cmsg.content === "b") {
				backToMain();
			}
		});
	};

	const moderationMenu = [
		{ name: "Enabled", description: "The moderation pack enables you to keep your server safe and secure. Do you want to enable it?", type: "yesno", keyToChange: "moderationEnabled" },
		{ name: "Kick Confirmation", description: "Kick confirmations ask you if you are you sure want to kick a user. Do you want to enable them?", type: "yesno", keyToChange: "kickConfirms" },
		{ name: "Ban Confirmation", description: "Kick confirmations ask you if you are you sure want to kick a user. Do you want to enable them?", type: "yesno", keyToChange: "banConfirms" },
	];

	const utilityMenu = [
		{ name: "Agreement Enabled", description: "This allows you to make sure users have agreed to the rules before being given access to the whole server. Do you want to enable it?", type: "yesno", keyToChange: "agreeEnabled", required: ["agreeRole"] },
		{ name: "Agreement Channel", description: "This is the channel in which the user can agree to the rules. This is not required. Please specify a channel.", type: "custom", required: ["agreeEnabled", "agreeRole"], custom: async() => {
			let subcollector = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { timeout: 60000 });
			subcollector.on("collect", async c2msg => {
				let channel, toLookup;
				if (c2msg.content.startsWith("<#")) toLookup = c2msg.content.slice(2, -1);
				if (c2msg.content.startsWith("#")) toLookup = c2msg.content.slice(1);
				if (isNaN(c2msg.content) && new RegExp(/^\d+$/).test(c2msg.content)) toLookup = c2msg.content;
				if (!isNaN(c2msg.content)) channel = await msg.guild.channels.get(toLookup);
				if (!channel) channel = await msg.guild.channels.find("name", toLookup);
				if (!channel) {
					return mainEmbed.edit({
						embed: {

						},
					});
				}
			});
		} },
	];

	const backToMain = async() => {
		makeMenu([
			{ name: "Moderation", type: "custom", custom: async() => {
				makeMenu(moderationMenu, false);
			} },
			{ name: "Utility", type: "custom", custom: async() => {
				makeMenu(utilityMenu, false);
			} },
		], true);
	};
	backToMain();
};
module.exports.info = {
	name: "Config",
	description: "Allows you to change your server settings.",
	pack: "Essential",
	level: 4,
	aliases: [],
};
/**params: {
	name: "",
	description: "",
	keyToChange: "eg moderation enabled"
	type: "custom or yesno or values"
	custom: function(only if custom)
	changed: boolean
	required: array
}, main: boolean */
