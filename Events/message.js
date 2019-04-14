const { getAdminLevel, getServerDoc } = require("../Internals/util.js");

module.exports = async msg => {
	let doc;

	let prefix = "";
	if (msg.guild) {
		doc = await getServerDoc(msg.guild.id);
		if (!doc) {
			msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "An unexpected database error has occured.",
					footer: {
						text: "Please contact SunburntRock89#6617 for support.",
					},
				},
			});
			winston.error("Something went hideously wrong with the server config document for ", msg.guild.id);
		}
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
	if (cmdFile.info.level > 0) {
		let level = getAdminLevel(msg, cmdFile.info.level);
		msg.author.adminLevel = level;
		if (level > cmdFile.info.level) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "You do not have permission to execute this command.",
				},
			});
		}
	}

	if (cmdFile) {
		cmdFile(client, msg, suffix, doc).catch(err => {
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
	}
};
