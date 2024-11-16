exports.getExampleData = (req, res) => {
  res.json({
      message: 'Hello from the example route!',
      data: { example: 'This is some example data' },
  });
};
