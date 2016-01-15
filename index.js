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
		if (!self.context[task.name]) {
			self.context[task.name] = {};
		}
		try {
			result = yield task.perform(self.context);
			self.context[task.name].performResult = result;
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
	var errors, self;
	self = this;
	errors = [];
	for (var task of rollbackTasks) {
		try {
			self.context[task.name].rbResult = yield task.rollback(self.context);
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
