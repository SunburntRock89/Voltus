module.exports = async(reaction, user) => {
	let doc = await ServerConfigs.findOne({ where: { _id: user.guild.id } });
	if (!doc) winston.error("[D]");
};
