export default function proxifyUrl(url, proxyProtocol, proxyHost) {
  return proxyProtocol + '://' + proxyHost + '/?_proxy_browse_url=' + url;
}
