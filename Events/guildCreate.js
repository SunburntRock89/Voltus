module.exports = async(client, guild) => {
	let doc = await ServerConfigs.findOrCreate({ where: { id: guild.id }, defaults: { id: guild.id } });
	for (let m of guild.members) {
		if (m[1].hasPermission("ADMINSITRATOR") && !m[1].user.bot) {
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
			description: `I've just been added to **${guild.name}**, a server you own! To get started, run ${doc[0].dataValues.prefix}config`,
		},
	});
	console.log(`Joined server: ${guild.name}. ID: ${guild.id}`);
};
