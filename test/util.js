module.exports = {
	add: function (var1, var2) {
		return var1 + var2;
	},
	subtract: function (var1, var2) {
		return var1 - var2;
	},
	square: function (var1) {
		return var1 * var1;
	},
	divideWithException: function(var1) {
		throw new Error('Dividing error with context: ' + var1);
	}
};
