import express from 'express';
import config from './config';
import proxy from './proxy';
import getHttpCodeFromError from './helpers/getHttpCodeFromError';

const app = express();

app.use((req, res, next) => {
  proxy(req, res).then((_res) => {
    res
      .status(_res.status)
      .set({ ..._res.headers, 'content-encoding': undefined })
      .end(_res.text || _res.body);
  }, (error) => {
    const httpCode = getHttpCodeFromError(error);
    const _error = {
      name: error.name,
      message: error.message,
      stack: error.stack.split('\n')
    };
    res.status(500).end(_error);
  });
});

const port = config.port;
if (port) {
  app.listen(port, error => {
    if (error) {
      console.error(error);
    }
    console.info(`Server is running on port ${port}`);
  });
} else {
  console.error('ERROR: No port specified in config.');
}
