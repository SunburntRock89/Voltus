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

	let user, reason;
	if (suffix.indexOf("|") > -1 && suffix.length > 3) {
		user = suffix.substring(0, suffix.indexOf("|")).trim();
		reason = suffix.substring(suffix.indexOf("|") + 1).trim();
	} else {
		reason = "No reason";
		user = suffix;
	}

	if (!/\d{17,19}/.test(user)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Not a valid user!.",
			},
		});
	}

	let name;
	try {
		name = client.users.get(user).tag;
	} catch (err) {
		name = suffix;
	}

	if (msg.guild.members.get(user)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "This user is in the server! Please use the **ban** command.",
			},
		});
	}

	let banFunc = async() => {
		try {
			await msg.guild.members.ban(user, { days: 7, reason });
			modLogger.log({
				type: "Hackban",
				moderator: {
					id: msg.author.id,
					tag: msg.user.tag,
				},
				user: {
					id: user,
					name: user,
				},
				reason,
			});
		} catch (err) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "This user does not exist!",
				},
			});
		}
		msg.channel.send({
			embed: {
				color: 0x00FF00,
				title: ":white_check_mark: Success!",
				description: `Successfully banned **${name}** with ${reason == "No reason" ? "no reason." : `reason: **${reason}**`}`,
				footer: {
					text: `You now have ${msg.guild.members.size} members.`,
				},
			},
		});
	};

	if (serverDoc.dataValues.banConfirms) {
		msg.channel.send({
			embed: {
				color: 0xFFFF00,
				title: ":question: Are you sure?",
				description: `Are you sure you want to ban **${name}**?`,
				footer: {
					text: "Reply with yes or no",
				},
			},
		});
		let collector = await msg.channel.createMessageCollector(newmsg => msg.author.id === newmsg.author.id, { time: 30000, number: 1 });
		collector.on("collect", async cmsg => {
			switch (cmsg.content.toLowerCase()) {
				case "yes": {
					await banFunc();
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
					break;
				}
			}
		});
	} else {
		await banFunc();
	}
};
module.exports.info = {
	name: "Hackban",
	description: "Allows you to ban a user who is not in the server.",
	pack: "Moderation",
	level: 4,
	aliases: [],
};
