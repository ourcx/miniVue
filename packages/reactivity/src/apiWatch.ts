import { isFunction, isObject } from '@vue/shared'
import { effect, ReactiveEffect } from './effect'
import { isReactive } from './reactive'
import { isRef } from './ref'

export function watch (source, cb, option = {} as any) {
  return doWatch(source, cb, option)
  //watchEffect也是这个实现的
}

export function watchEffect (getter,options={} as any) {
  return doWatch(getter, null, options)
}

function traverse (source, depth, currentDepth = 0, seen = new Set()) {
  if (!isObject(source)) {
    return source
  }
  if (depth) {
    if (currentDepth >= depth) {
      return source
    }
    currentDepth++
    //根据当前遍历的深度进行遍历
    seen.add(source)
  }
  if (seen.has(source)) {
    return source
  }
  for (const key in source) {
    traverse(source[key], depth, currentDepth, seen)
  }
  return source
  // 递归遍历触发每个属性的getter
}
function doWatch (source, cb, { deep, immediate }) {
  ;() => source
  const reactiveGetter = source => {
    return traverse(source, deep === false ? 1 : undefined)
  }
  let getter
  if (isReactive(source)) {
    getter = () => reactiveGetter(source)
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isFunction(source)) {
    getter = source
  }
  let oldValue

  let clean
  let onCleanup=(fn)=>{
    clean = ()=>{
      fn()
      clean =undefined
    }
  }
  const job = () => {
    if(!cb){
      effect.run()
      return
    }
    const newValue = effect.run()
    if (clean) {
      clean()
      //再执行回调前，先去执行清理的函数
    }
    cb(newValue, oldValue,onCleanup)
    oldValue = newValue
  }

  //产生一个可以给ReactEffect来使用的getter,需要对这个对象进行取值操作,会关联当前的reactiveEffect
  const effect = new ReactiveEffect(getter, job)

  if (cb) {
    if (immediate) {
      //立即执行一次
      job()
    } else {
      oldValue = effect.run()
      //最开始会记录一个老的值
    }
  }else{
    effect.run()
    //没有cb就直接执行
  }

  const unWatch = () => {
    effect.stop()
  }
  return unWatch
  //返回一个取消watch的函数,你可以去接收

}
