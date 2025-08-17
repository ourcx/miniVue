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

function preCleanEffect (effect) {
  effect.__depsLenfth = 0
  effect._trackId++//每次执行，id都加一
}

function postCleanEffect (effect) {
  //多出来的要删掉
  if(effect.deps.length>effect.__depsLenfth){
    for(let i=effect.__depsLenfth;i<effect.deps.length;i++){
      cleanDepEffect(effect.deps[i],effect)
      //删除映射表对应的effect
    }
  }
  effect.deps.length = effect.__depsLenfth
  //更改他的长度
  
}

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
      //要将上一次的依赖清除掉

      preCleanEffect(this)

      return this.fn() //收集依赖
    } finally {
      postCleanEffect(this)
      activeEffect = parent
    }
  }
  stop () {
    this.active = false //后续再改
  }
}

function cleanDepEffect (dep,effect) {
  dep.delete(effect)
  if (dep.size === 0) {
    dep.cleanup()
  }
}

//双向记忆
export function trackEffect (effect, dep) {
//trackId是用于记录执行次数（防止一个属性在当前effect多次依赖收集）只收集一次
//拿到上次依赖的和这次的进行比较

  if (dep.get(effect)!== effect._trackId){
    dep.set(effect,effect._trackId)
  }
  let oldDep = effect.deps[effect._depsLength]
  if(oldDep!== dep){
    if(oldDep){
      cleanDepEffect(oldDep,effect)
    }
    effect.deps[effect._depsLength++]=dep
  }else{
    effect._depsLength++
  }
  //还要让effect收集dep
}


// 触发依赖
export function triggerEffects (dep) {
    for(const effect of dep.keys()){
        if (effect.scheduler) {
            effect.scheduler()
        }
    }
}
