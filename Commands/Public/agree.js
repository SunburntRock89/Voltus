module.exports = async(client, msg, suffix, doc) => {
	await msg.delete();

	if (!doc.dataValues.agreeEnabled || !doc.dataValues.agreeRole) return msg.reply("Agree has not been setup on this server.");

	if (doc.dataValues.agreeChannel && doc.dataValues.agreeChannel !== msg.channel.id) return msg.reply("Agree cannot be used in this channel.");

	let role;
	try {
		role = await msg.guild.roles.get(doc.dataValues.agreeRole);
	} catch (_) {
		msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "The role given to new members is invalid.",
			},
		});
	}

	if (role) msg.member.roles.add(role);
};
module.exports.info = {
	name: "Agree",
	description: "Allows a user to agree to the rules.",
	pack: "utility",
	level: 0,
	aliases: [],
};
