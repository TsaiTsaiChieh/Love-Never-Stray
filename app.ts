import * as dotenv from 'dotenv';
import express from 'express';
import haven from 'domain-haven';
dotenv.config();
const { appPort } = process.env;
// Create a new express application instance
const app: express.Application = express();
app.use(haven());

app.use('/api', require('./src/routes/index'));
app.listen(appPort, function() {
  console.log(`Love-Never-Stray on port: ${appPort}`);
});
