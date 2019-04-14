module.exports = async guild => {
	let doc = await ServerConfigs.findCreateFind({ where: { id: guild.id }, defaults: { id: guild.id }, cache: false });
	for (let m of guild.members.values()) {
		if (m.hasPermission("ADMINSITRATOR") && !m.user.bot) {
			await Admins.create({
				userID: m.id,
				serverID: guild.id,
				level: 3,
				type: "user",
			});
		}
	}

	try {
		await guild.owner.send({
			embed: {
				color: 0x7452A2,
				title: ":wave: Hey there!",
				description: `I've just been added to **${guild.name}**, a server you own! To get started, run \`${doc[0].dataValues.prefix}config\``,
			},
		});
	} catch (_) {
		// Ignore
	}
	winston.info(`[Discord] Joined server: ${guild.name}. ID: ${guild.id}`);
};
