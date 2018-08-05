module.exports = async(client, msg, suffix) => {
	await msg.delete();
	let doc = await ServerConfigs.findOne({ where: { id: msg.guild.id } });
	if (!doc) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "An unexpected database error has occured.",
				footer: {
					text: "Please contact SunburntRock89#6617 for support.",
				},
			},
		});
	}

	if (!doc.dataValues.agreeEnabled || !doc.dataValues.agreeRole) return msg.reply("Agree has not been setup on this server.");

	if (doc.dataValues.agreeChannel && doc.dataValues.agreeChannel !== msg.channel.id) return msg.reply("Agree cannot be used in this channel.");

	let role = await msg.guild.roles.get(doc.dataValues.agreeRole)
		.catch(() => msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "The role given to new members is incorrect.",
			},
		}));

	if (role) msg.member.roles.add(role);
};
