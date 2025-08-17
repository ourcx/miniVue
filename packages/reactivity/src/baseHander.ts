import { activeEffect } from './effect'
import { track, trigger } from './reactiveEffct'

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive' // 基本上唯一
}

// proxy 需要搭配relect使用，改变对象行为
export const mutableHandlers: ProxyHandler<any> = {
  get (target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    track(target, key)
    //收集了那个对象哪个属性，和effect关联一起
    return Reflect.get(target, key, receiver)
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
