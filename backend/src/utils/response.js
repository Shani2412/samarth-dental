const success = (res, data = {}, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const error = (res, message = 'Something went wrong', status = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

const paginate = (res, data, total, page, limit) =>
  res.json({
    success: true,
    data,
    pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) },
  });

module.exports = { success, error, paginate };
