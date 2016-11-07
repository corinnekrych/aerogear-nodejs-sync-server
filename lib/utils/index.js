module.exports = {
  poorMansCopy: function (obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};
