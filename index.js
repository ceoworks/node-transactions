function *Transaction(tasks, context) {
	this.tasks = tasks;
	this.context = context;
	this._order = tasks.map( task => task.name );
	yield this.setState({ name: 'initial' }, 'initiation', context);
	return yield this.perform();
}

Transaction.prototype.perform = function *() {
	var self, result, rollbackTasks, errors;
	self = this;

	for (var task of self.tasks) {
		if (!self.context[task.name]) {
			self.context[task.name] = {};
		}
		try {
			result = yield task.perform(self.context);
			self.context[task.name].performResult = result;
			yield self.setState(task, 'perform', self.context);
		} catch (ex) {
			rollbackTasks = self.getRollbackTasks();
			errors = yield self.rollback(rollbackTasks);
			return {
				success: false,
				context: self.context,
				error: ex,
				rollbackErrors: errors
			};
		}
	}
	return {
		success: true,
		context: self.context,
		error: null,
		rollbackErrors: []
	};
};

Transaction.prototype.getRollbackTasks = function () {
	var state, index, rollbackTasks;
	state = this._state;
	index = this._order.indexOf(state);
	rollbackTasks = this.tasks.slice(0, index + 1).reverse();
	return rollbackTasks;
};

Transaction.prototype.rollback = function *(rollbackTasks) {
	var errors, self;
	self = this;
	errors = [];
	for (var task of rollbackTasks) {
		try {
			self.context[task.name].rollbackResult = yield task.rollback(self.context);
			yield self.setState(task, 'rollback', self.context);
		} catch (ex) {
			errors.push(ex);
		}
	}
	return errors;
};

Transaction.prototype.setState = function *(task, phase, context) {
	this._state = task.name;
	if (context.storeTransactionState) {
		yield context.storeTransactionState(task.name, phase, context);
	}
	return;
};

module.exports = Transaction;
