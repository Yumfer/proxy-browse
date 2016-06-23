import request from 'superagent';
import isRelativeUrl from './helpers/isRelativeUrl';
import relativeToAbsoluteUrl from './helpers/relativeToAbsoluteUrl';
import urlUtils from 'url';
import proxifyUrl from './helpers/proxifyUrl';

function replaceImages(text, protocol, host, port, proxyProtocol, proxyHost) {
  return text
    .replace(/(<[a-zA-Z]+ [^>]*src=[\"\'])(.+)([\"\'])/g, (match, segment1, segment2, segment3) => {
      let url = segment2.trim();
      if (isRelativeUrl(url)) {
        url = relativeToAbsoluteUrl(url, protocol, host, port);
      }
      return segment1 + proxifyUrl(url, proxyProtocol, proxyHost) + segment3;
    });
}

function replaceAnchors(text, protocol, host, port, proxyProtocol, proxyHost) {
  return text
    .replace(/(<[a-zA-Z]+ [^>]*href=[\"\'])(.+)([\"\'])/g, (match, segment1, segment2, segment3) => {
      let url = segment2.trim();
      if (isRelativeUrl(url)) {
        url = relativeToAbsoluteUrl(url, protocol, host, port);
      }
      return segment1 + proxifyUrl(url, proxyProtocol, proxyHost) + segment3;
    });
}

function replaceCssUrls(text, protocol, host, port, proxyProtocol, proxyHost) {
  return text
    .replace(/(url\()([^\)]+)(\))/g, (match, segment1, segment2, segment3) => {
      let url = segment2.trim();
      if (isRelativeUrl(url)) {
        url = relativeToAbsoluteUrl(url, protocol, host, port);
      }
      return segment1 + proxifyUrl(url, proxyProtocol, proxyHost) + segment3;
    });
}

export default async function proxy(req, res) {
  const method = req.method;
  let url = req.query._proxy_browse_url;
  let response = null;
  if (!url) {
    response = {
      status: 429,
      text: '<!doctype html><html><head></head><body>Missing query param: _proxy_browse_url</body></html>'
    };
  } else {
    let urlObject = urlUtils.parse(url);
    const query = { ...req.query, _proxy_browse_url: undefined };
    const headers = req.headers;
    const body = req.body;
    response = await new Promise((resolve, reject) => {
      request(method, urlObject.href)
        .query(query)
        .send(body)
        .set(headers)
        .set('Host', urlObject.host)
        .end((err, _res) => {
          resolve(_res);
        });
    });
    if (response.text) {
      response.text = replaceImages(response.text, urlObject.protocol, urlObject.host, urlObject.port, req.protocol, req.headers.host);
      response.text = replaceAnchors(response.text, urlObject.protocol, urlObject.host, urlObject.port, req.protocol, req.headers.host);
      response.text = replaceCssUrls(response.text, urlObject.protocol, urlObject.host, urlObject.port, req.protocol, req.headers.host);
    }
  }
  return response;
}
