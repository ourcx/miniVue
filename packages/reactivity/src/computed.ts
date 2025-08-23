import { isFunction } from '@vue/shared'
import { ReactiveEffect, effect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

class ComputedRefImpl {
  public _value
  public effect
  public dep
  constructor (getter, public setter) {
    //创建一个effect,来关机当前计算属性的dirty属性
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      // 用户的函数
      () => {
        //如果计算属性的值发生变化了，就会触发这个函数
        triggerRefValue(this)
        //依赖的属性变化后需要触发重新渲染,还需要将dirty变为true

      }
    )
  }
  get value () {//让计算属性收集对应的effect
    // 需要一些额外处理
    if (this.effect.dirtyLevel) {
      //如果脏了就重新计算
      this._value = this.effect.run() //执行effect,获取最新的值
      //执行effect,获取最新的值
      //如果当前在effect里访问了计算属性,计算属性可以收集 effect

      //如果当前在effect里访问了计算属性,计算属性可以收集 effect
      trackRefValue(this)
    }
    return this._value
    //返回缓存的值
  }
  set value (newValue) {
    this.setter(newValue)
  }
}

export function computed (getterOrOPtions) {
  let onlyGetter = isFunction(getterOrOPtions)
  let getter
  let setter
  if (onlyGetter) {
    getter = onlyGetter
    setter = () => {}
  } else {
    getter = getterOrOPtions.get
    setter = getterOrOPtions.setter
  }
  return new ComputedRefImpl(getter, setter)
}
