module.exports = class Result {
	constructor(options) {
		if (!options.values) {
			throw new Error("No values to work with.");
		}

		this.values = options.values;
		this.cache = options.cache;
	}

	get dataValues() {
		return this.values;
	}

	set(options) {
		this.values.set(options);
	}

	async save() {
		this.cache.uncache(this.values.id);
		return this.values.save();
	}
};
