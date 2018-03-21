const { maintainers } = require("../../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let doc = await Admins.findOne({ where: { serverID: msg.guild.id, id: msg.author.id } });
	if (!doc && !maintainers.includes(msg.author.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You do not have permission to execute this command.",
				footer: {
					text: require("../../package.json").version,
				},
			},
		});
	}
	let strikeIDs = suffix.split(" ");
	if (!strikeIDs[0] || !suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Could not resolve a member.",
				footer: {
					text: require("../../package.json").version,
				},
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
	}
	if (failedIDs[0] && !canContinue) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: `The following IDs could not be resolved:\n**${failedIDs.join(`**, **`)}**`,
				footer: {
					text: require("../../package.json").version,
				},
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
			footer: {
				text: require("../../package.json").version,
			},
		},
	});
};
