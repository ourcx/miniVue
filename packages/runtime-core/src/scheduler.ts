const queue: any[] = []
// 缓存的任务   
let isFlushing = false
// 是否正在刷新
const resolvePromise = Promise.resolve()


//如果同时在一个组件中更新多个状态，job肯定是同一个
// 如果isFlushing为false，说明没有刷新任务，就开启一个微任务刷新
export function queueJob (job) {
    if (!queue.includes(job)) {
        queue.push(job);
        //让任务入队列
        //去重
    }
    if (!isFlushing) {
        isFlushing = true;
        resolvePromise.then(() => {
            isFlushing = false;
            const copy = queue.slice(0);
            queue.length = 0;
            copy.forEach((job) => job());
            copy.length = 0;
        });
        //延迟更新操作，微任务最后完成
        //等待状态修改完后再进行更新
    }
}