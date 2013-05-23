var mongo = require('mongoose')
	, bcrypt = require('bcrypt')
	, SALT_WORK_FACTOR = 10;

var UserSchema = mongo.Schema({
	usuario: { type: String, required: true },
	password: { type: String, required: true },
	created_at: { type: Date, default: Date.now },
	modified_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

module.exports = mongo.model('User', UserSchema);