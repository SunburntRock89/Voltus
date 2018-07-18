module.exports = async() => {
	if (!client.user.bot) {
		await client.destroy();
		winston.error("[Discord] \u001B[31mVoltus is currently not running on a Discord Developer Bot account (https://discordapp.com/developers/applications/me). This is against Discord ToS and as such Voltus has automatically terminated its process.");
		return process.reallyExit(1);
	}
	winston.info(`[Discord] \u001B[34mLogged in as ${client.user.tag}`);
	if (client.guilds.size === 0) winston.info(`[Discord] This bot isn't in any servers! Invite it using ${await client.generateInvite(["ADMINISTRATOR"])}`);
	client.user.setActivity("Starting...");
	for (let g of client.guilds.values()) {
		let doc;
		try {
			doc = await ServerConfigs.findOne({ where: { id: g.id } });
			if (!doc) throw new Error();
		} catch (err) {
			require("./guildCreate")(client, g);
		}
	}
	client.user.setActivity(config.playingMessage.replace("{guilds}", client.guilds.size).replace("{users}", client.users.size));
	winston.info("[Discord] \u001B[35mReady!\u001B[0m");
};
