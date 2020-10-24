const ServerErrors = require('./ServerErrors');
const Pet = require('../schemas/pets');

async function upsertPetTable(data) {
  try {
    console.log(data);
    const result = await Pet.upsert(data, { where: data.id });
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(new ServerErrors.MySQLError(err.stack));
  }
}

module.exports =
{ upsertPetTable };
