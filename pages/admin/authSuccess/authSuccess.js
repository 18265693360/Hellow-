// pages/admin/authSuccess/authSuccess.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gopage:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
   
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if(this.data.gopage.length < 1){
      wx.switchTab({
        url: '/pages/admin/mine/mine',
      })
    }
   
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  checkTap:function(){
    this.setData({
      gopage: '/pages/eInvoiceWallet/eInvoiceWallet'
    })
    wx.switchTab({
      url: '/pages/eInvoiceWallet/eInvoiceWallet',
    })
  
  }
})