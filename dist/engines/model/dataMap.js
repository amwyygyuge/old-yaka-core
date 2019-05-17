'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tool = require('./../../tool/');

var resolveDataMap = function resolveDataMap() {
	var dataMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var yakaApis = arguments[1];

	var _dataMap = {};
	var getState = yakaApis.getState;

	Object.keys(dataMap).forEach(function (key) {
		key = key.toString();
		_dataMap[key] = function () {
			var state = getState();
			var value = dataMap[key].value;
			var map = dataMap.key.map;

			value = (0, _tool.readState)(value, state);
			var m = map.find(function (item) {
				return item.value === value;
			});
			if (m) {
				var _key = m.data;
				if ((0, _tool.isReadState)(_key)) {
					return (0, _tool.readState)(_key, state);
				} else {
					return _key;
				}
			} else {
				return null;
			}
		};
	});
	return _dataMap;
};
exports.default = resolveDataMap;