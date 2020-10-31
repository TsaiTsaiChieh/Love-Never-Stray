const axios = require('axios');
const cheerio = require('cheerio');
const ServerErrors = require('../helpers/ServerErrors');
const { Pet } = require('../schemas/pets');
const { meetPets_URL } = process.env;
const className = '.field-field';
const { petStatus, statusMapping, areaMapping, ageMapping, ligationMapping } = require('../helpers/mapping');
const { upsertPetTable } = require('../helpers/databaseEngine');

async function main() {
  try {
    const { petTypes, petLastPages } = await getPetsLastPage();
    const petIds = await getPetIds(petTypes, petLastPages);
    const petIdsFromMySQL = await getPetIdsFromMySQL();
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

async function getPetIdsFromMySQL() {
  try {
    const result = await Pet.findAll({
      attributes: ['id'],
      where: { ref: 'map' },
      raw: true
    });
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(new ServerErrors.MySQLError(err.stack));
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
      }, 100);
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
    const data = {
      id: petId,
      ref: 'map',
      status: statusMapping(title),
      title,
      kind: textReplace($, 'pets-type', '動物種類') === '貓咪' ? '貓' : '狗',
      name: textReplace($, 'pet-name', '動物小名'),
      area_id: areaMapping(textReplace($, 'county', '所在縣市')),
      found_place: textReplace($, 'filed-county-area', '所在 區 / 市 / 鎮 / 鄉 (行政區)'),
      age: ageMapping(textReplace($, 'pet-age', '動物的出生日（年齡）')),
      ligation: ligationMapping(textReplace($, 'pet-medical', '結紮情況')),
      remark: textReplace($, 'pet-habitate', '動物個性略述'),
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

function updatePetStatus(idFromMySQL, data) {
  try {
    idFromMySQL.map(async function(ele) {
      if (!data.includes(String(ele.id))) {
        await Pet.update({ status: petStatus.NONE }, { where: { id: ele.id } });
      }
    });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new ServerErrors.MySQLError(err.stack));
  }
}

module.exports = main;
