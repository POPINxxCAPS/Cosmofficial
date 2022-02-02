const app = require('express')();
const {send} = require('./bridge.js');
 
app.all('*', (req, res) => {
  const path = req.path !== '/' ? req.path : '/v1/server';
  const {body, method = req.query.method} = req.query;
 
  console.log('All Route', method, body, path);
  return send(method, path, {body, log: true})
    .then(body => res.json(body))
    .catch(({message, error}) => {
      console.error(`${message} error:`, error);
      return res.sendStatus(500);
    });
});
 
return app;