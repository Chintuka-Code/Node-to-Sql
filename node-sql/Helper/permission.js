const splitData = (data) => {
  return data.map((res) => {
    res.permission = res.permission.split('::');
    return res;
  });
};

module.exports = splitData;
