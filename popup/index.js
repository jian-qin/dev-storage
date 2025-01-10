import { createApp, nextTick } from '../utils/petite-vue.es.js'

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

const initCards = await new Promise((resolve) => {
  chrome.storage.local.get('cards', ({ cards = [useBase_card()] }) => resolve(cards))
})

createApp({
  cards: initCards,
  isEditor: false,
  editorContent: '',
  onUpdate() {
    chrome.storage.local.set({ cards: JSON.parse(JSON.stringify(this.cards)) })
  },
  async onCardAdd(index) {
    this.cards.splice(index + 1, 0, useBase_card())
    this.onUpdate()
    await nextTick()
    const cardEl = document.querySelectorAll('.card')[index + 1]
    cardEl.querySelector('textarea').focus()
    cardEl.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
    })
  },
  onCardDel(index) {
    this.cards.splice(index, 1)
    this.onUpdate()
  },
  onUrlAdd(urls, index) {
    urls.splice(index + 1, 0, useBase_url())
    this.onUpdate()
  },
  onUrlDel(urls, index) {
    urls.splice(index, 1)
    this.onUpdate()
  },
  onUrlOpen(url) {
    chrome.tabs.create({ url })
  },
  async onExecution({ script }) {
    script = script.trim()
    if (!script) {
      alert('请输入脚本内容！')
      return
    }
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
    this.isEditor = !this.isEditor
    if (this.isEditor) {
      this.editorContent = JSON.stringify(this.cards, null, 2)
    }
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
