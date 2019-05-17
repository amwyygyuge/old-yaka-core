'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

var _mountFunctions = require('./mountFunctions');

var _mountFunctions2 = _interopRequireDefault(_mountFunctions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resolveFunctions = function resolveFunctions(functions, yakaApis) {
	var _functions = {};
	Object.keys(functions || {}).forEach(function (key) {
		_functions[key] = function (e) {
			functions[key].streams && (0, _stream2.default)(functions[key].streams, e, yakaApis);
			functions[key].mountFunctions && (0, _mountFunctions2.default)(functions[key].mountFunctions, e, yakaApis);
		};
	});
	return _functions;
};
exports.default = resolveFunctions;