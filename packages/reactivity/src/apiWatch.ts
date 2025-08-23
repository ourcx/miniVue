import { isObject } from "@vue/shared"
import { effect, ReactiveEffect } from "./effect"

export function watch(source, cb,option = {} as any) {
    return doWatch(source, cb, option)
    //watchEffect也是这个实现的
}


function traverse(source,depth,currentDepth=0,seen=new Set()) { 
    if(!isObject(source)){
        return source
    }
    if(depth){
        if(currentDepth>=depth){
            return source
        }
        currentDepth++
        //根据当前遍历的深度进行遍历
        seen.add(source)
    }
    if(seen.has(source)){
        return source
    }
    for(const key in source) {
        traverse(source[key],depth,currentDepth,seen)
    }
    return source
    // 递归遍历触发每个属性的getter
}
function doWatch(source, cb, {deep}) {
    ()=>source
    const reactiveGetter = (source) => {
        return traverse(source,deep===false?1:undefined)
    }
    let getter =()=>reactiveGetter(source)
    let oldValue
    const job = () => {
        const newValue = effect.run()
        cb(newValue,oldValue)
        oldValue = newValue
    }


    //产生一个可以给ReactEffect来使用的getter,需要对这个对象进行取值操作,会关联当前的reactiveEffect
    const effect = new ReactiveEffect(getter, job)
    oldValue = effect.run()
}