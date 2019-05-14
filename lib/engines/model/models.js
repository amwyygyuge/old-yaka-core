import { isReadState, readState } from './../../tool/'
import _mountFunctions from './mountFunctions'
import streamWalk from './stream'
const resolveParams = (params, auto, { formValueGettingFunction, getInitData }) =>
	new Promise((resolve, reject) => {
		let _params = {}
		if (params) {
			setTimeout(() => {
				_params = JSON.parse(JSON.stringify(params))
				Object.keys(_params).forEach(key => {
					const value = _params[key] ? _params[key].toString() : null

					if (isReadState(value)) {
						const val = readState(value, getState())
						_params[key] = val
						return
					}

					if (value && value.indexOf('#') !== -1) {
						let val = ''
						if (auto === true) {
							val = getInitData()[value.slice(1, value.length)]
						} else {
							val = formValueGettingFunction(value.slice(1, value.length))
						}
						if (val && typeof val === 'object' && val.key && val.label) {
							val = val.key
						}
						_params[key] = val
						return
					}
					_params[key] = value
				})
				resolve(_params)
			}, 500)
		} else {
			resolve(_params)
		}
	})
const modelFactory = (model, yakaApis) => {
	const { type, params, url, streams, headers = {}, mountFunctions } = model
	const { getState, getProps, formValueGettingFunction, getInitData } = yakaApis
	Object.keys(headers).forEach(key => {
		const val = headers[key] ? headers[key].toString() : ''
		if (isReadState(val)) {
			headers[key] = readState(val, getState())
		}
		if (val.indexOf('@') !== -1) {
			const name = val.slice(1, val.length)
			if (getProps()[name]) {
				headers[key] = getProps()[name]
			}
		}
	})
	const doFetch = async (auto = false) => {
		let _params = await resolveParams(params, auto, { formValueGettingFunction, getInitData })
		if (type === 'get' || type === 'restful') {
			fetch(url, {
				headers: {
					...headers,
					'Content-Type': 'application/json'
				},
				method: 'GET',
				mode: 'cors'
			})
				.then(res => res.json())
				.then(res => {
					const code = res.code.toString()
					if (code && code !== '0') {
						return
					}
					mountFunctions && _mountFunctions(mountFunctions, res, yakaApis)
					streams && streamWalk(streams, res, yakaApis)
				})
		}
		if (type === 'post') {
			fetch(url, {
				headers: {
					...headers,
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify(_params),
				mode: 'cors'
			})
				.then(res => res.json())
				.then(res => {
					const code = res.code.toString()
					if (code && code !== '0') {
						return
					}
					mountFunctions && _mountFunctions(mountFunctions, res, yakaApis)
					streams && streamWalk(streams, res, yakaApis)
				})
		}
	}
	return doFetch
}
const models = (models, yakaApis) => {
	const _models = {}
	Object.keys(models || {}).forEach(key => {
		const model = models[key]
		_models[key] = modelFactory(model, yakaApis)
		if (model.action === 'auto') {
			_models[key](true)
		}
	})
	return _models
}
export default models
