module.exports = async(client, msg, args) => {
	let embedColor;
	msg.channel.send({
		embed: {
			color: 0xFF0000,
			title: "Pinging...",
		},
	}).then(nmsg => {
		if ((nmsg.createdAt - msg.createdAt) >= 300) embedColor = 0xFF0000;
		if ((nmsg.createdAt - msg.createdAt) >= 200 && !embedColor) embedColor = 0xFFA500;
		if ((nmsg.createdAt - msg.createdAt) >= 150 && !embedColor) embedColor = 0x00FF00;

		if (!embedColor) embedColor = 0x7452A2;
		nmsg.edit({
			embed: {
				color: embedColor,
				title: "Pong!",
				description: `Took ${nmsg.createdAt - msg.createdAt}ms :ping_pong:`,
			},
		});
	});
};

module.exports.info = {
	name: "Ping",
	description: "Shows you the ping to the Discord API.",
	pack: "utility",
	level: 0,
	aliases: ["pig"],
};
