module.exports = async(client, guild) => {
	let doc;
	try {
		doc = await ServerConfigs.findOneById(guild.id);
		if (!doc) throw new Error();
	} catch (err) {
		doc = ServerConfigs.create({
			id: guild.id,
		});
		for (let m of guild.members) {
			if (m.hasPermission("ADMINSITRATOR")) {
				await Admins.create({
					id: m.id,
					serverID: guild.id,
					level: 3,
				});
			}
		}
	}
	guild.owner.send({
		embed: {
			color: 0x7452A2,
			title: ":wave: Hey there!",
			description: `I've just been added to **${guild.name}**, a server you own! To get started, run ${doc.get("prefix")}config`,
		},
	});
};
