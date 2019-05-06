module.exports = class Result {
	constructor(options) {
		if (!options.dataValues) {
			throw new Error("No dataValues to work with.");
		}

		this.dataValues = options.dataValues;
		this.cache = options.cache;
	}

	get datadataValues() {
		return this.dataValues;
	}

	set(options) {
		this.dataValues.set(options);
	}

	async save() {
		this.cache.uncache(this.dataValues.id);
		return this.dataValues.save();
	}
};
