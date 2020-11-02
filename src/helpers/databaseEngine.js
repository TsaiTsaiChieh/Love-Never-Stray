const ServerErrors = require('./ServerErrors');
const { Pet } = require('../schemas/pets');
const { petStatus } = require('../helpers/mapping');

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

async function getPetIdsFromMySQL(ref) {
  try {
    const result = await Pet.findAll({
      attributes: ['id', 'status'],
      where: { ref },
      raw: true
    });
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(new ServerErrors.MySQLError(err.stack));
  }
}

function updatePetStatus(idFromMySQL, data) {
  try {
    idFromMySQL.map(async function(ele) {
      if (!data.includes(ele.id)) {
        await Pet.update({ status: petStatus.NONE }, { where: { id: ele.id } });
      }
    });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new ServerErrors.MySQLError(err.stack));
  }
}

module.exports = {
  upsertPetTable,
  getPetIdsFromMySQL,
  updatePetStatus
};
