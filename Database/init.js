const { readdir } = require("fs-nextra");

const auth = require("../Configuration/auth.js");

const sequelize = new Sequelize({
	host: auth.db.host,
	database: auth.db.name,
	username: auth.db.user,
	password: auth.db.pwd,

	dialect: "postgres",
	logging: false,
	operatorsAliases: Sequelize.Op,

	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});

module.exports = async() => {
	sequelize.authenticate()
		.then(() => winston.info("[Database] Successfully connected."))
		.catch(err => winston.error("[Database] Failed to connect: ", err.stack));
	let schemas = await readdir("./Database/Schemas");
	for (let s of schemas) require(`./Schemas/${s}`)(sequelize);
	return sequelize;
};
