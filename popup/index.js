import { createApp, nextTick } from '../utils/petite-vue.es.js'
import { scrollToView } from '../utils/tools.js'

document.startViewTransition ||= callback => {
  callback()
  return { finished: nextTick() }
}

const useBase_url = () => ({
  id: Date.now(),
  target: '',
  redirect: '',
})
const useBase_card = () => ({
  id: Date.now(),
  enable: true,
  remark: '',
  script: '',
  urls: [useBase_url()],
})

const storage = await new Promise((resolve) => {
  chrome.storage.local.get(['cards', 'version'], (result) => {
    result.cards ??= [useBase_card()]
    result.version ??= { lastCheck: 0 }
    resolve(result)
  })
})

createApp({
  cards: storage.cards,
  isEditor: false,
  editorContent: '',
  version: {
    ...storage.version,
    current: chrome.runtime.getManifest().version,
  },
  async onMounted() {
    if (this.version.lastCheck < Date.now() - 1000 * 60 * 60 * 24) {
      const [tag] = await fetch('https://api.github.com/repos/jian-qin/dev-storage/tags').then((res) => res.json())
      this.version = {
        current: this.version.current,
        latest: tag.name.replace('v', ''),
        lastCheck: Date.now(),
        download: tag.zipball_url,
      }
      chrome.storage.local.set({ version: this.version })
    }
  },
  onUpdateVersion() {
    chrome.tabs.create({ url: this.version.download })
  },
  onUpdate() {
    chrome.storage.local.set({ cards: JSON.parse(JSON.stringify(this.cards)) })
  },
  async onCardAdd(index) {
    await document.startViewTransition(() => {
      this.cards.splice(index + 1, 0, useBase_card())
      this.onUpdate()
    }).finished
    const cardEl = document.querySelectorAll('.card')[index + 1]
    scrollToView({
      scroll: document.querySelector('#app'),
      target: cardEl,
      direction: 'vertical',
      location: 'start',
      offset: 14,
      callback() {
        cardEl.querySelector('textarea').focus()
      },
    })
  },
  onCardDel(index) {
    document.startViewTransition(() => {
      this.cards.splice(index, 1)
      this.onUpdate()
    })
  },
  onUrlAdd(urls, index) {
    document.startViewTransition(() => {
      urls.splice(index + 1, 0, useBase_url())
      this.onUpdate()
    })
  },
  onUrlDel(urls, index) {
    document.startViewTransition(() => {
      urls.splice(index, 1)
      this.onUpdate()
    })
  },
  onUrlOpen(url) {
    chrome.tabs.create({ url })
  },
  async onExecution({ script }) {
    const tabId = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0].id))
    })
    const code = `;${script};location.reload();'SUCCESS';`
    chrome.tabs.executeScript(tabId, { code }, ([succ] = []) => {
      if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message)
        return
      }
      if (succ !== 'SUCCESS') {
        alert('执行失败，在控制台查看错误信息！')
        return
      }
      window.close()
    })
  },
  onEditor() {
    document.startViewTransition(() => {
      this.editorContent = JSON.stringify(this.cards, null, 2)
      this.isEditor = !this.isEditor
    })
  },
  onSave() {
    try {
      const editorContent = this.editorContent.trim()
      const result = editorContent ? JSON.parse(editorContent) : []
      this.cards = result.length ? result : [useBase_card()]
      this.onUpdate()
      this.isEditor = false
    } catch (err) {
      alert(String(err))
    }
  }
}).mount()
