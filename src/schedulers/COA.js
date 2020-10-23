const axios = require('axios');
const { COA_API } = process.env;

async function main() {
  try {
    await getDataFromAPI();
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err.stack);
  }
}

async function getDataFromAPI() {
  try {
    console.log(`${COA_API}&$top=1000&$skip=1000`);
    const { data } = await axios.get(`${COA_API}&$top=1000&$skip=1000`);
    console.log(data);
    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err.stack);
  }
}

module.exports = main;
