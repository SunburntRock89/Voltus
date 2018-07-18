module.exports = async(client, msg, suffix) => {
	let member;
	try {
		member = await client.memberSearch(suffix, msg.guild);
	} catch (err) {
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

	let userStrikes = await Strikes.findAll({ where: { guild: msg.guild.id, offender: member.id } });
	if (!userStrikes[0]) {
		return msg.channel.send({
			embed: {
				color: 0x7452A2,
				title: "Voltus",
				description: "This user has no strikes!",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}

	let fields = [];
	for (let i of userStrikes) {
		fields.push({
			name: `Warning from ${client.users.get(i.dataValues.creator).tag || "invalid-user#0001"}, ID: ${i.dataValues.id}`,
			value: i.dataValues.reason,
			inline: true,
		});
	}

	msg.channel.send({
		embed: {
			color: 0x7452A2,
			title: `Here are the strikes for ${member.user.tag}`,
			fields,
			footer: {
				text: `They have ${userStrikes.length} ${userStrikes.length == 1 ? "strike" : "strikes"}`,
			},
		},
	});
};

module.exports.info = {
	name: "Strikes",
	description: "Allows you to view a user's strikes.",
	pack: "moderation",
	level: 0,
	aliases: [],
};
