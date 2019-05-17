const getLogicMapComponent = (ele, initData) => {
	const logicState = {}
	if (ele.component === 'Logic' && ele.props && ele.props.value) {
		const key = ele.props.value.toString()
		if (key.indexOf('$') > -1) {
			const formKey = key.slice(1, key.length).split('.')
			const value = initData[formKey[0]] || ''
			logicState[formKey[0]] = {}
			logicState[formKey[0]][formKey[1]] = value
		}
	}
	return logicState
}

const stateWalk = (layouts, initData) => {
	if (!Array.isArray(layouts)) {
		throw Error('children must be an array!')
	}
	const _state = {},
		logicState = {}
	layouts.forEach(ele => {
		const { state, name, children } = ele
		// 收集state
		if (state) {
			const eleState = {}
			const componentState = {}
			Object.keys(state).forEach(key => {
				componentState[key] = state[key]
			})
			eleState[name] = componentState
			Object.assign(_state, eleState)
		}

		if (children) {
			Object.assign(_state, stateWalk(children, initData))
		}
		// 收集逻辑组件
		Object.assign(_state, getLogicMapComponent(ele, initData))
	})
	return Object.assign(_state, logicState)
}
export default stateWalk
