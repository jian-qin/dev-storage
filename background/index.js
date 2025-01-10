chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStorage') {
    chrome.storage.local.get(message.key, ({ cards = [] }) => sendResponse(cards))
    return true
  }
})
