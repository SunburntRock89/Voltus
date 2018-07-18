const randomstring = require("randomstring");

module.exports = async(msg, doc) => {
	if (msg.author.id === client.user.id) return;
	const regex = /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/gm;

	const toCheck = msg.content.replace("-", ".").replace(". ", ".").replace(" .", ".")
		.replace("­", "")
		.replace(" ­");
	let everything = toCheck.split(" ");
	let allIPs = [];
	for (let i of everything) {
		if (i.match(regex)) allIPs.push(i);
	}
	let ignored = [];
	if (allIPs.length == 0) return;
	for (let i of allIPs) {
		if (i.startsWith("192.168" || "10.0")) {
			ignored.push(i);
			continue;
		}
	}
	if (ignored.length == 0 || (ignored.length > 0 && allIPs.length !== ignored.length)) {
		await msg.delete();
		await msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":exclamation: IP Alert!",
				description: `${msg.author.toString()} posted ${allIPs.length > 1 ? `**${allIPs.length - ignored.length}** IPs` : `an IP`} in this chat. I have removed it for safety reasons.`,
			},
		});
		if (doc.dataValues.ipFilterStrike) {
			for (let i of allIPs) {
				if (ignored.includes(i)) continue;
				await Strikes.create({
					id: randomstring.generate({ length: "8", charset: "alphanumeric" }),
					guild: msg.guild.id,
					offender: msg.author.id,
					creator: client.user.id,
					reason: `User posted an IP in ${msg.channel.name}`,
				});
				msg.member.send({
					embed: {
						color: 0xFF0000,
						title: ":exclamation: Uh oh!",
						description: `You've just been strike in **${msg.guild.name}** with reason: User posted an IP in ${msg.channel.name}`,
						footer: {
							text: `You now have ${msg.guild.members.size} members.`,
						},
					},
				});
			}
		}
	}
};
