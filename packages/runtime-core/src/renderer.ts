import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { isSameVnode } from './createVnode'
import { sha } from 'oicq/lib/common'

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



  const patchProps = (el, n1, n2) => { 
    //n2是新的
    for(let key in n2){
        hostPatchProp(el, key, n1[key], n2[key])
        //新的东西加进来
    }
    for(let key in n1){
        if(!n2[key]){
            hostPatchProp(el, key, n1[key], null)
            //以前有，现在没有的属性要删除
        }
    }
  }


  const unmountChildren = (children) => {
    for(let i = 0;i<children.length;i++){
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

     if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
        if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            unmountChildren(c1)
        }

        if(c1!==c2){
            hostSetElementText(el,c2)
        }
     }else{
        if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
                //全量diff算法
            }
        }
     }
  }
  const patchElement = (n1, n2, container) => {
    //找到差异，更新节点内容
    //要复用
    //比较元素的差异，肯定要复用Dom元素
    //比较属性和元素的子节点
    let el = n2.el = n1.el // 复用dom
    let oldProps = n1.props || {}
    let newProps = n2.props || {}
    patchProps(el, oldProps, newProps)
    //针对属性来处理
    patchChildren(n1, n2, el)
    //比较儿子节点
  }

  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      //如果n1是null的话，则进行初始化
      mountElement(n2, container)
    } else {
      patchElement(n1, n2, container)
    }
  }

  const mountElement = (vnode, container) => {
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
    hostInsert(el, container)
    // 挂载元素
  }
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      //如果两个节点相同，则不需要进行更新
      return
    }

    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
      //很暴力的操作
    }

    processElement(n1, n2, container)
  }
  //core中不关心如何渲染
  const unmount = vnode => {
    hostRemove(vnode.el)
  }
  //多次调用render，虚拟dom会进行更新，会进行一些diff比对，把虚拟DOM变成真实DOM
  const render = (vnode, container) => {
    if (vnode === null) {
      //需要移除当前容器里面的dom元素
      if (container._vnode) {
        //移除dom元素
        unmount(container._vnode)
      }
    }
    //将虚拟节点换成真实节点
    patch(container._vnode || null, vnode, container)
    container._vnode = vnode
  }
  return {
    render
  }
}
