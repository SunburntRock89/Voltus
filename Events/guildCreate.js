module.exports = async guild => {
	let doc = await ServerConfigs.findOrCreate({ where: { id: guild.id }, defaults: { id: guild.id } });
	for (let m of guild.members.values()) {
		if (m.hasPermission("ADMINSITRATOR") && !m.user.bot) {
			await Admins.create({
				userID: m[1].id,
				serverID: guild.id,
				level: 3,
				type: "user",
			});
		}
	}

	guild.owner.send({
		embed: {
			color: 0x7452A2,
			title: ":wave: Hey there!",
			description: `I've just been added to **${guild.name}**, a server you own! To get started, run \`${doc[0].dataValues.prefix}config\``,
		},
	});
	winston.info(`[Discord] Joined server: ${guild.name}. ID: ${guild.id}`);
};
