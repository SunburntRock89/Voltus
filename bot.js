const { Client } = require("discord.js");
const reload = require("require-reload")(require);
const Sequelize = require("sequelize");

const auth = require("./Configuration/auth.json");
const config = require("./Configuration/config.json");

const client = new Client({
	disableEveryone: true,
});
const sequelize = new Sequelize({
	host: auth.db.host,
	database: auth.db.name,
	username: auth.db.user,
	password: auth.db.pwd,

	dialect: "mysql",
	logging: false,

	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});

let readytostart = false;
client.once("ready", async() => {
	console.log(`Logged in as ${client.user.tag}`);
	if (client.guilds.size === 0) console.log(`This bot isn't in any servers! Invite it using ${await client.generateInvite(["ADMINISTRATOR"])}`);
	client.user.setActivity("Starting...");
	await require("./Database/init.js")(sequelize);
	for (let g of client.guilds) {
		let doc;
		try {
			doc = await ServerConfigs.findOne({ where: { id: g[1].id } });
			if (!doc) throw new Error();
		} catch (err) {
			require("./Events/guildCreate")(client, g[1]);
		}
	}
	readytostart = true;
	client.user.setActivity(config.playingMessage.replace("{guilds}", client.guilds.size).replace("{users}", client.users.size));
	console.log("Ready!");
});

Object.assign(String.prototype, {
	escapeRegex() {
		const matchOperators = /[|\\{}()[\]^$+*?.]/g;
		return this.replace(matchOperators, "\\$&");
	},
});

client.on("message", async msg => {
	if (!readytostart) return;
	let doc;
	if (msg.guild) {
		doc = await ServerConfigs.findOne({ where: { id: msg.guild.id } });
		if (!doc) throw new Error("Something went hideously wrong with the server config document for ", msg.guild.id);
	}
	if (msg.guild && doc.dataValues.ipFilter) {
		require("./Internals/ipFilter")(client, msg, doc);
	}
	if (msg.guild && !msg.content.startsWith(doc.dataValues.prefix) && !msg.content.startsWith(client.user)) return;
	if (msg.author.bot) return;
	let cmd, suffix;
	if (msg.content.startsWith(doc.dataValues.prefix)) {
		cmd = msg.content.split(" ")[0].trim().toLowerCase().replace(msg.guild ? doc.dataValues.prefix : "", "");
		suffix = msg.content.split(" ").splice(1).join(" ")
			.trim();
	} else if (msg.content.startsWith(`${client.user} `)) {
		cmd = msg.content.split(`${client.user} `)[1].trim().replace(client.user, "").split(" ")[0].trim();
		suffix = msg.content.split(`${cmd} `)[1];
	}

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
			try {
				cmdFile = reload(`./Commands/Public/${cmd}.js`);
			} catch (__) {
				return null;
			}
		}
	} else {
		try {
			cmdFile = reload(`./Commands/Public/${cmd}.js`);
		} catch (_) {
			return null;
		}
	}
	if (msg.guild && cmdFile.info.pack === "moderation" && !doc.dataValues.moderationEnabled) return msg.channel.send("The moderation pack is not enabled in this server.");
	cmdFile(client, msg, suffix);
});

client.memberSearch = async(string, guild) => new Promise((resolve, reject) => {
	let foundMember;
	string = string.trim();

	if (string.startsWith("<@!")) {
		foundMember = guild.members.get(string.slice(3, -1));
	} else if (string.startsWith("<@")) {
		foundMember = guild.members.get(string.slice(2, -1));
	} else if (!isNaN(string) && new RegExp(/^\d+$/).test(string)) {
		foundMember = guild.members.get(string);
	} else if (string.startsWith("@")) {
		string = string.slice(1);
	}
	if (string.lastIndexOf("#") === string.length - 5 && !isNaN(string.substring(string.lastIndexOf("#") + 1))) {
		foundMember = guild.members.filter(member => member.user.username === string.substring(0, string.lastIndexOf("#") + 1))
			.find(member => member.user.discriminator === string.substring(string.lastIndexOf("#") + 1));
	}
	if (!foundMember) {
		foundMember = guild.members.find(member => member.user.username.toLowerCase() === string.toLowerCase());
	}
	if (!foundMember) {
		foundMember = guild.members.find(member => member.nickname && member.nickname.toLowerCase() === string.toLowerCase());
	}
	if (foundMember) {
		resolve(foundMember);
	} else {
		reject(new Error("Failed to find member"));
	}
});


client.on("guildCreate", async guild => {
	require("./Events/guildCreate")(client, guild);
});

client.on("guildMemberAdd", async member => {
	let doc = await ServerConfigs.findOne({ where: { id: member.guild.id } });
	if (!doc) throw new Error("Something went hideously wrong with the server config document for ", member.guild.id);

	if (doc.dataValues.raidMode) return require("./Internals/raidModeguildMemberAdd")(client, member, doc);
	if (doc.dataValues.newMemberEnabled) {
		try {
			member.guild.channels.get(doc.dataValues.newMemberChannel).send({
				embed: {
					color: 0x00FF00,
					title: ":wave: Welcome!",
					description: doc.dataValues.newMemberMessage.replace("@mention", member.toString())
						.replace("@member", member.user.tag)
						.replace("@id", member.id)
						.replace("@guild", member.guild.name),
					footer: {
						text: require("../../package.json").version,
					},
				},
			});
		} catch (_) {
			// Ignore
		}
	}
});

process.on("unhandledRejection", (_, promise) => console.log(require("util").inspect(promise, null, 2)));

client.login(auth.discord.token);
