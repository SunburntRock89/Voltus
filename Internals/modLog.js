module.exports = async options => {
	let channel;
	try {
		channel = await client.channels.get(options.logChannel);
	} catch (_) {
		return;
	}

	let entry = await ModLog.create({
		type: options.type,
		moderator: options.moderator.id,
		user: options.user.id,
		reason: options.reason,
	});
	await channel.send({
		embed: {
			description: [
				`:hammer: **Case ${entry.id}**: ${entry.type}`,
				`:bust_in_silhouette: **User**: ${options.user.tag}`,
				`:dolphin: **Moderator**: ${options.moderator.tag}`,
				`:question: **Reason**: ${options.reason ? options.reason : "No Reason."}`,
			].join("\n"),
			footer: {
				text: `Use "${options.doc.prefix}reason ${entry.id} <New Reason>" to set a new reason.`,
			},
		},
	});
	if (entry.type === "Mute" || entry.type === "Unmute") {
		await channel.send({
			embed: {
				description: [
					`:hammer: **Case ${entry.id}**: ${entry.type}`,
					`:bust_in_silhouette: **User**: ${options.user.tag}`,
					`:dolphin: **Moderator**: ${options.moderator.tag}`,
				].join("\n"),
				footer: {
					text: `Use "${options.doc.prefix}reason ${entry.id} <New Reason>" to set a new reason.`,
				},
			},
		});
	}
};
