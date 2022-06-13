module.exports = {
  ifCond: function (a, b, options) {
    return String(a) === String(b) ? options.fn(this) : options.inverse(this)
  }
}
