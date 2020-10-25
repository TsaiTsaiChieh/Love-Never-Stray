const ServerErrors = require('./ServerErrors');
const Pet = require('../schemas/pets');

async function upsertPetTable(data) {
  try {
    data.map(async(ele) => {
      await Pet.upsert(ele, { where: ele.id });
    });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new ServerErrors.MySQLError(err.stack));
  }
}

module.exports =
{ upsertPetTable };
