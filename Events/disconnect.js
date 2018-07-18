module.exports = async() => {
	client.login(require("./Configuration/auth.js").discord.token).catch(() => {
		let interval = setInterval(() => {
			client.login(require("./Configuration/auth.js").discord.token)
				.then(() => {
					clearInterval(interval);
				})
				.catch(() => {
					winston.info("[Discord] Failed to connect. Retrying in 5 minutes...");
				});
		}, 300000);
	});
};
