const { get } = require("snekfetch");

module.exports = async(client, msg, suffix) => {
	const casE = suffix.split(" ")[0];
	let rawquery = suffix.replace(casE, "");
	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You need to give me something to do!",
			},
		});
	}
	const rarity = [
		{ name: "Handmade", color: 0xC7C7C7 },
		{ name: "Common", color: 0x7E7E7E },
		{ name: "Uncommon", color: 0x00AA4C },
		{ name: "Rare", color: 0x008EC1 },
		{ name: "Epic", color: 0xAC00E6 },
		{ name: "Legendary", color: 0xDB9E1C },
		{ name: "Mythic", color: 0xFFD700 },
	];
	switch (casE) {
		case "search": {
			if (rawquery.length < 0) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "You need to give me something to search for!",
					},
				});
			}
			let query = encodeURIComponent(rawquery);
			query = query.replace(/^\w/, c => c.toUpperCase());
			let result = await get(`https://fnbr.co/api/images?search=${query}&limit=1`)
				.set("x-api-key", require("../../Configuration/auth.js").services.fnbr)
				.catch(() => msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Your search returned no results!",
					},
				}));

			if (!result.body.data[0]) {
				return msg.channel.send({
					embed: {
						color: 0xFF0000,
						title: ":x: Error!",
						description: "Your search returned no results!",
					},
				});
			}
			let color = rarity.find(r => r.name.toLowerCase() === result.body.data[0].rarity).color;
			msg.channel.send({
				embed: {
					author: {
						name: client.user.username,
						icon_url: client.user.avatarURL(),
					},
					color,
					title: rawquery,
					thumbnail: {
						url: result.body.data[0].images.icon,
					},
					// image: {
					// 	url: sharp((await get(result.body.data[0].images.gallery)).body).resize(500, 500).png(),
					// 	height: 100,
					// 	width: 250,
					// },
					fields: [{
						name: "Price",
						value: result.body.data[0].price,
					},
					{
						name: "Type",
						value: result.body.data[0].readableType,
						inline: true,
					},
					{
						name: "Rarity",
						value: result.body.data[0].rarity.replace(/^\w/, c => c.toUpperCase()),
					}],
					footer: {
						text: `Data from https://fnbr.co`,
					},
				},
			});
			break;
		}
		case "store": {
			// TODO: FINISH
			break;
		}
		default: {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "This option is invalid",
				},
			});
		}
	}
};
module.exports.info = {
	name: "fnbr",
	level: 0,
	pack: "fun",
	description: "Lets you view items in Fortnite Battle Royale.",
	aliases: [],
};
