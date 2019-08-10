// pages/admin/privateInfo/privateInfo.js
var global = getApp().globalData;
import { commons } from '../../../common/js/commons.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    datas:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showNavigationBarLoading()
    this.getUserInfomation()
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
  getUserInfomation(){
    commons.loginRequest(global.lookUserInfo_url, {}, 'POST')
    .then((res) => {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      if (res.data.resultCode == '0000') {
        var sid = res.data.data[0].idCard.substring(0, 3) + '***********' + res.data.data[0].idCard.substring(14);
        this.setData({
          datas: res.data.data[0],
          "datas.idCard": sid
        })
      } else if (res.data.resultCode == '-1') {
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.resultCode == '2002') {
        wx.removeStorage({
          key: 'identityToken',
        })
        wx.removeStorage({
          key: 'loginInfoKey',
        })
        wx.removeStorage({
          key: 'userPhone',
        })
        wx.navigateTo({
          url: '/pages/firstPage/firstPage',
        })
      }
    }).catch(res=>{
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      if (res.errMsg == "request:fail 请求超时") {
        wx.showModal({
          title: '提示',
          content: global.overTime,
          showCancel: false
        })
        return
      } else if (res.errMsg.substring(0, 12) == "request:fail") {
        wx.showModal({
          title: '提示',
          content: global.nowork,
          showCancel: false
        })
      } else if (res.errMsg == 'nologin'){
        wx.navigateTo({
          url: '/pages/firstPage/firstPage',
        })
      }
    })
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
  jumpReal:function(){
    wx.navigateTo({
      url: '../realNameAuth/realNameAuth',
    })
  },
  onPullDownRefresh() {
    this.getUserInfomation()
    wx.showLoading({
      title: '加载中...',
    })
  },
})