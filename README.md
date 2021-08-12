# Kbee Embedded
Embed a Kbee knowledge base into your website

## Usage

### Via NPM

Install the package

```
npm i @kbee-app/embedded --save
```

Then use the package

```javascript
const renderKbee = require('@kbee-app/embedded')
renderKbee({
  target: '#kbee-content',
  spaceUrl: 'http://yourspace.kbee.app',
  apiKey: '<YOUR-API-KEY>'
})
```

### Via JSDeliver

If you can't use npm, you can use a pre-built bundle from JSDeliver

First, include the Kbee script tag in your page's `<head>`:

```
<script src="https://cdn.jsdelivr.net/gh/kbee-app/embedded@latest/dist/kbee-embedded.js"></script>
```

Then, call the Kbee function to render the help center into the target of your choosing:

```javascript
Kbee.render({
  target: '#kbee-content',
  spaceUrl: 'http://yourspace.kbee.app',
  apiKey: '<YOUR-API-KEY>'
})
```

## Options

```javascript
Kbee.render({
  // Where to render the content. Either pass a query string or a DOM Element
  // Kbee will overwrite the content in the container
  target: '#kbee-content',
  // URL of your Kbee Space
  spaceUrl: 'https://yourspace.kbee.app',
  // A JWT token generated from your server using the Kbee private key.
  // This is the reccomended method as it is fully secure, however it requires you to run the JWT creation code on your server
  // Note: Do not hardcode a JWT token, instead use the apiKey method.
  token: '<JWT-TOKEN>',
  // If you do not want to or cannot generate a JWT token, you can whitelist your domain and use the API key to generate a JWT from the Kbee servers
  // This method is much simpler and does not require you to run any server code, but a dedicated attacker can steal your API key and manually spoof requests to generate a JWT.
  apiKey: '<YOUR-API-KEY>',
  // For React and other view libraries, the DOMContentLoaded event fires too early to be used, so it should be bypassed
  bypassDocumentLoadEvent: true
})
```

## React Example

```javascript
import { useEffect } from 'react'

const renderKbee = require('@kbee-app/embedded')

export default function Test() {
  useEffect(() => {
    renderKbee({
      target: '#kbee-content',
      spaceUrl: 'http://yourspace.kbee.app',
      apiKey: '<YOUR-API-KEY>',
      bypassDocumentLoadEvent: true
    })
  }, [])
  return <div id='kbee-content' style={{ width: '100vw', height: '100vh' }} />
}
```