import { proxyRefs, reactive } from '@vue/reactivity'
import { hasOwn, isFunction } from '@vue/shared'
import { render } from '../../runtime-dom/src/index'
import { set } from '@vueuse/core'

export function creatComponentInstance (vnode) {
  const instance = {
    data: null, // 状态
    vnode, // 虚拟节点
    subTree: null, //子树
    isMounted: false, //是否挂载
    update: () => {}, //更新函数
    props: {},
    attrs: {},
    propsOptions: vnode.type.props || {}, //属性选项
    component: null, //组件实例
    proxy: null, //代理让它访问data和props
    setupState: {}
  }
  return instance
}

const inittProps = (instance, rawProps) => {
  const props = {}
  const attrs = {}
  const propsOptions = instance.propsOptions
  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key]
      if (key in propsOptions) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }
  instance.props = reactive(props)
  //要变成响应式的，所以要使用reactive，不需要深度代理，组件里面不能更改props
  instance.attes = attrs
}

export function setUpComponent (instance) {
  const { vnode } = instance
  inittProps(instance, vnode.props)
  //赋值属性
  const publicProperty = {
    $attrs: instance => instance.attrs
  }
  //赋值代理对象
  instance.proxy = new Proxy(instance, {
    get (target, key) {
      const { data, props, attrs } = target
      //proxy.name -> data.name
      if (data && hasOwn(data, key)) {
        return data[key]
      } else if (props && hasOwn(props, key)) {
        return props[key]
      }else if(attrs && hasOwn(attrs, key)){
        return attrs[key]
      }
    },
    set (target, key, value) {
      const { data, props, attrs } = target
      if (data && hasOwn(data, key)) {
        data[key] = value
      } else if (props && hasOwn(props, key)) {
        // props[key] = value
        console.warn('props is readonly,只读属性')
        return false
      }else if(attrs && hasOwn(attrs, key)){
        attrs[key] = value
      }
      return true
    }
  })

  const { data=()=>{}, render,setup } = vnode.type

  if(setup){
    const setupContext = {}
    const setupResult = setup(instance.props, setupContext)
    if (isFunction(setupResult)) {
      instance.render = setupResult
    }else{
      instance.setupState = proxyRefs(setupResult)
      //自动解包ref，返回的对象中如果有ref，那么这个对象中的属性就是ref的value，否则就是ref本身
    }
  }

  if (!isFunction(data)) {
    console.warn('data option must be a function')
  } else {
    //data必须是一个函数
    instance.data = reactive(data.call(instance.proxy))
    //注意data可能在一些组件没有传
  }

  //data中的this指向组件实例,可以拿到proxy
  instance.render = render
}
