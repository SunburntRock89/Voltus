module.exports = async msg => {
	let doc;

	let prefix = "";
	if (msg.guild) {
		doc = await ServerConfigs.findOne({ where: { id: msg.guild.id } });
		if (!doc) throw new Error("Something went hideously wrong with the server config document for ", msg.guild.id);
		if (doc.dataValues.ipFilter) require("../Internals/ipFilter")(msg, doc);
		if (msg.content.startsWith(client.user)) prefix = `${client.user} `;
		if (msg.content.startsWith(doc.dataValues.prefix)) prefix = doc.dataValues.prefix;
	}

	if (msg.author.bot || !msg.content.startsWith(doc.dataValues.prefix || `${client.user} `)) return;


	let cmd = msg.content.split(" ")[0].trim().toLowerCase().replace(prefix, "");
	let suffix = msg.content.split(" ").splice(1).join(" ")
		.trim();

	let alias = cmds.find(a => a.aliases.includes(cmd));

	const public = () => {
		try {
			cmdFile = reload(`./Commands/Public/${alias.name}`);
		} catch (err) {
			return null;
		}
	};

	let cmdFile;
	if (msg.channel.type === "dm") {
		try {
			cmdFile = reload(`./Commands/DM/${cmd}.js`);
		} catch (_) {
			return null;
		}
	} else if (config.maintainers.includes(msg.author.id)) {
		try {
			cmdFile = reload(`./Commands/Private/${cmd}.js`);
		} catch (_) {
			public();
		}
	} else {
		public();
	}

	// if (msg.guild && alias.pack !== "Essential" && !doc.dataValues[`${alias.pack}Enabled`]) return msg.channel.send(`The ${alias.pack} pack is not enabled in this server.`);

	cmdFile(client, msg, suffix).catch(err => {
		msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Unhandled Exception!",
				description: `An error occured while executing command: ${cmd}\n\`\`\`js\n${err.stack}\`\`\``,
				footer: {
					text: "Please contact a maintainer",
				},
			},
		});
	});
};
