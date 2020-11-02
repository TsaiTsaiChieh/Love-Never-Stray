const axios = require('axios');
const { getPetIdsFromMySQL, updatePetStatus } = require('../helpers/databaseEngine');
const { ternaryMapping, petStatusFromCOA } = require('../helpers/mapping');
const ServerErrors = require('../helpers/ServerErrors');
const { COA_API } = process.env;
const batch = 1000;
const moment = require('moment');
const { Pet } = require('../schemas/pets');

// async function main(req, res) {
async function main() {
  try {
    const now = Date.now();
    const petData = await upsertPetsData(now);
    const spreadPetData = spreadPetData2Id(petData);
    const petIdsFromMySQL = await getPetIdsFromMySQL('gov');
    await updatePetStatus(petIdsFromMySQL, spreadPetData);
    console.log('完成更新政府收容所資訊');
    return Promise.resolve();
    // return res.json({ spreadPetData, petIdsFromMySQL });
  } catch (err) {
    return Promise.reject(err.stack);
  }
}

async function upsertPetsData(now) {
  try {
    let count = 0;
    let dataLength;
    const petData = [];
    do {
      const res = await axios.get(`${COA_API}&$top=${batch}&$skip=${batch * count}&animal_status=OPEN`);
      const data = await repackagePetInformation(res.data, now);
      petData.push(data);
      console.log(`${batch * count}`);
      await bulkInsertPetData(data);
      dataLength = res.data.length;
      count++;
    } while (dataLength > 0);

    return Promise.resolve(petData);
  } catch (err) {
    return Promise.reject(new ServerErrors.GetDataFromURL(err.stack));
  }
}

async function repackagePetInformation(data, now) {
  const result = [];
  try {
    data.map((ele) => {
      const elapsedDay = countElapsedDays(now, ele.animal_update);
      const temp = {
        id: Number(ele.animal_id),
        name: ele.animal_subid,
        ref: 'gov',
        area_id: ele.animal_area_pkid,
        kind: ele.animal_kind,
        sex: ternaryMapping(ele.animal_sex),
        age: ternaryMapping(ele.animal_age),
        ligation: ternaryMapping(ele.animal_sterilization),
        rabies: ternaryMapping(ele.animal_bacterin),
        found_place: ele.animal_foundplace,
        title: elapsedDay,
        status: petStatusFromCOA(ele.animal_status),
        remark: ele.animal_remark,
        address: ele.shelter_address,
        phone: ele.shelter_tel,
        image: [ele.album_file]
      };
      result.push(temp);
    });
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(new ServerErrors.RepackageError(err.stack));
  }
}

function countElapsedDays(now, updateDate) {
  const elapsedValue = moment(updateDate, 'YYYY/MM/DD').valueOf();
  if (isNaN(elapsedValue)) return 1;
  const oneDay = 1000 * 24 * 60 * 60;
  const days = Math.ceil((now - elapsedValue) / oneDay);
  return days;
}

async function bulkInsertPetData(data) {
  try {
    await Pet.bulkCreate(data, { updateOnDuplicate: ['id'] });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new ServerErrors.MySQLError(err.stack));
  }
}

function spreadPetData2Id(petData) {
  const data = [];
  const spreadPetData = [].concat(...petData);
  spreadPetData.map(ele => {
    data.push(ele.id);
  });
  return data;
}

module.exports = main;
