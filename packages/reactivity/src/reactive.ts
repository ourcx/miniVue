import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHander'
import { ReactiveFlags } from './constans'

//记录我们的代理结果
const reactiveMap = new WeakMap()

//reactive 和 shallowReactive
function createReactiveObject (target, shallow = false) {
  //必须是对象
  if (!isObject(target)) {
    return target 
  }
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  //被代理过的对象访问就会遇到这个属性，用来标识被代理过的对象
  const exitsProxy = reactiveMap.get(target)
  if (exitsProxy) {
    return exitsProxy
  }
  //如果存在就返回这个缓存的代理对象
  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  //映射缓存
  return proxy
}



export function reactive (target) {
  return createReactiveObject(target)
}
export function shallowReactive (target) {
  return createReactiveObject(target, true)
}


export function toReactive(value){
  return isObject(value) ? reactive(value) : value
}