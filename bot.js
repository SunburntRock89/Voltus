const { Client } = require("discord.js");
const { readdir } = require("fs-nextra");
const { createLogger, format, transports } = require("winston");

const reload = global.reload = require("require-reload")(require);
const Sequelize = global.Sequelize = require("sequelize");
const DailyRotateFile = require("winston-daily-rotate-file");

const auth = require("./Configuration/auth.js");
const config = global.config = require("./Configuration/config.js");

const client = global.client = new Client({
	disableEveryone: true,
});

const winston = global.winston = createLogger({
	transports: [
		new transports.Console({
			colorize: true,
		}),
		new DailyRotateFile({
			filename: "./Logs/Winston-Log-%DATE%.log",
			datePattern: "YYY-MM-DD-HH",
			zippedArchive: true,
			maxFiles: "14d",
			maxSize: "20m",
		}),
	],
	exitOnError: false,
	format: format.combine(
		format.colorize(),
		format.simple(),
	),
});

const cmds = global.cmds = [];

(async() => {
	await require("./Database/init.js")();

	let structures = await readdir("./Structures");
	for (let s of structures) if (s.endsWith(".js")) require(`./Structures/${s}`)();
	// Event Handler
	let events = await readdir("./Events");
	for (let e of events) {
		let name = e.replace(".js", "");
		client.on(name, (...args) => require(`./Events/${e}`)(...args));
	}

	// Command importer
	let n = 0;
	let dir = await readdir("./Commands/Public");
	for (let d of dir) {
		let command = reload(`./Commands/Public/${d}`);
		command.info.aliases.push(d.split(".js")[0]);
		cmds.push({ name: d.split(".js")[0], aliases: command.info.aliases, pack: command.info.pack });
		n++;
	}
	winston.info(`[Command Loader] Loaded ${n} commands.`);

	login();
})();

Object.assign(String.prototype, {
	escapeRegex() {
		const matchOperators = /[|\\{}()[\]^$+*?.]/g;
		return this.replace(matchOperators, "\\$&");
	},
});

const login = () => client.login(require("./Configuration/auth.js").discord.token).catch(() => {
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
