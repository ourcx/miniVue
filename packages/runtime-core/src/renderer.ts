import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Fragment, isSameVnode } from './createVnode'
import getSequence from './seq'
import { Text } from './createVnode'
import { reactive } from 'packages/reactivity/src/reactive'
import { ReactiveEffect } from 'packages/reactivity/src/effect'
import { is } from 'quasar'
import { queueJob } from './scheduler'
export function creatRenderer (renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    createText: hostCreateElement,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp
  } = renderOptions
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      //缺少纯文本元素的情况
      patch(null, children[i], container)
    }
  }

  const patchKeyedChildren = (c1, c2, el) => {
    //两个数组进行比对
    let i = 0
    let e1 = c1.length - 1 // 第一个数组的尾部索引
    let e2 = c2.length - 1
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el) //递归比较子节点
      } else {
        break
      }
      i++
    }
    //头部比对
    //假如得到 i = 2 e1 = 2 e2 = 3
    //就说明2到2，2到3是不同的，所以减少了范围
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1--
      e2--
    }
    //这时候的i和e1和e2 是0 0 1
    //尾部比对

    if (i > e1) {
      //新的多
      if (i <= e2) {
        //insert()
        let nextPos = e2 + 1 //看下一个元素是否存在
        let anchor = c2[nextPos]?.el
        while (i <= e2) {
          patch(null, c2[i], el, anchor)
          i++
        }
      }
      //老的多，就是i<=e1,i>e2
    } else if (i > e1) {
      if (i <= e2) {
        while (i <= e1) {
          //i到e1之间的就是
          unmount(c1[i])
          i++
        }
      }
    }
    //这些是一些特殊情况，对不变化的节点操作，并且对插入和移除做了处理

    //后面就是特殊的比对方式了
    //接下来就到了乱序比对的哪一个区间了
    const s1 = i
    const s2 = i
    //这里就确定了要进行操作的范围
    //做一个映射表
    //vue2使用了旧的节点做映射表，vue使用新的做表
    const keyToNewIndexMap = new Map()
    //k看老的是否再新的里面，没有就删除，有的就进行更新
    //根据新的节点，找到对应老的位置
    let toBepatched = e2 - s2 + 1
    let newIndexToOldIndexMap = new Array(toBepatched).fill(0)
    //产生一个都是零的数组
    //这里得到的最长递增子数列，他在里面的值是不会移动的，直接跳过，只对变化的进行更新

    for (let i = s2; i <= e2; i++) {
      const vnode = c2[i]
      keyToNewIndexMap.set(vnode.key, i)
      //映射表
    }
    //开始比对

    for (let i = s1; i <= e1; i++) {
      const vnode = c1[i]
      const newIndex = keyToNewIndexMap.get(vnode.key)
      //找到对应的索引
      //找不到就干掉
      if (newIndex === undefined) {
        // 删除
        unmount(vnode)
        //unmount
      } else {
        //找到了
        //  比较前后节点的差异，更新
        newIndexToOldIndexMap[newIndex - s2] = i
        //更新新的索引
        patch(vnode, c2[newIndex], el)
        //这边在做复用
      }
    }

    let increasingSeq = getSequence(newIndexToOldIndexMap)
    let j = increasingSeq.length - 1
    //索引
    //调整顺序
    //倒序插入
    //新的元素多，就要去创建
    //倒序插入的个数
    for (let i = toBepatched; i >= 0; i--) {
      let newIndex = s2 + i
      //对应的索引，找下一个元素作为参照无，来进行插入
      let anchor = c2[newIndex + 1]?.el
      let vnode = c2[newIndex]

      if (!vnode.el) {
        //列表新增的元素
        patch(null, vnode, el, anchor)
      } else {
        if (i == increasingSeq[j]) {
          //对某些项是不动的
          j--
        } else {
          hostInsert(vnode.el, el, anchor) //倒序插入
        }
      }
    }
    //倒序比对每一个元素的
  }

  const patchProps = (el, n1, n2) => {
    //n2是新的
    for (let key in n2) {
      hostPatchProp(el, key, n1[key], n2[key])
      //新的东西加进来
    }
    for (let key in n1) {
      if (!n2[key]) {
        hostPatchProp(el, key, n1[key], null)
        //以前有，现在没有的属性要删除
      }
    }
  }

  const unmountChildren = children => {
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      unmount(child)
    }
  }
  const patchChildren = (n1, n2, el) => {
    //text array null
    const c1 = n1.children
    const c2 = n2.children
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    //1.新的是文本，老的是数组，移除老的
    //2.新的是文本，老的是文本，内容替换
    //3.新的是数组，老的是数组。全量diff算法
    //4.老的是数组，新的不是数组，移除老的子节点
    //5.老的是文本，新的是空
    //6.老的是文本，新的是数组

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }

      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          //全量diff算法

          patchKeyedChildren(c1, c2, el)
        } else {
          unmountChildren(c1)
        }
      } else {
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          //把新的数组挂载上去
          mountChildren(c2, el)
        }
      }
    }
  }
  const patchElement = (n1, n2, container) => {
    //找到差异，更新节点内容
    //要复用
    //比较元素的差异，肯定要复用Dom元素
    //比较属性和元素的子节点
    let el = (n2.el = n1.el) // 复用dom
    let oldProps = n1.props || {}
    let newProps = n2.props || {}
    patchProps(el, oldProps, newProps)
    //针对属性来处理
    patchChildren(n1, n2, el)
    //比较儿子节点
  }

  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      //如果n1是null的话，则进行初始化
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2, container)
    }
  }

  const mountElement = (vnode, container, anchor) => {
    const { type, children, props, shapeFlag } = vnode
    //第一次渲染的时候让虚拟节点和真实的dom创建关联
    //第二次渲染新的vnode和旧的vnode进行对比，之后更新对应的el元素

    let el = (vnode.el = hostCreateElement(type))
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 这个东西在h里面设置了，使用|给node添加了标识符
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      //是数组，所以遍历数组，进行渲染
      mountChildren(children, el)
    }
    hostInsert(el, container, anchor)
    // 挂载元素
  }
  const processText = (n1, n2, container) => {
    if (n1 === null) {
      n2.el = hostCreateElement(n2.children)
      hostInsert(n2.el, container)
      //虚拟节点关联真实节点
      //将虚拟节点插入到页面里面
    } else {
      const el = (n2.el = n1.el)
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
      //把n1新的赋给n2
    }
  }

  const processFragment = (n1, n2, container) => {
    if (n1 === null) {
      mountChildren(n2.children, container)
    } else {
      patchChildren(n1, n2, container)
      //如果之前的儿子存在，那就改成更新这个节点
    }
  }

  const inittProps = (instance,rawProps) => {
    const  props = {}
    const attrs = {}
    const propsOptions = instance.propsOptions
    if(rawProps){
      for(let key in rawProps){
        const value = rawProps[key]
        if(key in propsOptions){
          props[key] = value
        }else{
          attrs[key] = value
        }
      }
    }
    instance.props = reactive(props)
    //要变成响应式的，所以要使用reactive，不需要深度代理，组件里面不能更改props
    instance.attes = attrs
  }

  const mountComponent = (n2, container, anchor) => {
    //组件可以基于自己的状态重新渲染，就是effect
    const { data = () => {}, render,props:propsOptions = {} } = n2
    //数据变成响应式
    const state = reactive(data())
    //组件的状态
    const instance = {
      state, // 状态
      vnode: n2, // 虚拟节点
      subTree: null, //子树
      isMounted: false, //是否挂载
      update: () => {}, //更新函数
      props: {},
      attes : {},
      propsOptions,
    }
    n2.component = instance
    //根据propsoptions来区分传入的属性和非传入的属性
    inittProps(instance,n2.props);
    //元素更新更新n2.el = n1.el
    //组件更新n2.component.subTree.el = n1.component.subTree.el



    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        //要去区分第一次还是第二次的更新
        //第一次需要挂载，第二次需要更新
        const vnode = render.call(state)
        instance.subTree = vnode
        // 修改render的this指向
        patch(null, vnode, container, anchor)
        instance.isMounted = true
        //第一次渲染组件
      }else{
        const vnode = render.call(state)
        const prevSubTree = instance.subTree
        instance.subTree = vnode
        patch(prevSubTree, vnode, container, anchor)
        //更新组件,基于状态的
      }
    }
    const effect = new ReactiveEffect(componentUpdateFn, () => queueJob(update))
    const update = (instance.update = () => {
      effect.run()
    })
    update()
  }

  const processComponent = (n1, n2, container, anchor) => {
    if (n1 === null) {
      mountComponent(n2, container, anchor)
    } else {
      //组件的更新
    }
  }

  const patch = (n1, n2, container, anchor = null) => {
    if (n1 === n2) {
      //如果两个节点相同，则不需要进行更新
      return
    }

    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
      //很暴力的操作
    }

    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      case Fragment:
        processFragment(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 对组件的处理，vue3不建议使用函数式组件，没有性能优越
          //只是为了兼容
          processComponent(n1, n2, container, anchor)
        }
    }
  }
  //core中不关心如何渲染
  const unmount = vnode => {
    if (vnode.type === Fragment) {
      unmountChildren(vnode.children)
      //针对多标签的处理
    } else {
      hostRemove(vnode.el)
    }
  }
  //多次调用render，虚拟dom会进行更新，会进行一些diff比对，把虚拟DOM变成真实DOM
  const render = (vnode, container) => {
    if (vnode === null) {
      //需要移除当前容器里面的dom元素
      if (container._vnode) {
        //移除dom元素
        unmount(container._vnode)
      }
    } else {
      //将虚拟节点换成真实节点
      patch(container._vnode || null, vnode, container)
      container._vnode = vnode
    }
  }
  return {
    render
  }
}
