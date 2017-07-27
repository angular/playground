// import require.js loader
importScripts("/assets/monaco/vs/loader.js");

let pako = null;

require.config({
  baseUrl: "/",
  paths: {
    'pako': 'https://unpkg.com/pako@1.0.5/dist/pako'
  }
})
require(['pako'], _pako => {
  pako = _pako;
  console.log(pako);

  addEventListener('message', (message) => {
    postMessage(encodeUrlData(message.data));
  })
});

function toUrlKey(code) {
  return btoa(pako.deflateRaw(code, {to: 'string'}))
      .replace(/=*$/, '')
      .replace(/\//g, '_')
      .replace(/\+/g, '.');
}

function encodeUrlData(data) {
  const key = toUrlKey(data);
  return [
      '#',
      key == toUrlKey('\0\0') ? '' : key,
    ].join(',');
}
