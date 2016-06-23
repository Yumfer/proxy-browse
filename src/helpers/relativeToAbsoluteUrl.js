export default function relativeToAbsoluteUrl(relativeUrl, protocol, host, port) {
  return protocol + '//' + host + (port ? ':' + port : '') + ('/' + relativeUrl).replace(/\/\//, '/');
}
