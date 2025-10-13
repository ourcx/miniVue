export function isObject(value){
    return value !== null && typeof value === 'object'
}
export function isFunction(value){
    return typeof value === 'function'
}

export function isString (value) {
    return typeof value === 'string'
}

export * from './shapeFlags'

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (val, key) => hasOwnProperty.call(val, key)
//反柯里化 (函数的this指向被改变)