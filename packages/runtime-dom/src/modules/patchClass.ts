export function patchClass(el, value){
    if(value == null){
        el.removeAttribute('class')
        //删除属性
    }else{
        el.className = value
    }
}
