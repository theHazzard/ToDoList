var mongo = require('mongoose');

var ToDoSchema = mongo.Schema({
	_userId: { type: mongo.Schema.Types.ObjectId, ref: 'User'},
	mensaje: { type: String, required: true, default: 'Todo Item' },
	finalizado: { type: Boolean, default: 0 },
	created_at: { type: Date, default: Date.now },
	modified_at: { type: Date, default: Date.now }
});

module.exports = mongo.model('ToDo', ToDoSchema);