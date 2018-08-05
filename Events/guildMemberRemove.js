module.exports = async member => {
	let doc = await ServerConfigs.findOne({ where: { id: member.guild.id } });
	if (!doc) throw new Error(`Something went hideously wrong with the server config document for ${member.guild.id}`);

	if (doc.dataValues.raidMode) return require("./Internals/raidModeguildMemberRemove")(client, member, doc);
	if (doc.dataValues.leaveEnabled) {
		try {
			member.guild.channels.get(doc.dataValues.leaveChannel).send({
				embed: {
					color: 0x7452A2,
					title: "Voltus",
					description: doc.dataValues.leaveMessage.replace("@mention", member.toString())
						.replace("@member", member.user.tag)
						.replace("@id", member.id)
						.replace("@guild", member.guild.name),
					footer: {
						text: require("../package.json").version,
					},
				},
			});
		} catch (_) {
			winston.error(_);
		}
	}
};
