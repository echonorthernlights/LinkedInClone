const badRequestError = require('./badRequest');
const notFoundError = require('./notFound');
const CustomAPIError = require('./custom-error');
const Unauthenticated = require('./unauthenticated');

module.exports = {
  badRequestError,
  notFoundError,
  CustomAPIError,
  Unauthenticated,
};
