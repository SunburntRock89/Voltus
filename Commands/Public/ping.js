module.exports = async(client, msg, args) => {
	msg.channel.send({
		embed: {
			color: 0x7452A2,
			title: "Voltus",
			description: `Pong! Took ${Math.floor(client.ping)}ms :ping_pong:`,
			footer: {
				text: require("../../package.json").version,
			},
		},
	});
};
module.exports.help = {
	name: "Ping",
	description: "Shows you the ping to the Discord API.",
	pack: "utility",
	level: 0,
};
