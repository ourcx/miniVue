import { activeEffect, trackEffect, triggerEffects } from './effect'

const targetMap = new WeakMap()

export const createDep = cleanup => {
  const dep = new Map() as any//收集器
  dep.cleanup = cleanup//清理
  return dep
}
export function track (target, key) {
  // activeEffect 存在才收集依赖,说明这个key是在effect中访问的，没有访问过，就不收集依赖
  if (activeEffect) {
    console.log('track', target, key, activeEffect)
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    //此属性是新增的
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep(() => depsMap.delete(key))))
  }
  trackEffect(activeEffect,dep)
  //将当前的effect放入到dep（映射表）中，后续可以根据值的变化触发此dep中存放的effect
  
}


export function trigger (target, key,newValue,oldValue) { 
    //找到effect让它执行
    const depsMap = targetMap.get(target)

    if (!depsMap) return
    //找不到对象就return

    const dep = depsMap.get(key)

    if (dep) {
        //修改了属性 触发effect
        triggerEffects(dep)
    }
}