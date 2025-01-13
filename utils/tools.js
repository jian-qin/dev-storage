
/**
 * 替代scrollIntoView（元素滚动到屏幕内）
 * @see scrollIntoView有时候会让意外的滚动父级滚动，有时候会滚动失败
 * @param {object} param0 配置
 * @param {HTMLElement} param0.scroll 滚动父级元素
 * @param {HTMLElement} param0.target 目标元素
 * @param {number} [param0.offset] 滚动偏移量
 * @param {'horizontal' | 'vertical'} [param0.direction] 滚动方向
 * @param {'start' | 'center' | 'end' | 'nearest'} [param0.location] 对齐方式
 * @param {Function} [param0.callback] 滚动完成回调
 */
export function scrollToView({
  scroll,
  target,
  offset = 0,
  direction = 'horizontal',
  location = 'center',
  callback,
}) {
  const isHorizontal = direction === 'horizontal'
  const scrollNum = scroll[isHorizontal ? 'scrollLeft' : 'scrollTop']
  const scrollSize = scroll[isHorizontal ? 'clientWidth' : 'clientHeight']
  const scrollMax = scroll[isHorizontal ? 'scrollWidth' : 'scrollHeight'] - scrollSize
  const targetOffset = target[isHorizontal ? 'offsetLeft' : 'offsetTop']
  const targetSize = target[isHorizontal ? 'offsetWidth' : 'offsetHeight']
  let num
  const map = {
    start: targetOffset - offset,
    center: targetOffset - (scrollSize - targetSize) / 2 - offset,
    end: targetOffset - scrollSize + targetSize + offset,
  }
  if (location === 'nearest') {
    if (offset * 2 + targetSize > scrollSize) {
      num = map.center
    } else if (scrollNum > map.start) {
      num = map.start
    } else if (scrollNum < map.end) {
      num = map.end
    } else {
      callback?.()
      return
    }
  } else {
    num = map[location]
  }
  if (num < 0) num = 0
  if (num === scrollNum || (num > scrollNum && scrollNum === scrollMax)) {
    callback?.()
    return
  }
  scroll.scrollTo({
    [isHorizontal ? 'left' : 'top']: num,
    behavior: 'smooth',
  })
  callback && scroll.addEventListener('scrollend', callback, { once: true })
}
