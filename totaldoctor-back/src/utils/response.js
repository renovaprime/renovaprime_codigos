const successResponse = (data) => {
  return { data };
};

const errorResponse = (message, code = 'ERROR') => {
  return { message, code };
};

module.exports = {
  successResponse,
  errorResponse
};
