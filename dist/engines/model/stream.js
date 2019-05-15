'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.streamFilter = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _tool = require('./../../tool');

// 数据分流
var streamFilter = function streamFilter(streamIn, data) {
	var val = null;
	switch (typeof streamIn === 'undefined' ? 'undefined' : _typeof(streamIn)) {
		//数据别名
		case 'object':
			if (streamIn.path) {
				// 获取数据
				val = (0, _tool.streamForm)(streamIn.path.toString().split('.'), {}, data);
				if (streamIn.keys) {
					var keys = streamIn.keys;

					if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
						if (Array.isArray(val)) {
							val = val.map(function (item) {
								var _val = {};
								keys.forEach(function (key) {
									_val[key] = item[key];
								});
								return _val;
							});
						} else {
							var _val = {};
							keys.forEach(function (key) {
								_val[key] = val[key];
							});
							val = _val;
						}
					}
				}
				// 处理别名
				if (streamIn.alias) {
					Object.keys(streamIn.alias).forEach(function (aliasKey) {
						var alias = streamIn.alias[aliasKey];
						Array.isArray(val) && (val = val.map(function (item) {
							item[aliasKey] = item[alias];
							return item;
						}));
					});
				}
				return val;
			} else {
				return streamIn;
			}
		//布尔类型
		case 'boolean':
			return streamIn;
		case 'string':
			if (streamIn === 'self') {
				return data;
			} else {
				if (streamIn.includes('.')) {
					if (streamIn.indexOf('.') === 0) {
						var arr = streamIn.split('.');
						arr.shift();
						val = (0, _tool.streamForm)(arr, {}, data);
					} else {
						val = (0, _tool.streamForm)(streamIn.split('.'), {}, data);
					}
				} else {
					val = streamIn;
				}
				return val;
			}
		default:
			return val;
	}
};
// 数据流遍历
var streamWalk = function streamWalk() {
	var streams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var data = arguments[1];
	var yakaApis = arguments[2];

	var state = {};
	var formValueSettingFunction = yakaApis.formValueSettingFunction,
	    stateValueSettingFunction = yakaApis.stateValueSettingFunction,
	    formValueGettingFunction = yakaApis.formValueGettingFunction,
	    getProps = yakaApis.getProps;

	Object.keys(streams).forEach(function (key) {
		key = key.toString();
		var val = streamFilter(streams[key], data);
		//表单数据流
		if (key.indexOf('#') !== -1) {
			var keys = key.slice(1, key.length).split('.');
			if (keys.length === 1) {
				var stream = (0, _tool.streamTo)(keys, {}, val);
				formValueSettingFunction(stream);
			} else {
				var formKey = keys;
				var formValues = formValueGettingFunction(formKey[0]);
				formValues[formKey[1]] = val;
				var obj = {};
				obj[formKey[0]] = formValues;
				formValueSettingFunction(obj);
			}
		}

		//state数据流
		if ((0, _tool.isReadState)(key)) {
			var _stream = (0, _tool.streamTo)(key.slice(1, key.length).split('.'), {}, val);
			Object.assign(state, _stream);
		}
		// 外部接口接受
		if (key.indexOf('@') !== -1) {
			var props = getProps();
			var name = key.slice(1, key.length);
			typeof props[name] === 'function' ? props[name](val) : console.error('props is not a funciton!');
		}
	});
	stateValueSettingFunction(state);
};
exports.streamFilter = streamFilter;
exports.default = streamWalk;