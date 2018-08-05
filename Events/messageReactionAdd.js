module.exports = async(reaction, user) => {
	if (reaction.emoji.name !== "star") return;

	let doc = await ServerConfigs.findOne({ where: { _id: user.guild.id } });
	if (!doc) winston.error(`[Database] Could not find document for Server ID: ${user.guild.id}`);

	if (!doc.starboardEnabled) return;

	if (!reaction.count < doc.starboardCount) return;

	
};
