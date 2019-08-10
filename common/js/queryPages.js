function queryHistoryStorage(storageData) {
  var that = this
  var company = storageData.company
  wx.getStorage({
    key: 'queryHistory',
    success: function (res) {
      var flage = true
      for (let i in res.data) {
        if (res.data[i].company == company) {         
          flage = false
          res.data[i] = storageData
          wx.setStorage({
            key: 'queryHistory',
            data: res.data,
          })
        }
      }
      if (flage) {
        var data = res.data
        data.push(storageData)
        wx.setStorage({
          key: 'queryHistory',
          data: data,
        })
      }
    },
    fail: function () {
      var data = []
      data.push(storageData)
      wx.setStorage({
        key: 'queryHistory',
        data: data,
      })
    }
  })
}
module.exports.queryHistoryStorage = queryHistoryStorage
