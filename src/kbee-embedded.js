import URLSearchParams from '@ungap/url-search-params'

window.Kbee = {
  render: ({ target, token, apiKey, spaceUrl, }) => {
    document.addEventListener("DOMContentLoaded", () => {
      const originalPath = window.location.pathname
      const urlParams = new URLSearchParams(window.location.search)
      const kbeePath = urlParams.get('kbee') ? decodeURI(urlParams.get('kbee')) : null
      const targetElement = typeof target === "string" ? document.querySelector(target) : target
      if (typeof target === "string" && !targetElement) throw new Error(`Target element with selector "${target}" does not exist`)
      if (!(targetElement instanceof Element || targetElement instanceof HTMLDocument)) throw new Error(`Target element is not a valid DOM element`)

      if (!spaceUrl) throw new Error(`"spaceUrl" is required`)
      if (!token && !apiKey) throw new Error(`One of "token" or "apiKey" is required`)

      // JWT token is not passed, generate one on the client side
      if (!token) {
        const data = `{"url": "${spaceUrl.split('://')[1]}","key":"${apiKey}"}`
        const xhr = new XMLHttpRequest()
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            const { jwt } = JSON.parse(this.responseText)
            renderWithToken(jwt)
          }
        })
        xhr.open("POST", `${spaceUrl}/api/generateJWT`)
        xhr.send(data)
      } else {
        renderWithToken(token)
      }

      function renderWithToken(token) {
        targetElement.innerHTML = `<iframe src="${spaceUrl}${kbeePath ? kbeePath : ''}?jwt=${token}" style="width:100%;height:100%;border:none"/>`
        const iframeWindow = targetElement.querySelector('iframe').contentWindow

        window.addEventListener('popstate', () => {
          const urlParams = new URLSearchParams(window.location.search)
          const kbeePath = urlParams.get('kbee') ? decodeURI(urlParams.get('kbee')) : null
          targetElement.querySelector('iframe').src = `${spaceUrl}${kbeePath ? kbeePath : ''}?jwt=${token}`
        })

        window.addEventListener('message', message => {
          if (message.source !== iframeWindow) return
          if (message.data.indexOf('jwt=') > -1) return
          const urlParams = new URLSearchParams(window.location.search)
          urlParams.set('kbee', message.data)
          const newPath = `${originalPath}?${urlParams.toString()}`
          window.history.pushState({}, '', newPath)
        })

      }

    })
  }
}