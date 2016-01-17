var expect = require('chai').expect,
	mocha = require('mocha'),
	coMocha = require('co-mocha'),
	Transactions = require('../'),
	util = require('./util');
coMocha(mocha);

describe('node transactions engine', function () {
	var context, additionTask, subtractionTask, divideTask, result;
	before(function *() {
		context = {
			var1: 10,
			var2: 5
		};
		additionTask = {
			name: 'addition',
			perform: function *(context) {
				return util.add(context.var1, context.var2);
			},
			rollback: function *(context) {
				return util.square(context.var1);
			}
		};
		subtractionTask = {
			name: 'subtraction',
			perform: function *(context) {
				return util.subtract(context.var1, context.var2);
			},
			rollback: function *(context) {
				return util.square(context.var2);
			}
		};

		result = yield new Transactions([additionTask, subtractionTask], context);
	});

	it('should succesfully perform two tasks', function () {
		expect(result.success).to.equal(true);
		expect(result).to.have.property('context').to.be.an('object');
		expect(result).to.have.property('error').to.equal(null);
		expect(result).to.have.property('rollbackErrors').to.be.an('array').to.have.length(0);

		expect(result.context.addition.performResult).to.equal(15);
		expect(result.context.subtraction.performResult).to.equal(5);
	});
	describe('when exception', function() {
		before(function *() {
			divideTask = {
				name: 'divide',
				perform: function *(context) {
					return util.divideWithException(context.var1);
				}
			};

			result = yield new Transactions([additionTask, subtractionTask, divideTask], context);
		});

		it('should fail and rollback', function () {
			expect(result.success).to.equal(false);
			expect(result).to.have.property('context').to.be.an('object');
			expect(result).to.have.property('error');
			expect(result).to.have.property('rollbackErrors').to.be.an('array').to.have.length(0);

			expect(result.error.message).to.equal('Dividing error with context: 10');
			expect(result.context.addition.performResult).to.equal(15);
			expect(result.context.subtraction.performResult).to.equal(5);

			expect(result.context.addition.rbResult).to.equal(100);
			expect(result.context.subtraction.rbResult).to.equal(25);
		});
	});
});
