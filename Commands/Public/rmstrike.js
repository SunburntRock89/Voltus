const { maintainers } = require("../../Configuration/config.js");

module.exports = async(client, msg, suffix) => {
	let strikeIDs = suffix.split(" ");
	if (!strikeIDs[0] || !suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Could not resolve a member.",

			},
		});
	}
	let canContinue = true;
	let failedIDs = [];
	for (let i of strikeIDs) {
		let sDoc = await Strikes.findOne({ where: { id: i, guild: msg.guild.id } });
		if (!sDoc) {
			canContinue = false;
			failedIDs.push(i);
		}
		if (sDoc.dataValues.offender === msg.author.id) {
			canContinue = false;
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "You cannot remove your own strikes.",
				},
			});
		}
	}
	if (failedIDs[0] && !canContinue) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: `The following IDs could not be resolved:\n**${failedIDs.join(`**, **`)}**`,

			},
		});
	} else {
		for (let i of strikeIDs) {
			await Strikes.destroy({ where: { id: i, guild: msg.guild.id } });
		}
	}
	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: ":white_check_mark: Success!",
			description: `Removed ${strikeIDs.length} ${strikeIDs.length == 1 ? "strike" : "strikes"}.`,
		},
	});
};
module.exports.info = {
	name: "rmstrike",
	description: "Allows you to remove a strike from a user.",
	pack: "moderation",
	level: 1,
	aliases: ["rmstrikes"],
};
