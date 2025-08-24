import { DirtyLevel } from './constans'

/* 
这个是数据变化的时候才执行的，需要用户自己调度要不要实行 
*/
export function effect (fn, options?) {
  //创建一个响应式effect，数据变化后可以重新执行
  //创建一个effect，只有依赖的属性变化了就要执行回调
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run()
  })
  _effect.run()

  if (options) {
    Object.assign(_effect, options)
    //用用户传的，覆盖本地的
  }

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect //可以拿到effect
  return runner
  //返回一个函数，用户可以调用它来手动执行effect,执行它会刷新数据，用户控制刷新
}
export let activeEffect

function preCleanEffect (effect) {
  effect.__depsLenfth = 0
  effect._trackId++ //每次执行，id都加一
}
//执行前和执行后
function postCleanEffect (effect) {
  //多出来的要删掉
  if (effect.deps.length > effect.__depsLenfth) {
    for (let i = effect.__depsLenfth; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect)
      //删除映射表对应的effect
    }
  }
  effect.deps.length = effect.__depsLenfth
  //更改他的长度
}

// effect 函数内部创建一个响应式effect
// effectScope.stop()停止所有的effect不参加响应式处理
export class ReactiveEffect {
  _trackId = 0
  public active = true
  //创建的effect是响应式的
  //FN 用户编写的函数
  //如果fn中依赖的数据发生变化后，需要重新调用-》run()
  deps = []
  _depsLength = 0
  _dirtyLevel = DirtyLevel.Dirty
  _running = 0
  constructor (public fn, public scheduler?) {}

  public get dirtyLevel () {
    return this._dirtyLevel === DirtyLevel.Dirty
  }
  public set dirtyLevel (value) {
    this._dirtyLevel = value ? DirtyLevel.Dirty : DirtyLevel.NoDirty
    //设置脏级别
  }
  //默认是脏的->获取新的值->变为不脏的
  //数据变化->脏的
  run () {
    this._dirtyLevel = DirtyLevel.NoDirty //表示不脏了
    if (!this.active) {
      return this.fn()
      //不用激活的什么都不做
    }
    let parent = activeEffect
    try {
      activeEffect = this
      //要将上一次的依赖清除掉

      preCleanEffect(this)
      this._running++
      return this.fn() //收集依赖
    } finally {
      this._running--
      postCleanEffect(this)
      activeEffect = parent
    }
  }
  stop () {
    if (this.active) {
      this.active = false //后续再改
      preCleanEffect(this)
      postCleanEffect(this)
    }
  }
}

function cleanDepEffect (dep, effect) {
  dep.delete(effect)
  if (dep.size === 0) {
    dep.cleanup()
  }
}

//双向记忆
export function trackEffect (effect, dep) {
  //trackId是用于记录执行次数（防止一个属性在当前effect多次依赖收集）只收集一次
  //拿到上次依赖的和这次的进行比较

  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId)
  }
  let oldDep = effect.deps[effect._depsLength]
  if (oldDep !== dep) {
    if (oldDep) {
      cleanDepEffect(oldDep, effect)
    }
    effect.deps[effect._depsLength++] = dep
  } else {
    effect._depsLength++
  }
  //还要让effect收集dep
}
/*这里的逻辑很简单，你传进来的其实是一个列表，我一个一个取出来，和旧的进行比对
 * 如果一样就不做，不一样你就要清除旧的，把新的填入到这个地方
 */

// 触发依赖
export function triggerEffects (dep) {
  for (const effect of dep.keys()) {
    if (effect._dirtyLevel < DirtyLevel.Dirty) {
      effect._dirtyLevel = DirtyLevel.Dirty
    }
    // 脏了就执行
    if (effect.scheduler) {
      if (!effect._running) {
        effect.scheduler()
      }
    }
  }
}
