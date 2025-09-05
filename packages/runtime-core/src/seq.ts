export default  function getSequence(arr){
    const result = [0]
    const p = result.slice(0)
    let start;
    let end;
    let middle;
    const len = arr.length;
    
    for(let i = 0;i<len;i++){
        const arrI = arr[i]
        if(arrI!==0){
            //创建节点,为了vue3处理的
            //拿出结果集对应的最后一项,和我当前这一项来做比对
            let resultastIndex = result[result.length-1]
            if(arr[resultastIndex]<arrI){
                //最后一项是小于这个数,直接把结果集这些放进去,
                p[i] = result[result.length-1]
                result.push(i);
                continue
            }
            //这里有一个二分查找的逻辑,把后面小的去进行替换!
        }
        start = 0;
        end =result.length-1;
        while(start<end){
            middle = (start+end)/2 | 0 //取整
            if(arr[result[middle]]<arrI){
                start = middle + 1
            }else{
                end = middle
            }
        }
        if(arrI<arr[result[start]]){
            p[i] = result[start-1]
            result[start]=i
        }
    }
    //p为前去节点的列表，需要根据最后一个节点做追踪
    let l = result.length;
    let last = result[l-1]
    while(l-->0){
        result[l] = last
        last = p[last]
        //找到最后一个
    }
    return result
}