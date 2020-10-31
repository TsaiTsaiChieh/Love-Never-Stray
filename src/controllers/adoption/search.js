const ajv = require('../../helpers/ajvUtil');
const { BAD_REQUEST } = require('http-status');
const model = require('../../models/adoption/search');

async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      kind: {
        type: 'string',
        enum: ['C', 'D', 'O']
      },
      sex: {
        type: 'string',
        enum: ['0', '1']
      },
      age: {
        type: 'string',
        enum: ['0', '1']
      },
      page: {
        type: 'integer',
        default: 0
      },
      updatedAt: {
        type: 'string',
        enum: ['DESC', 'ASC'],
        default: 'ASC'
      },
      region: {
        type: 'string',
        enum: ['N', 'M', 'S', 'E', 'O']
      }

    }
  };

  req.query.page = parseInt(req.query.page);
  const valid = ajv.validate(schema, req.query);
  if (!valid) return res.status(BAD_REQUEST).json(ajv.errors);
  try {
    return res.json(await model(req.query));
  } catch (err) {
    return res.status(err.code).json(err.isPublic
      ? { error: err.name, devcode: err.status, message: err.message }
      : err.code);
  }
}

module.exports = controller;
