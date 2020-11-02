const axios = require('axios');
const cheerio = require('cheerio');
const ServerErrors = require('../helpers/ServerErrors');
const { meetPets_URL } = process.env;
const className = '.field-field';
const { SEX, statusMapping, areaMapping, ageMapping, ligationMapping } = require('../helpers/mapping');
const { upsertPetTable, getPetIdsFromMySQL, updatePetStatus } = require('../helpers/databaseEngine');
const duration = 100;

async function main() {
  try {
    const { petTypes, petLastPages } = await getPetsLastPage();
    const petIds = await getPetIds(petTypes, petLastPages);
    const petIdsFromMySQL = await getPetIdsFromMySQL('map');
    await updatePetStatus(petIdsFromMySQL, petIds);
    const data = await getPetInformation(petIds);
    await upsertPetTable(data);
    console.log('完成更新台灣認養地圖');
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
    return Promise.reject(new ServerErrors.GetDataFromURL(err.stack));
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
          const petId = Number(ele.attribs.href.replace('/content/', ''));
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
  return new Promise(function(resolve, reject) {
    try {
      const data = [];
      let currentIdx = 0;
      const intervalId = setInterval(async function() {
        const petId = petIds[currentIdx];
        const URL = `${meetPets_URL}/content/${petId}`;
        const $ = await loadData(URL);
        const result = await repackagePetInformation($, petId);
        data.push(result);
        currentIdx++;
        console.log(`${currentIdx}/${petIds.length}`);
        if (currentIdx === petIds.length) {
          clearInterval(intervalId);
          return resolve(data);
        }
      }, duration);
    } catch (err) {
      return reject(new ServerErrors.GetDataFromURL(err.stack));
    }
  });
}

async function repackagePetInformation($, petId) {
  try {
    const title = $('h1.title').text();
    const images = [];
    $(`${className}-pets-image`).children('.field-items').children('.field-item').each(function(idx, ele) {
      images.push((ele.children[0].attribs.src));
    });
    const remark = textReplace($, 'pet-habitate', '動物個性略述');
    const data = {
      id: petId,
      ref: 'map',
      status: statusMapping(title),
      title: title,
      kind: textReplace($, 'pets-type', '動物種類') === '貓咪' ? '貓' : '狗',
      sex: sexSensor(remark),
      name: textReplace($, 'pet-name', '動物小名'),
      area_id: areaMapping(textReplace($, 'county', '所在縣市')),
      found_place: textReplace($, 'filed-county-area', '所在 區 / 市 / 鎮 / 鄉 (行政區)'),
      age: ageMapping(textReplace($, 'pet-age', '動物的出生日（年齡）')),
      ligation: ligationMapping(textReplace($, 'pet-medical', '結紮情況')),
      remark: remark,
      image: images,
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

function sexSensor(remark) {
  if (remark.includes('母') || remark.includes('妹妹') || remark.includes('女') || remark.includes('公主') || remark.includes('姐') || remark.includes('姊')) return SEX.FEMALE;
  else if (remark.includes('公') || remark.includes('弟') || remark.includes('帥') || remark.includes('男') || remark.includes('王子')) return SEX.MALE;
  return SEX.NONE;
}

module.exports = main;
