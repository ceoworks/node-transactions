function *Transaction(tasks, context) {
	// context.db, context.data etc.
	this.tasks = tasks;
	this.context = context;
	this.setState('initial');
	this._order = tasks.map( task => task.name );
	return yield this.perform();
}

Transaction.prototype.perform = function *() {
	var self, result, rollbackTasks, errors;
	self = this;

	for (var task of self.tasks) {
		try {
			result = yield task.perform(self.context);
			self.context[task.name + 'Result'] = result;
			self.setState(task.name);
		} catch (ex) {
			rollbackTasks = self.getRollbackTasks();
			errors = yield self.rollback(rollbackTasks);
			return { success: false, context: self.context, error: ex, rollbackErrors: errors };
		}
	}
	return { success: true, context: self.context };
};

Transaction.prototype.getRollbackTasks = function () {
	var state, index, rollbackTasks;
	state = this._state;
	index = this._order.indexOf(state);
	rollbackTasks = this.tasks.slice(0, index + 1).reverse();
	return rollbackTasks;
};

Transaction.prototype.rollback = function *(rollbackTasks) {
	var result, errors, self;
	self = this;
	errors = [];
	for (var task of rollbackTasks) {
		try {
			result = yield task.rollback(self.context);
		} catch (ex) {
			errors.push(ex);
		}
	}
	return errors;
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
