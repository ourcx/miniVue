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
  dep: any //用于收集对应的effect
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

export function trackRefValue (ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      ((ref.dep = ref.dep ||createDep(() => (ref.dep = undefined))), 'undefined')
    )
  }
}

export function triggerRefValue (ref) {
  let dep = ref.dep
  if (dep) {
    triggerEffects(dep)
    //触发依赖更新
  }
}

//toRef toRefs批量转化
//const { a, b } = toRefs(reactive({ a: 1, b: 2 }))
//让reactive变成ref
class ObjectRefImpl {
  public __v_isRef = true
  constructor (public _target, public _key) {}
  get value () {
    return this._target[this._key]
  }
  set value (newValue) {
    this._target[this._key] = newValue
  }
}

export function toRef (target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs (object) {
  let result = {}
  for (let key in object) {
    result[key] = toRef(object, key)
    //遍历一遍，转化成ref
  }
  return result
}

export function proxyRefs (objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get (target, key, receiver) {
      let r = Reflect.get(target, key, receiver)
      return r.__v_isRef ? r.value : r
    },
    set (target, key, value, receiver) {
      const oldValue = target[key]
      if (oldValue !== value) {
        if (oldValue.__v_isRef) {
          oldValue.value = value
          //老值是ref，说明要给ref赋值
          return true
        } else {
          return Reflect.set(target, key, value, receiver)
          //老值不是ref，说明要给对象直接赋值，而不是取到value属性再赋值
        }
      }
    }
  })
}
//在html使用ref响应式的时候，自动进行解构，在模板上用就不用考虑value
 
export function isRef(value){
  return value && value.__v_isRef;
}