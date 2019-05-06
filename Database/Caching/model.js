const { Collection } = require("discord.js");
const resultFound = require("./result.js");
const { generate } = require("randomstring");

module.exports = class Model {
	constructor(sequelizeModel) {
		this.cache = new Collection();
		this.model = sequelizeModel;

		setInterval(() => { this.cache = new Collection(); }, 43200000);
	}

	get rawModel() {
		return this.model;
	}

	async get(options) {
		if (!options.where) throw Error("Nothing to search for.");

		let cachedOutput = this.cache.find(doc => {
			let results = [];
			for (let i of Object.entries(options.where)) {
				results.push(doc[i[0]] == i[1]);
			}

			if (results.lastIndexOf(false) == -1) return true;
			return false;
		});

		if (cachedOutput) {
			return new resultFound({
				dataValues: cachedOutput.dataValues,
				cache: this.cache,
			});
		}

		let output = await this.model.findOne(options);
		if (options.cache == undefined || options.cache) this.cache.set(generate(64), output);
		if (output) {
			return new resultFound({
				dataValues: output.dataValues,
				cache: this.cache,
			});
		}
		return null;
	}

	findOne(options) {
		return this.get(options);
	}

	async filter(options) {
		if (!options.where) throw Error("Nothing to search for.");

		let results = [];

		let cachedOutput = this.cache.filter(doc => {
			for (let i of Object.entries(options.where)) {
				let result = doc[i[0]] == i[1];
				results.push(result);
			}
			if (results[0]) return true;

			return false;
		});

		if (cachedOutput) {
			return new resultFound({
				dataValues: cachedOutput.dataValues,
				cache: this.cache,
			});
		}

		let output = await this.model.findAll(options);
		if (output) {
			this.cache.set(generate(64), output);
			return new resultFound({
				dataValues: output.dataValues,
				cache: this.cache,
			});
		}
		return null;
	}

	findAll(options) {
		this.filter(options);
	}

	async findCreateFind(options) {
		console.log(options)
		if (!options) throw new Error("Nothing to work with.");
		if (!options.where || !options.defaults) throw new Error("No where or default.");

		let thing = await this.get(options);
		if (thing) return new resultFound({ values: thing.dataValues, cache: this.cache });

		let result = await this.model.create(options.defaults);
		return result;
	}

	async create(options) {
		this.cache.set(options.id, options);

		await this.model.create(options);

		return options;
	}

	async uncache(id) {
		this.cache.delete(id);
	}
};
