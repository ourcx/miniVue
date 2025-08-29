import { sha } from 'oicq/lib/common';
import { ShapeFlags } from '../../shared/src/shapeFlags';

export function creatRenderer(renderOptions){

    const {
        insert:hostInsert,
        remove:hostRemove,
        setElementText:hostSetElementText,
        createText:hostCreateElement,
        setText:hostSetText,
        parentNode:hostParentNode,
        nextSibling:hostNextSibling,
        patchProp:hostPatchProp,
        
    } = renderOptions
    const mountChildren = (children,container)=>{ 
        for(let i = 0;i<children.length;i++){
            //缺少纯文本元素的情况
            patch(null,children[i],container)
        }
    }
    const mountElement = (vnode,container)=>{
        const { type,children,props,shapeFlag } = vnode;
        let el = hostCreateElement(type)
        if(props){
            for(let key in props){
                hostPatchProp(el,key,null,props[key])
            }
        }
        if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
            // 这个东西在h里面设置了，使用|给node添加了标识符
            hostSetElementText(el,children)
        }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
            //是数组，所以遍历数组，进行渲染
            mountChildren(children,el)
         }
        hostInsert(el,container)
        // 挂载元素
    }
    const patch = (n1,n2,container)=>{
        if(n1===n2){
            //如果两个节点相同，则不需要进行更新
            return 
        }

        if(n1 === null){
            //如果n1是null的话，则进行初始化
            mountElement(n2,container)
        }
    }
    //core中不关心如何渲染
    //多次调用render，虚拟dom会进行更新，会进行一些diff比对
    const render = (vnode,container)=>{
        //将虚拟节点换成真实节点
        patch(container._vnode||null,vnode,container)
        container._vnode = vnode
    }
    return { 
        render,
    }
}
