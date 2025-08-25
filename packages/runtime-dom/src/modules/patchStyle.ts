export function patchStyle (el, prev, next) {
  const style = el.style
  for (const key in next) {
    style[key] = next[key] //新样式全生效
  }

  if (prev) {
    for (const key in prev) {
      if (!next[key]) {
        //新样式没有的,就删除
        style[key] = null
      }

    }
  }
}
