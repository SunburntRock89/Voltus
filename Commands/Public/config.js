const { maintainers } = require("../../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let doc = await Admins.findOne({ where: { serverID: msg.guild.id, userID: msg.author.id } });
	if ((!doc || doc.dataValues.level !== 4) && !maintainers.includes(msg.author.id) && !msg.member.hasPermission(["ADMINISTRATOR", "MANAGE_GUILD"])) {
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
	await msg.delete();

	let mainEmbed = await msg.channel.send({
		embed: {
			color: 0xFF0000,
			description: `Starting...`,
		},
	});

	const options = {};
	options.moderation = {};

	const mainmenu = async() => {
		await mainEmbed.edit({
			embed: {
				color: 0x7452A2,
				title: "Enter a number",
				description: [`\`\`\`ini`,
					`[1] Prefix ${options.prefix ? `[ ${options.prefix} ]` : ``}`,
					`[2] Moderation ${Object.keys(options.moderation).length !== 0 ? `[ EDITED ]` : ``}`,
					`[3] Admins`,
					`\`\`\``,
					`Type **s** to save || Type **e** to exit`,
				].join("\n"),
			},
		});
		let collector = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000 });
		collector.on("collect", async cmsg => {
			await cmsg.delete();
			switch (cmsg.content) {
				case "1": {
					await submenu1();
					await collector.stop();
					collector = null;
					break;
				}
				case "2": {
					await submenu2();
					await collector.stop();
					collector = null;
					break;
				}
				case "3": {
					await submenu3();
					await collector.stop();
					collector = null;
					break;
				}
				case "s": {
					await collector.stop();
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
					setTimeout(async() => {
						await mainEmbed.delete();
					}, 5000);
					break;
				}
				case "e": {
					await collector.stop();
					collector = null;
					await mainEmbed.edit({
						embed: {
							color: 0xFF0000,
							description: "Exiting config...",
						},
					});
					setTimeout(async() => {
						await mainEmbed.delete();
					}, 5000);
					break;
				}
				default: {
					await mainEmbed.edit({
						embed: {
							color: 0xFF0000,
							title: "Invalid option. Enter a number",
							description: [`\`\`\`ini`,
								`[1] Prefix ${options.prefix ? `[ ${options.prefix} ]` : ``}`,
								`[2] Moderation ${Object.keys(options.moderation).length !== 0 ? `[ EDITED ]` : ``}`,
								`\`\`\``,
								`Type **s** to save || Type **e** to exit`,
							].join("\n"),
						},
					});
				}
			}
		});
	};

	await mainmenu();

	const submenu1 = async() => {
		await mainEmbed.edit({
			embed: {
				color: 0x0000FF,
				description: "Enter a new prefix. It must not be longer than 10 characters.",
			},
		});
		let subcollector1 = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000 });
		subcollector1.on("collect", async cmsg => {
			await cmsg.delete();
			if (cmsg.content.length > 10) {
				return mainEmbed.edit({
					embed: {
						color: 0xFF0000,
						description: "Prefix too long. Enter a prefix shorter than 10 characters.",
					},
				});
			}
			await subcollector1.stop();
			subcollector1 = null;
			serverDoc.set({ prefix: cmsg.content });
			options.prefix = cmsg.content;
			await mainmenu();
		});
	};
	const submenu2 = async() => {
		await mainEmbed.edit({
			embed: {
				color: 0x7452A2,
				title: "Enter a number",
				description: [
					`\`\`\`ini`,
					`[1] Enabled ${options.moderation.enabled ? `[ ${options.moderation.enabled} ]` : ``}`,
					`[2] Kick Confirmation ${options.moderation.kickConfirms ? `[ ${options.moderation.kickConfirms} ]` : ""}`,
					`[3] Ban Confirmation ${options.moderation.banConfirms ? `[ ${options.moderation.banConfirms} ]` : ""}`,
					`\`\`\``,
					`Type **b** to go back || Type **e** to exit`,
				].join("\n"),
			},
		});
		let subcollector2 = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000 });
		subcollector2.on("collect", async cmsg => {
			await cmsg.delete();
			switch (cmsg.content) {
				case "1": {
					await subcollector2.stop();
					subcollector2 = null;
					await mainEmbed.edit({
						embed: {
							color: 0x7452A2,
							title: "Moderation Pack",
							description: "The moderation pack allows you to moderate your chat quickly and effectively. Would you like to enable it?",
							footer: {
								text: "Reply with yes or no. Invalid options will be counted as no.",
							},
						},
					});
					let collector21 = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000 });
					collector21.on("collect", async c2msg => {
						await collector21.stop();
						await c2msg.delete();
						if (c2msg.content.toLowerCase() !== ("yes" || "no")) c2msg.content = "no";
						switch (c2msg.content.toLowerCase()) {
							case "yes": {
								serverDoc.set({ moderationEnabled: true });
								options.moderation.enabled = "Yes";
								await submenu2();
								break;
							}
							case "no": {
								serverDoc.set({ moderationEnabled: false });
								options.moderation.enabled = "No";
								await submenu2();
								break;
							}
						}
					});
					break;
				}
				case "2": {
					await subcollector2.stop();
					subcollector2 = null;
					await mainEmbed.edit({
						embed: {
							color: 0x7452A2,
							title: "Kick Confirmation",
							description: "Kick Confirmation toggles the \"Are you sure you would like to kick\" dialogue. Would you like it enabled?",
							footer: {
								text: "Reply with yes or no. Invalid options will be counted as no.",
							},
						},
					});
					let collector22 = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000 });
					collector22.on("collect", async c2msg => {
						await collector22.stop();
						await c2msg.delete();
						if (c2msg.content.toLowerCase() !== ("yes" || "no")) c2msg.content = "no";
						switch (c2msg.content.toLowerCase()) {
							case "yes": {
								serverDoc.set({ kickConfirms: true });
								options.moderation.kickConfirms = "Yes";
								await submenu2();
								break;
							}
							case "no": {
								serverDoc.set({ kickConfirms: false });
								options.moderation.kickConfirms = "No";
								await submenu2();
								break;
							}
						}
					});
					break;
				}
				case "3": {
					await subcollector2.stop();
					subcollector2 = null;
					mainEmbed.edit({
						embed: {
							color: 0x7452A2,
							title: "Ban Confirmation",
							description: "Ban Confirmation toggles the \"Are you sure you would like to ban\" dialogue. Would you like it enabled?",
							footer: {
								text: "Reply with yes or no. Invalid options will be counted as no.",
							},
						},
					});
					let collector23 = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000 });
					collector23.on("collect", async c2msg => {
						collector23.stop();
						await c2msg.delete();
						if (c2msg.content.toLowerCase() !== ("yes" || "no")) c2msg.content = "no";
						switch (c2msg.content.toLowerCase()) {
							case "yes": {
								serverDoc.set({ banConfirms: true });
								options.moderation.banConfirms = "Yes";
								await submenu2();
								break;
							}
							case "no": {
								serverDoc.set({ banConfirms: false });
								options.moderation.banConfirms = "No";
								await submenu2();
								break;
							}
						}
					});
					break;
				}
				case "b": {
					await subcollector2.stop();
					subcollector2 = null;
					await mainmenu();
					break;
				}
				case "e": {
					await mainEmbed.edit({
						embed: {
							color: 0xFF0000,
							description: "Exiting config...",
						},
					});
					setTimeout(async() => {
						await mainEmbed.delete();
					}, 5000);
					break;
				}
				default: {
					await mainEmbed.edit({
						embed: {
							color: 0xFF0000,
							title: "Invalid Option. Enter a number",
							description: [
								`\`\`\`ini`,
								`[1] Kick Confirmation ${options.moderation.kickConfirms ? `[ ${options.moderation.kickConfirms} ]` : ""}`,
								`[2] Ban Confirmation ${options.moderation.banConfirms ? `[ ${options.moderation.banConfirms} ]` : ""}`,
								`\`\`\``,
								`Type **b** to go back || Type **e** to exit`,
							].join("\n"),
						},
					});
				}
			}
		});
	};
	const submenu3 = async() => {
		await mainEmbed.edit({
			embed: {
				color: 0x7452A2,
				title: "Enter a number",
				description: [
					`\`\`\`ini`,
					`[1] Add User`,
					`[2] Add Role`,
					`[3] Change User Level`,
					`[4] Change Role Level`,
					`[5] Remove User`,
					`[6] Remove Role`,
					`\`\`\``,
					`Type **b** to go back || Type **e** to exit`,
				].join("\n"),
			},
		});
		let subcollector3 = msg.channel.createMessageCollector(newmsg => newmsg.author.id === msg.author.id, { time: 30000 });
		subcollector3.on("collect", async cmsg => {
			switch (cmsg.content) {
				case "1": {
					await subcollector3.stop();
					await mainEmbed.edit({
						embed: {
							color: 0x7452A2,
							title: "Add an Admin User",
							description: "Please specify a user to add.",
						},
					});
					let subcollector31 = msg.channel.createMessageCollector(newmsg => newmsg.author.id, { time: 30000 });
					subcollector31.on("collect", async c2msg => {
						let member = await client.memberSearch(c2msg.content, msg.guild).catch(async() => {
							await mainEmbed.edit({
								embed: {
									color: 0xFF0000,
									title: "Add an Admin User",
									description: "Could not find a user. Please specify a user to add.",
								},
							});
						});
						if (member) {
							await subcollector31.stop();
							await mainEmbed.edit({
								embed: {
									color: 0x7452A2,
									title: "Add an Admin User",
									description: "Please specify this user's level.",
								},
							});
							let subcollector311 = msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id);
							subcollector311.on("collect", async c3msg => {
								let level = parseInt(c3msg.content);
								if (level >= 5 || !isNaN) {
									await mainEmbed.edit({
										embed: {
											color: 0xFF0000,
											title: "Add an Admin User",
											description: "Please specify this user's level. It must be a **number** that is **lower** than 5.",
										},
									});
								}
								// TODO: Finish this
							});
						}
					});
					break;
				}
				default: {
					await mainEmbed.edit({
						embed: {
							color: 0xFF0000,
							title: "Invalid option",
							description: [
								`\`\`\`ini`,
								`[1] Add User`,
								`[2] Add Role`,
								`[3] Change User Level`,
								`[4] Change Role Level`,
								`[5] Remove User`,
								`[6] Remove Role`,
								`\`\`\``,
								`Type **b** to go back || Type **e** to exit`,
							].join("\n"),
						},
					});
				}
			}
		});
	};
};
module.exports.info = {
	name: "Config",
	description: "Allows you to change your server settings.",
	pack: "Essential",
	level: 4,
};
