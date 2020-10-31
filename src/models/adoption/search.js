const { QueryTypes } = require('sequelize');
const { mysql } = require('../../configs/mysqlSetting');
const ServerErrors = require('../../helpers/ServerErrors');

async function model(args) {
  try {
    const query = queriesProcessor(args);
    const result = await searchPets(query);
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}

function queriesProcessor(args) {
  const Args = {};
  for (const key in args) {
    if (key === 'kind') Args[key] = kindMapping(args[key]);
    if (key === 'sex') Args[key] = Number(args[key]);
    if (key === 'age') Args[key] = Number(args[key]);
    if (key === 'region') Args[key] = args[key];
    if (key === 'updatedAt') Args[key] = args[key];
  }
  return Args;
}

function kindMapping(kind) {
  switch (kind) {
    case 'C':
      return '貓';
    case 'D':
      return '狗';
    default:
      return 'O';
  }
}

async function searchPets(query) {
  try {
    const condition = queryConcat(query);
    let result = [];
    if (query.hasOwnProperty('region')) {
      result = await mysql.query(
        `SELECT * 
           FROM pets
      LEFT JOIN regions ON regions.fk_area_id = pets.area_id
          WHERE ${condition}`, {
          type: QueryTypes.SELECT,
          raw: true
        });
    } else {
      result = await mysql.query(
        `SELECT * 
           FROM pets
          WHERE ${condition}`, {
          type: QueryTypes.SELECT,
          raw: true
        });
    }
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(new ServerErrors.MySQLError(err.stack));
  }
}

function queryConcat(query) {
  let concat = '';
  for (const key in query) {
    if (key === 'kind' && query[key] !== 'O') concat += `${key} = '${query[key]}' AND `;
    if (key === 'kind' && query[key] === 'O') concat += `(${key} != '貓' AND ${key} != '狗') AND `;
    if (key === 'sex') concat += `(${key} = ${query[key]} OR ${key} = -1) AND `;
    if (key === 'age') concat += `(${key} = ${query[key]} OR ${key} = -1) AND `;
    if (key === 'region') concat += `${key} = '${query[key]}' AND `;
  }
  concat = concat.substring(0, concat.length - 4);
  if (query.hasOwnProperty('updatedAt')) concat += `ORDER BY updatedAt ${query.updatedAt}`;
  return concat;
}

module.exports = model;
