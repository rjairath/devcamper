const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copying the query object
  let reqQuery = { ...req.query };

  // Removing fields from the query object
  let removeFields = ["select", "sortBy", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Creating the query string from the modified object
  let queryStr = JSON.stringify(reqQuery);

  // Accounting for comparison operators
  queryStr = queryStr.replace(
    /\b(lte|lt|gte|gt|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = model.find(JSON.parse(queryStr));

  // Chaining operations to the query
  // Select
  if (req.query.select) {
    let selectFields = req.query.select.split(",").join(" ");
    query = query.select(selectFields);
  }

  // Sort
  if (req.query.sortBy) {
    let sortedFields = req.query.sortBy.split(",").join(" ");
    query = query.sort(sortedFields);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Populate
  if (populate) {
    query = query.populate(populate);
  }

  // Executing the query
  const results = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0 && endIndex <= total) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
