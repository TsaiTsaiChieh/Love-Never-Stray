const axios = require('axios');
const cheerio = require('cheerio');
const ServerErrors = require('../helpers/ServerErrors');
const { meetPets_URL } = process.env;
const className = '.field-field';
const { statusMapping, areaMapping, ageMapping, ligationMapping } = require('../helpers/mapping');
// const { upsertPetTable } = require('../helpers/databaseEngine');

async function main() {
  try {
    const { petTypes, petLastPages } = await getPetsLastPage();
    const petIds = await getPetIds(petTypes, petLastPages);
    // console.log(petIds);
    const a = petIds.splice(0, 5);
    // const petIds = ['76502'];
    const data = await getPetInformation(a);
    console.log(data, '??');
    // const a = await upsertPetTable(data);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err.stack);
  }
}

async function getPetsLastPage() {
  try {
    const petTypes = ['cat', 'dog'];
    const petLastPages = [];

    for (let i = 0; i < petTypes.length; i++) {
      const type = petTypes[i];
      const URL = `${meetPets_URL}/pets/${type}`;
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

async function getPetIds(petTypes, petLastPages) {
  try {
    const petIds = [];
    for (let i = 0; i < petTypes.length; i++) {
      const type = petTypes[i];
      const lastPage = petLastPages[i];
      for (let j = 0; j < lastPage; j++) {
        const URL = `${meetPets_URL}/pets/${type}?page=${j}`;
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

async function getPetInformation(petIds) {
  try {
    const data = [];
    petIds.map(async function(petId, idx) {
      let currentIdx = 0;
      const intervalId = setInterval(async function() {
        const URL = `${meetPets_URL}/content/${petId}`;
        const $ = await loadData(URL);
        const result = await repackagePetInformation($, petId);
        data.push(result);
        currentIdx++;
        console.log(currentIdx, petIds.length);
        if (currentIdx === petIds.length) {
          clearInterval(intervalId);
          console.log(data, '---');
          // return Promise.resolve(data);
          return data;
        }
      }, 500);
    });
    // return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(new ServerErrors.GetDataFromURL(err.stack));
  }
}

// async function later(delay, callback) {
//   return Promise.resolve(setTimeout(callback, delay * 1000));
// }

async function repackagePetInformation($, petId) {
  try {
    const title = $('h1.title').text();
    const images = [];
    $(`${className}-pets-image`).children('.field-items').children('.field-item').each(function(idx, ele) {
      images.push((ele.children[0].attribs.src));
    });
    const data = {
      id: petId,
      ref: 'map',
      status: statusMapping(title),
      title,
      type: textReplace($, 'pets-type', '動物種類') === '貓咪' ? '貓' : '狗',
      name: textReplace($, 'pet-name', '動物小名'),
      area_id: areaMapping(textReplace($, 'county', '所在縣市')),
      found_place: textReplace($, 'filed-county-area', '所在 區 / 市 / 鎮 / 鄉 (行政區)'),
      age: ageMapping(textReplace($, 'pet-age', '動物的出生日（年齡）')),
      ligation: ligationMapping(textReplace($, 'pet-medical', '結紮情況')),
      remark: textReplace($, 'pet-habitate', '動物個性略述'),
      image: JSON.stringify(images),
      address: textReplace($, 'contact', '聯絡人'),
      phone: textReplace($, 'tel', '電話/聯絡方式')
    };
    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(new ServerErrors.RepackageError(err.stack));
  }
}

function textReplace($, name, replace) {
  return $(`${className}-${name}`).text().replace(`${replace}:`, '').trim();
}

module.exports = main;
