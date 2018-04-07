module.exports = async(client, msg, args) => {
	let embedColor;
	if (client.ping >= 300) embedColor = 0xFF0000;
	if (client.ping <= 200 && !embedColor) embedColor = 0xFFA500;
	if (client.ping <= 150 && !embedColor) embedColor = 0x00FF00;
	msg.channel.send({
		embed: {
			color: embedColor,
			title: "Voltus",
			description: `Pong! Took ${Math.floor(client.ping)}ms :ping_pong:`,
			footer: {
				text: require("../../package.json").version,
			},
		},
	});
};

module.exports.info = {
	name: "Ping",
	description: "Shows you the ping to the Discord API.",
	pack: "utility",
	level: 0,
};
