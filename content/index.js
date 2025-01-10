sessionStorage.getItem('dev-storage_content-inited') || chrome.runtime.sendMessage({
  action: 'getStorage',
  key: 'cards'
}, (cards = []) => {
  const { script, redirect } = cards.find(({ url, script }) => {
    url = url.trim()
    if (!url || !script.trim()) return
    return location.href.startsWith(url)
  }) || {}
  if (!script) return
  try {
    eval(script)
    const _redirect = redirect.trim()
    _redirect ? location.replace(_redirect) : location.reload()
  } catch (err) {
    alert(String(err))
  }
})
sessionStorage.setItem('dev-storage_content-inited', 'true')
