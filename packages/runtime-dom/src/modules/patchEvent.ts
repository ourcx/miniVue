function createInvoker(value){
    const invoker = (e) => {
        return invoker.value(e)
    }
    invoker.value = value // 更改invoker中的value属性,可以修改对应的调用函数
    return invoker
}


// 事件处理函数
export function patchEvent(el, name, nextValue){
    const invokers =el._vei || (el._vei = {})
    const eventName = name.slice(2).toLowerCase()

    const existingInvoker = invokers[name] // 是否已经添加过事件
    if(existingInvoker && nextValue){
        // 以前有,现在也有
        existingInvoker.value = nextValue
        //事件换绑
    }

    if(nextValue){
        // 以前没有,现在有
        // 添加事件
        const invoker =(invokers[name]=createInvoker(nextValue))
        el.addEventListener(eventName, invoker)
        //添加事件
    }

    if(existingInvoker && !nextValue){
        // 以前有,现在没有
        el.removeEventListener(eventName, existingInvoker)
        invokers[name] = null
        //删除事件
    }
    //优化到减少了很多
    //缓存是name,事件是eventName
}