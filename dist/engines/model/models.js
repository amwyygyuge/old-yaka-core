'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _tool = require('./../../tool/');

var _mountFunctions2 = require('./mountFunctions');

var _mountFunctions3 = _interopRequireDefault(_mountFunctions2);

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var resolveParams = function resolveParams(params, auto, _ref) {
	var formValueGettingFunction = _ref.formValueGettingFunction,
	    getInitData = _ref.getInitData,
	    getState = _ref.getState;
	return new Promise(function (resolve) {
		var _params = {};
		if (params) {
			setTimeout(function () {
				_params = JSON.parse(JSON.stringify(params));
				Object.keys(_params).forEach(function (key) {
					var value = _params[key] ? _params[key].toString() : null;

					if ((0, _tool.isReadState)(value)) {
						var val = (0, _tool.readState)(value, getState());
						_params[key] = val;
						return;
					}

					if (value && value.indexOf('#') !== -1) {
						var _val = '';
						if (auto === true) {
							_val = getInitData()[value.slice(1, value.length)];
						} else {
							_val = formValueGettingFunction(value.slice(1, value.length));
						}
						if (_val && (typeof _val === 'undefined' ? 'undefined' : _typeof(_val)) === 'object' && _val.key && _val.label) {
							_val = _val.key;
						}
						_params[key] = _val;
						return;
					}
					_params[key] = value;
				});
				resolve(_params);
			}, 500);
		} else {
			resolve(_params);
		}
	});
};
var modelFactory = function modelFactory(model, yakaApis) {
	var type = model.type,
	    params = model.params,
	    url = model.url,
	    streams = model.streams,
	    _model$headers = model.headers,
	    headers = _model$headers === undefined ? {} : _model$headers,
	    mountFunctions = model.mountFunctions;
	var getState = yakaApis.getState,
	    getProps = yakaApis.getProps,
	    formValueGettingFunction = yakaApis.formValueGettingFunction,
	    getInitData = yakaApis.getInitData;

	Object.keys(headers).forEach(function (key) {
		var val = headers[key] ? headers[key].toString() : '';
		if ((0, _tool.isReadState)(val)) {
			headers[key] = (0, _tool.readState)(val, getState());
		}
		if (val.indexOf('@') !== -1) {
			var name = val.slice(1, val.length);
			if (getProps()[name]) {
				headers[key] = getProps()[name];
			}
		}
	});

	var changeURl = function changeURl(url, params) {
		var str = '';
		Object.keys(params).forEach(function (item, index) {
			if (index === 0) {
				str += '?' + item + '=' + params[item];
			} else {
				str += '&' + item + '=' + params[item];
			}
		});
		return '' + url + str;
	};

	var doFetch = function () {
		var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
			var auto = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			var _params, newURL;

			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_context.next = 2;
							return resolveParams(params, auto, {
								formValueGettingFunction: formValueGettingFunction,
								getInitData: getInitData,
								getState: getState
							});

						case 2:
							_params = _context.sent;


							if (type === 'get' || type === 'restful') {
								//支持url传递参数
								newURL = changeURl(url, _params);

								fetch(newURL, {
									headers: _extends({}, headers, {
										'Content-Type': 'application/json'
									}),
									method: 'GET',
									mode: 'cors'
								}).then(function (res) {
									return res.json();
								}).then(function (res) {
									var code = res.code.toString();
									if (code && code !== '0') {
										return;
									}
									mountFunctions && (0, _mountFunctions3.default)(mountFunctions, res, yakaApis);
									streams && (0, _stream2.default)(streams, res, yakaApis);
								});
							}
							if (type === 'post') {
								fetch(url, {
									headers: _extends({}, headers, {
										'Content-Type': 'application/json'
									}),
									method: 'POST',
									body: JSON.stringify(_params),
									mode: 'cors'
								}).then(function (res) {
									return res.json();
								}).then(function (res) {
									var code = res.code.toString();
									if (code && code !== '0') {
										return;
									}
									mountFunctions && (0, _mountFunctions3.default)(mountFunctions, res, yakaApis);
									streams && (0, _stream2.default)(streams, res, yakaApis);
								});
							}

						case 5:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, undefined);
		}));

		return function doFetch() {
			return _ref2.apply(this, arguments);
		};
	}();
	return doFetch;
};
var resolveModels = function resolveModels(models, yakaApis) {
	var _models = {};
	Object.keys(models || {}).forEach(function (key) {
		var model = models[key];
		_models[key] = modelFactory(model, yakaApis);
		if (model.action === 'auto') {
			_models[key](true);
		}
	});
	return _models;
};
exports.default = resolveModels;