import { activeEffect, trackEffect, triggerEffects } from './effect'
import { toReactive } from './reactive'
import { createDep } from './reactiveEffct'

// ref shallowRef
export function ref (value) {
  return createRef(value)
}

export function shallowRef (value) {
  //未制作
}

function createRef (value) {
  return new RefImpl(value)
}

class RefImpl {
  __v_isRef = true //ref标识
  _value //保存值的
  dep:any //用于收集对应的effect
  constructor (public rawValue) {
    this._value = toReactive(rawValue)
    //是对象的话就返回
  }
  get value () {
    trackRefValue(this.dep)
    return this._value
  }
  set value (newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue
      //更新
      this._value = newValue
      triggerRefValue(this.dep)
    }
  }
}

function trackRefValue (ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined)),'undefined')
    )
  }
}

function triggerRefValue (ref) {
    let dep = ref.dep
    if(dep){
        triggerEffects(dep)
        //触发依赖更新
    }
}
