import { readState, isReadState } from './../../tool/'

const resolveDataMap = (dataMap = {}, yakaApis) => {
	const _dataMap = {}
	const { getState } = yakaApis
	Object.keys(dataMap).forEach(key => {
		key = key.toString()
		_dataMap[key] = () => {
			const state = getState()
			let { value } = dataMap[key]
			const { map } = dataMap.key
			value = readState(value, state)
			const m = map.find(item => item.value === value)
			if (m) {
				const _key = m.data
				if (isReadState(_key)) {
					return readState(_key, state)
				} else {
					return _key
				}
			} else {
				return null
			}
		}
	})
	return _dataMap
}
export default resolveDataMap
