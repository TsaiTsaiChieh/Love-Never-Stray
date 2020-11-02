const { INTERNAL_SERVER_ERROR } = require('http-status');

class ExtendableError extends Error {
  constructor(message, status, isPublic, code) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    this.status = status;
    this.isPublic = isPublic;
    this.code = code;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class GetDataFromURL extends ExtendableError {
  constructor(message, status = 500000, isPublic = true, code = INTERNAL_SERVER_ERROR) {
    super(message, status, isPublic, code);
  }
}

class RepackageError extends ExtendableError {
  constructor(message, status = 500001, isPublic = true, code = INTERNAL_SERVER_ERROR) {
    super(message, status, isPublic, code);
  }
}

class MySQLError extends ExtendableError {
  constructor(message, status = 500002, isPublic = true, code = INTERNAL_SERVER_ERROR) {
    super(message, status, isPublic, code);
  }
}
module.exports = {
  GetDataFromURL,
  RepackageError,
  MySQLError
};
