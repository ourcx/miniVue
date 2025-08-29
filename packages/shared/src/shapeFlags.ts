export enum ShapeFlags {
    ELEMENT = 1, //元素
    STATEFUL_COMPONENT = 1 << 1, //有状态组件 //2
    FUNCTIONAL_COMPONENT = 1 << 2, // 2
    SLOT_CHILDREN = 1 << 3, //8
    TEXT_CHILDREN = 1 << 4, //16
    TELEPORT = 1 << 5, //32
    SUSPENSE = 1 << 6,
    FRAGMENT = 1 << 7,
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
    COMPONENT_KEPT_ALIVE = 1 << 9,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
    ARRAY_CHILDREN = 1 << 10,
}
//通过位运算来判断组件的类型
// 1 + 8 = 0001+ 1000 = 1001 不一样就是1
// 1 | 8 = 0001 | 1000 = 1001 有1就是1
// 1 & 8 = 0001 & 1000 = 0000 都有1就是1
// 1 & 8 > 0 说明儿子是文本元素