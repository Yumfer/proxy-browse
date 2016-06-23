export default function isRelativeUrl(url) {
  return url.indexOf('//') < 0;
}
