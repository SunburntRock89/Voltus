const { maintainers } = require("../../Configuration/config.js");

const { post } = require("snekfetch");

module.exports = async(client, msg, suffix) => {
	let hrstart = process.hrtime();
	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error",
				description: `You didn't specifiy anything to eval.`,
				footer: {
					text: `Come on, give me something to work with!`,
				},
			},
		});
	}
	let time;
	let today = new Date();
	let dd = today.getDate();
	let mm = today.getMonth() + 1;
	let yyyy = today.getFullYear();
	if (dd < 10) {
		dd = `0${dd}`;
	}
	if (mm < 10) {
		mm = `0${mm}`;
	}
	time = `${today.getUTCHours()}:${today.getUTCMinutes()}:${today.getUTCSeconds()}`;
	today = `${dd}/${mm}/${yyyy}`;
	let result;
	try {
		if (suffix.startsWith("```js") && suffix.endsWith("```")) suffix = suffix.substring(5, suffix.length - 3);
		const asyncEval = (code, returns) => `(async () => {\n${!returns ? `return ${code.trim()}` : `${code.trim()}`}\n})()`;
		result = await eval(asyncEval(suffix, suffix.includes("return")));
	} catch (err) {
		if (err.stack.length <= 1980) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					description: `\`\`\`js\n${err.stack}\`\`\``,
					footer: {
						text: `Execution time: ${process.hrtime(hrstart)[0]}s ${Math.floor(process.hrtime(hrstart)[1] / 1000000)}ms`,
					},
				},
			});
		} else {
			let res;
			try {
				res = await post("https://hasteb.in/documents").send(`// Eval error results: ${time} ${today}\n\n${result}`);
			} catch (err2) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: `An unexpected error occurred while uploading to Hastebin.\`\`\`js\n${err.stack}\`\`\``,
					},
				});
			}
		}
	}
	if (typeof result !== "string") result = require("util").inspect(result, false, 1);
	let array = [
		client.token.escapeRegex(),
	];
	let regex = new RegExp(array.join("|"), "g");
	result = result.replace(regex, "Censored");
	if (result.length <= 1980) {
		return msg.channel.send({
			embed: {
				color: 0x00FF00,
				description: `\`\`\`js\n${result}\`\`\``,
				footer: {
					text: `Execution time: ${process.hrtime(hrstart)[0]}s ${Math.floor(process.hrtime(hrstart)[1] / 1000000)}ms`,
				},
			},
		});
	} else {
		let res;
		try {
			res = await post("https://hastebin.com/documents").send(`// Eval results: ${time} ${today}\n\n${result}`);
		} catch (err) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: `An unexpected error occurred while uploading to Hastebin.\`\`\`js\n${err.stack}\`\`\``,
				},
			});
		}
		msg.channel.send({
			embed: {
				color: 0x3669FA,
				title: `The eval results were too large!`,
				description: `So I uploaded them to Hastebin! https://hastebin.com/${res.body.key}`,
				footer: {
					text: "Sorry for the inconvenience.",
				},
			},
		});
	}
};

module.exports.info = {
	name: "Eval",
	description: "Evaluates Javascript and returns the response.",
	pack: "utility",
	level: 5,
};
