// pages/getInvoiceSuccess/getInvoiceSuccess.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    isShow:false,
    isBack:true,
    agencyName:'',
    title:'保存成功'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.setNavigationBarTitle({
      title: '保存成功',
    })
    if (options.num){
      that.setData({
        num: options.num,
        isShow:true,
        title: '取票成功'
      })
      wx.setNavigationBarTitle({
        title: '取票成功',
      })
    }
    if(options.agencyName){ //说明是从单位定制的自助取票页面跳转的
      that.setData({
        agencyName: options.agencyName,
      })
    }


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
    if(this.data.isShow && this.data.isBack){
      wx.navigateBack({
        
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
  checkTaps: function () {
    this.setData({
      isBack:false
    })
    if(this.data.agencyName){
      wx.navigateTo({
        url: '/pages/custom/myWallet/myWallet?custom=1',
      })
    }else{
      wx.switchTab({
        url: '/pages/eInvoiceWallet/eInvoiceWallet',
      })
    }
   
  }
})