//主要是对节点的增删改查

export const nodeOps = {
  createElement (type) {
    return document.createElement(type)
  },
  setElementText (el, text) {
    el.textContent = text
  },
  // 插入，如果第三个元素不传，等价于appendChild
  insert (el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  remove (el) {
    const parent = el.parentNode
    if (parent) parent.removeChild(el)
  },
  createText (text) {
    return document.createTextNode(text)
  },
  setText (node, text) {
    node.nodeValue = text
  },
  parentNode (node) {
    return node.parentNode
  },
  nextSibling (node) {
    return node.nextSibling
  }
}
//对节点属性进行操作
