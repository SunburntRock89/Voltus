const { Client } = require("discord.js");
const reload = require("require-reload")(require);
const Sequalize = require("sequalize");

const client = new Client({
	disableEveryone: true,
});
const sequalize = new Sequalize(auth.db.name, auth.db.user, auth.db.pwd, {
	host: auth.db.host,
	dialect: "mysql",

	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});

const auth = require("./Configuration/auth.json");
const config = require("./Configuration/config.json");

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);
});

Object.assign(String.prototype, {
	escapeRegex() {
		const matchOperators = /[|\\{}()[\]^$+*?.]/g;
		return this.replace(matchOperators, "\\$&");
	},
});

client.on("message", async msg => {
	if (msg.author.bot) return;
	if (msg.guild && !msg.content.startsWith(config.prefix)) return;

	const cmd = msg.content.split(" ")[0].trim().toLowerCase().replace(msg.guild ? config.prefix : "", "");
	const suffix = msg.content.split(" ").splice(1).join(" ")
		.trim();

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
	return cmdFile(client, msg, suffix);
});

client.login(auth.discord.token);
