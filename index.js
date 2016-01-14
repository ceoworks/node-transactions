var co = require('co'),
	async = require('async'),
	_ = require('lodash');

function *Transaction(tasks, context) {
	// context.db, context.data etc.
	this.tasks = tasks;
	this.context = context;
	this.setState('initial');
	this._order = tasks.map( task => task.name );
	return yield this.perform();
}

Transaction.prototype.perform = function *() {
	var transaction, performingTasks, db, self, result, operation, rollbackOrder;
	self = this;
	db = self.context.db;

	for (var task of self.tasks) {
		// try/catch errors and brake if some
		try {
			result = yield task.perform(self.context);
			self.context[task.name] = result;
			self.setState(task.name);
		} catch (ex) {
			rollbackOrder = self.getRollbackOrder();
			yield self.rollback(rollbackOrder);
			return { success: false, error: ex };
		}
	}
	return { success: true, context: self.context };
};

Transaction.prototype.getRollbackOrder = function () {
	var state, index, rollbackOrder;
	state = this._state;
	index = this._order.indexOf(state);
	rollbackOrder = this._order.slice(0, index).reverse();
	return rollbackOrder;
};

Transaction.prototype.rollback = function *(rollbackOrder) {
	return rollbackOrder;
};

Transaction.prototype.setState = function (state) {
	this._state = state;
	return;
};

module.exports = Transaction;


// transaction = (yield db.Transactions.collection.insertOne({state: 'initial'})).ops[0];
// if (!result.length) {
// 	throw new Error('Inserting transaction with initial state failed');
// }

// yield self.context.db.Transactions.collection.findOneAndUpdate({_id: self._id}, { $set: { state: task.name } }, { returnOriginal: false });
// if (!operation.value || operation.value.state !== task.name) {
// 	rollbackOrder = self.getRollbackOrder(task.name);
// 	return self.rollback(rollbackOrder);
// 	break;
// }
