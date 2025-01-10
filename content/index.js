sessionStorage.getItem('dev-storage_content-inited') || chrome.runtime.sendMessage({
  action: 'getStorage',
  key: 'cards'
}, (cards = []) => {
  let result = null
  cards.some(({ urls, script }) => {
    if (!script.trim()) return
    const url = urls.find(({ target }) => location.href.startsWith(target.trim()))
    if (url) {
      result = {
        script,
        redirect: url.redirect.trim(),
      }
      return true
    }
  })
  if (!result) return
  try {
    eval(result.script)
    result.redirect ? location.replace(result.redirect) : location.reload()
  } catch (err) {
    setTimeout(() => alert(String(err)), 1000)
  }
})
sessionStorage.setItem('dev-storage_content-inited', 'true')
