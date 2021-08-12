const URLSearchParams = require('@ungap/url-search-params')

function render({ target, token, apiKey, spaceUrl, bypassDocumentLoadEvent }) {

  function start() {
    const originalPath = window.location.pathname
    const urlParams = new URLSearchParams(window.location.search)
    const kbeeFullPath = urlParams.get('kbee') ? decodeURI(urlParams.get('kbee')) : ''
    const [kbeePath, kbeeAchor] = kbeeFullPath.split('#')
    const targetElement = typeof target === "string" ? document.querySelector(target) : target
    if (typeof target === "string" && !targetElement) throw new Error(`Target element with selector "${target}" does not exist`)
    if (!(targetElement instanceof Element || targetElement instanceof HTMLDocument)) throw new Error(`Target element is not a valid DOM element`)

    if (!spaceUrl) throw new Error(`"spaceUrl" is required`)
    if (!token && !apiKey) throw new Error(`One of "token" or "apiKey" is required`)

    spaceUrl = spaceUrl.replace(/\/$/, "")

    // JWT token is not passed, generate one on the client side
    if (!token) {
      const data = `{"url": "${spaceUrl.split('://')[1]}","key":"${apiKey}"}`
      const xhr = new XMLHttpRequest()
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          try {
            const { jwt } = JSON.parse(this.responseText)
            renderWithToken(jwt)
          } catch (e) {
            targetElement.innerHTML = 'Could not authenticate. Please make sure you <a href="https://help.kbee.app/page/1yogD_TtpKLjdmVhFGxJyIaRZPuyPcbwtTH1rHsZhcUQ/Embed_Kbee_on_your_page#h.a4zbywr9omu7">whitelist your domain</a>.'
          }
        }
      })
      xhr.open("POST", `${spaceUrl}/api/generateJWT`)
      xhr.send(data)
    } else {
      renderWithToken(token)
    }

    function renderWithToken(token) {
      targetElement.innerHTML = `<iframe src="${spaceUrl}${kbeePath}?jwt=${token}#${kbeeAchor ?? ''}" style="width:100%;height:100%;border:none"/>`
      const iframeWindow = targetElement.querySelector('iframe').contentWindow

      window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search)
        const kbeeFullPath = urlParams.get('kbee') ? decodeURI(urlParams.get('kbee')) : ''
        const [kbeePath, kbeeAchor] = kbeeFullPath.split('#')
        targetElement.querySelector('iframe').src = `${spaceUrl}${kbeePath}?jwt=${token}#${kbeeAchor ?? ''}`
      })

      window.addEventListener('message', message => {
        if (message.source !== iframeWindow) return
        if (message.data.indexOf('jwt=') > -1) return
        const urlParams = new URLSearchParams(window.location.search)
        let msg = message.data
        if (message.data.startsWith('__initial__')) {
          [, msg] = message.data.split('__initial__')
          const [kbeePath, kbeeAchor] = msg.split('#')
          targetElement.querySelector('iframe').src = `${spaceUrl}${kbeePath}?jwt=${token}#${kbeeAchor ?? ''}`
        }
        urlParams.set('kbee', msg)
        const newPath = `${originalPath}?${urlParams.toString()}`
        window.history.pushState({}, '', newPath)
      })

    }
  }

  // For React and other view libraries, the DOMContentLoaded event fires too early to be used, so it should be bypassed
  if (bypassDocumentLoadEvent) {
    start()
  } else {
    document.addEventListener("DOMContentLoaded", start)
  }
}

exports.render = render