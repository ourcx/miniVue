import { activeEffect } from './effect'
import { reactive } from './reactive'
import { track, trigger } from './reactiveEffct'
import { isObject } from '../../shared/src/index';
import { ReactiveFlags } from './constans';



// proxy 需要搭配relect使用，改变对象行为
export const mutableHandlers: ProxyHandler<any> = {
  get (target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    track(target, key)
    //收集了那个对象哪个属性，和effect关联一起
    let res = Reflect.get(target, key, receiver)
    if (isObject(res)) {
      //当获取的属性值是一个对象，就进行代理，递归代理哦
      return reactive(res)
    }
    return res
  },
  //依赖收集
  //当取值的时候，应该让响应式属性和effect映射起来
  set (target, key, value, receiver) {
    let oldValue = target[key]
    let result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      //页面更新
      trigger(target, key, value,oldValue)
    }
    //找到属性，让对应的effect重新执行
    return result
  }
  //触发更新
}
//使用proxy要搭配reflect,让后面拿到值调用的时候（遇到属性访问器），this是代理对象
