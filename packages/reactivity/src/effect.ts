export function effect (fn, options?) {
  //创建一个响应式effect，数据变化后可以重新执行
  //创建一个effect，只有依赖的属性变化了就要执行回调
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run()
  })
  _effect.run()

  return _effect
}
export let activeEffect

// effect 函数内部创建一个响应式effect
// effectScope.stop()停止所有的effect不参加响应式处理
class ReactiveEffect {
  _trackId = 0
  public active = true
  //创建的effect是响应式的
  //FN 用户编写的函数
  //如果fn中依赖的数据发生变化后，需要重新调用-》run()
  deps=[]
  _depsLength = 0
  constructor (public fn, public scheduler?) {}
  run () {
    if (!this.active) {
      return this.fn()
      //不用激活的什么都不做
    }
    let parent = activeEffect
    try {
      activeEffect = this
      return this.fn()
    } finally {
      activeEffect = parent
    }
  }
  stop () {
    this.active = false //后续再改
  }
}


//双向记忆
export function trackEffect (effect, dep) {
  dep.set(effect,effect._trackId)
  //还要让effect收集dep
  effect.deps[effect._depsLength++]=dep
}


// 触发依赖
export function triggerEffects (dep) {
    for(const effect of dep.keys()){
        if (effect.scheduler) {
            effect.scheduler()
        }
    }
}
