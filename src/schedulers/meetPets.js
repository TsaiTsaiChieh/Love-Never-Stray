const axios = require('axios');
const cheerio = require('cheerio');
const ServerErrors = require('../helpers/ServerErrors');
const { meetPets_URL } = process.env;

async function main() {
  try {
    const { petTypes, petLastPages } = await getPetsLastPage();
    const petIds = await getPetIds(petTypes, petLastPages);
    console.log(petIds);
    // const petIds = ['76502'];
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err.stack);
  }
}

async function getPetIds(petTypes, petLastPages) {
  try {
    const petIds = [];
    for (let i = 0; i < petTypes.length; i++) {
      const type = petTypes[i];
      const lastPage = petLastPages[i];
      for (let j = 0; j < lastPage; j++) {
        const URL = `${meetPets_URL}/${type}?page=${j}`;
        const $ = await loadData(URL);
        const titles = $('.view-data-node-title a');
        titles.each(function(idx, ele) {
          const petId = ele.attribs.href.replace('/content/', '');
          petIds.push(petId);
        });
      }
    }
    return Promise.resolve(petIds);
  } catch (err) {
    return Promise.reject(new ServerErrors.GetDataFromURL(err.stack));
  }
}

async function getPetsLastPage() {
  try {
    const petTypes = ['cat', 'dog'];
    const petLastPages = [];

    for (let i = 0; i < petTypes.length; i++) {
      const type = petTypes[i];
      const URL = `${meetPets_URL}/${type}`;
      const $ = await loadData(URL);
      const lastPage = Number($('.pager-list > .pager-last').text());
      petLastPages.push(lastPage);
    }
    return Promise.resolve({ petTypes, petLastPages });
  } catch (err) {
    return Promise.reject(new ServerErrors.CheerioError(err.stack));
  }
}

async function loadData(URL) {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);
    return Promise.resolve($);
  } catch (err) {
    return Promise.reject(new ServerErrors.GetDataFromURL(err.stack));
  }
}
module.exports = main;
