module.exports = async member => {
	let doc = await ServerConfigs.findOne({ where: { id: member.guild.id } });
	if (!doc) throw new Error(`Something went hideously wrong with the server config document for ${member.guild.id}`);

	if (doc.dataValues.raidMode) return require("../Internals/raidModeguildMemberAdd.js")(client, member, doc);
	if (doc.dataValues.newMemberEnabled) {
		try {
			await member.guild.channels.get(doc.dataValues.newMemberChannel).send({
				embed: {
					color: 0x7452A2,
					title: ":wave: Welcome!",
					description: doc.dataValues.newMemberMessage.replace("@mention", member.toString())
						.replace("@member", member.user.tag)
						.replace("@id", member.id)
						.replace("@guild", member.guild.name),
				},
			});
		} catch (_) {
			// Ignore
		}
	}
};
