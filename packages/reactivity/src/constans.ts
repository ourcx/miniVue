export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive' // 基本上唯一
}
//这样好维护


export enum DirtyLevel { // 脏级别
    Dirty = 4, // 脏,意味着取值要运行计算属性
    NoDirty = 0,//不脏就用1上一次的返回结果
} 