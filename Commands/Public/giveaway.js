const randomstring = require("randomstring");
const moment = require("moment");

const { maintainers } = require("../../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let serverDoc = await ServerConfigs.findOne({ where: { id: msg.guild.id } });

	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0x7452A2,
				title: "Voltus",
				description: "Welcome to the giveaway command, to continue, please rerun the command\nusing one of the following arguments.",
				fields: [{
					name: "Start",
					value: "Allows you to start a giveaway. Requires admin level 2.",
				},
				{
					name: "Details",
					value: "Lets you view the details of the giveaway.",
				},
				{
					name: "Enroll",
					value: "Lets users enroll in giveaways.",
				},
				{
					name: "End",
					value: `Allows ${serverDoc.dataValues.ownerEndsGiveaway ? `the giveaway owner` : `an admin`} to end a giveaway and choose a winner.`,
				},
				{
					name: "Reroll",
					value: "Allows you to repick the giveaway winner. Cannot be ran with a giveaway message.",
				},
				{
					name: "Leave",
					value: "Allows a user to leave the giveaway.",
				}],
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	let toCheck = suffix.split(" ")[0].toLowerCase();
	if (toCheck === "join") toCheck === "enroll";
	switch (toCheck) {
		case "start": {
			let doc = await Admins.findOne({ where: { serverID: msg.guild.id, userID: msg.author.id } });
			if ((!doc || doc.dataValues.level !== 2) && !maintainers.includes(msg.author.id) && !msg.member.hasPermission(["ADMINISTRATOR", "MANAGE_GUILD"])) {
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
			let mainembed = await msg.channel.send({
				embed: {
					color: 0x7452A2,
					title: "Voltus",
					description: "Please enter a title for this giveaway.",
					footer: {
						text: `Type exit to exit`,
					},
				},
			});
			let collector = await msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000 });
			collector.on("collect", async cmsg => {
				let title = cmsg.content;
				if (title.length > 64) {
					return mainembed.edit({
						embed: {
							color: 0xFF0000,
							title: ":x: Error!",
							description: "Title cannot be longer than 64 characters.",
							footer: {
								text: `Please try again or type exit to exit.`,
							},
						},
					});
				}

				if (title == "exit") {
					await collector.stop();
					return mainembed.edit({
						embed: {
							color: 0xFF0000,
							description: "Exiting....",
						},
					});
				}

				await collector.stop();
				await cmsg.delete();
				await mainembed.edit({
					embed: {
						color: 0x7452A2,
						title: "Voltus",
						description: "Thanks, now enter what I should send to the winner when the giveaway is ended or type nothing if you don't want me to send them anything.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
				let collector2 = await msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000, number: 1 });
				collector2.on("collect", async c2msg => {
					let winMsg = c2msg.content;
					if (winMsg.toLowerCase() == "nothing") winMsg = null;
					await c2msg.delete();
					let id = randomstring.generate({ length: "8", charset: "alphanumeric" });
					await Giveaways.create({
						id,
						owner: msg.author.id,
						created: new Date(),
						serverID: msg.guild.id,
						title,
						winnerMsg: winMsg,
					});
					await mainembed.edit({
						embed: {
							color: 0x00FF00,
							title: ":tickets: Giveaway Started!",
							fields: [{
								name: `ID`,
								value: id,
							},
							{
								name: "Giveaway name",
								value: title,
							}],
							footer: {
								text: `To enroll, run -giveaway enroll ${id}`,
							},
						},
					});
				});
			});
			break;
		}
		case "details": {
			let giveawayID = suffix.split(" ")[1];
			if (!giveawayID) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: "Voltus",
						description: "No giveaway ID specified.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}
			let giveawayDoc = await Giveaways.findOne({ where: { id: giveawayID, serverID: msg.guild.id } });
			if (!giveawayDoc) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Giveaway could not be found.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			msg.channel.send({
				embed: {
					color: 0x00FF00,
					title: "Voltus",
					description: `Here are the details for giveaway ID: **${giveawayID}**`,
					fields: [{
						name: "Title",
						value: giveawayDoc.dataValues.title,
					},
					{
						name: "Owner",
						value: msg.guild.members.get(giveawayDoc.dataValues.owner).toString() || `invalid-user#0001`,
					}],
					footer: {
						text: require("../../package.json").version,
					},
				},
			});
			break;
		}
		case "enroll": {
			let giveawayID = suffix.split(" ")[1];
			if (!giveawayID) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: "Voltus",
						description: "No giveaway ID specified.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			let giveawayDoc = await Giveaways.findOne({ where: { id: giveawayID, serverID: msg.guild.id } });
			if (!giveawayDoc) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Giveaway could not be found.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			if (giveawayDoc.dataValues.owner === msg.author.id) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "You cannot join a giveaway that you own.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			let participantDoc = await GiveawayParticipants.findOne({ where: { userID: msg.author.id, guildID: msg.guild.id } });
			if (participantDoc) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "You have already entered this giveaway.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			await GiveawayParticipants.create({
				giveawayID,
				userID: msg.author.id,
				guildID: msg.guild.id,
			});

			msg.channel.send({
				embed: {
					color: 0x00FF00,
					title: ":white_check_mark: Success!",
					description: `You have successfully joined giveaway ID: ${giveawayID}`,
					footer: {
						text: require("../../package.json").version,
					},
				},
			});
			break;
		}
		case "end": {
			let giveawayID = suffix.split(" ")[1];
			if (!giveawayID) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: "Voltus",
						description: "No giveaway ID specified.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}
			let doc = await Admins.findOne({ where: { serverID: msg.guild.id, userID: msg.author.id } });
			if ((!doc || doc.dataValues.level !== 2) && !maintainers.includes(msg.author.id) && !msg.member.hasPermission(["ADMINISTRATOR", "MANAGE_GUILD"])) {
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
			let giveawayDoc = await Giveaways.findOne({ where: { id: giveawayID, serverID: msg.guild.id } });
			if (!giveawayDoc) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Giveaway could not be found.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			if (serverDoc.dataValues.ownerEndsGiveaway && giveawayDoc.dataValues.owner !== msg.author.id) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Only the giveaway owner may end this giveaway.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			if (!giveawayDoc.dataValues.status) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Giveaway has already been ended.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			let participants = await GiveawayParticipants.findAll({ where: { id: giveawayID, guildID: msg.guild.id } });
			if (!participants[0]) {
				await giveawayDoc.set({ status: false });
				await giveawayDoc.save();
				await giveawayDoc.destroy({ where: { id: giveawayID, serverID: msg.guild.id } });

				return msg.channel.send({
					embed: {
						color: 0x00FF00,
						title: ":tada: Giveaway over!",
						description: "No winner was picked as nobody entered :frowning:.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			let winner = participants[Math.floor(Math.random() * participants.length)];
			msg.channel.send({
				embed: {
					color: 0x00FF00,
					title: ":tada: Giveaway over!",
					fields: [{
						name: `Giveaway Name`,
						value: giveawayDoc.dataValues.title,
					},
					{
						name: "Entry Count",
						value: `${participants.length}`,
					},
					{
						name: "Winner",
						value: `${msg.guild.members.get(winner.dataValues.userID).toString() || "invalid-user#0001"}`,
					}],
					footer: {
						text: require("../../package.json").version,
					},
				},
			});
			if (giveawayDoc.dataValues.winMsg) {
				await giveawayDoc.set({ status: false, allowReroll: false });
				await giveawayDoc.save();
				return client.users.get(winner.dataValues.userID).send({
					embed: {
						color: 0x00FF00,
						title: ":tada: Congratulations!",
						description: `You've just won a giveaway in **${msg.guild.name}**!`,
						fields: [{
							name: "Giveaway Name",
							value: giveawayDoc.dataValues.title,
						},
						{
							name: "Entry Count",
							value: `${participants.length}`,
						},
						{
							name: "Prize",
							value: giveawayDoc.dataValues.winMsg,
						}],
					},
				}).catch(_ => {
					msg.channel.send("I failed to DM the user with their prize.");
				});
			}
			await giveawayDoc.set({ status: false, allowReroll: true, winner: winner.dataValues.userID });
			await giveawayDoc.save();
			setTimeout(async() => {
				await Giveaways.destroy({ where: { id: giveawayID } });
				await GiveawayParticipants.destroy({ where: { giveawayID: giveawayID, guildID: msg.guild.id } });
			}, 300000);
			break;
		}
		case "reroll": {
			let giveawayID = suffix.split(" ")[1];
			if (!giveawayID) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: "Voltus",
						description: "No giveaway ID specified.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}
			let doc = await Admins.findOne({ where: { serverID: msg.guild.id, userID: msg.author.id } });
			if ((!doc || doc.dataValues.level !== 2) && !maintainers.includes(msg.author.id) && !msg.member.hasPermission(["ADMINISTRATOR", "MANAGE_GUILD"])) {
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
			let giveawayDoc = await Giveaways.findOne({ where: { id: giveawayID, serverID: msg.guild.id } });
			if (!giveawayDoc) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Giveaway could not be found.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			if (serverDoc.dataValues.ownerEndsGiveaway && giveawayDoc.dataValues.owner !== msg.author.id) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Only the giveaway owner may reroll this giveaway.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			if (!giveawayDoc.dataValues.allowReroll) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "This giveaway cannot be rerolled.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}
			let participants = await GiveawayParticipants.findAll({ where: { id: giveawayID, serverID: msg.guild.id } });
			let winner = participants[Math.floor(Math.random() * participants.length)];
			msg.channel.send({
				embed: {
					color: 0x00FF00,
					title: ":tada: Giveaway over!",
					fields: [{
						name: `Giveaway Name`,
						value: giveawayDoc.dataValues.title,
					},
					{
						name: "Entry Count",
						value: `${participants.length}`,
					},
					{
						name: "Winner",
						value: `${msg.guild.members.get(winner.dataValues.userID).toString() || "invalid-user#0001"}`,
					}],
					footer: {
						text: require("../../package.json").version,
					},
				},
			});
			await giveawayDoc.set({ status: false, allowReroll: true, winner: winner.dataValues.userID });
			await giveawayDoc.save();
			break;
		}
		case "leave": {
			let giveawayID = suffix.split(" ")[1];
			if (!giveawayID) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: "Voltus",
						description: "No giveaway ID specified.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}
			let giveawayDoc = await Giveaways.findOne({ where: { id: giveawayID, serverID: msg.guild.id } });
			if (!giveawayDoc) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Giveaway could not be found.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			let particpantDoc = await GiveawayParticipants.findOne({ where: { userID: msg.author.id, giveawayID, guildID: msg.guild.id } });
			if (!particpantDoc) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "You are not a participant of this giveaway.",
						footer: {
							text: require("../../package.json").version,
						},
					},
				});
			}

			await GiveawayParticipants.destroy({ where: { userID: msg.author.id, giveawayID, guildID: msg.guild.id } });
			msg.channel.send({
				embed: {
					color: 0x00FF00,
					title: "Voltus",
					description: `You have left giveaway ID: ${giveawayID}`,
					footer: {
						text: require("../../package.json").version,
					},
				},
			});
			break;
		}
		default: {
			return msg.channel.send({
				embed: {
					color: 0x7452A2,
					title: "Voltus",
					description: "Invalid option, to continue, please rerun the command using one of the following arguments.",
					fields: [{
						name: "Start",
						value: "Allows you to start a giveaway. Requires admin level 2.",
					},
					{
						name: "Details",
						value: "Lets you view the details of the giveaway.",
					},
					{
						name: "Enroll",
						value: "Lets users enroll in giveaways.",
					},
					{
						name: "End",
						value: `Allows ${serverDoc.dataValues.ownerEndsGiveaway ? `the giveaway owner` : `an admin`} to end a giveaway and choose a winner.`,
					},
					{
						name: "Reroll",
						value: "Allows you to repick the giveaway winner. Cannot be ran with a giveaway message.",
					},
					{
						name: "Leave",
						value: "Allows a user to leave the giveaway.",
					}],
					footer: {
						text: require("../../package.json").version,
					},
				},
			});
		}
	}
};
