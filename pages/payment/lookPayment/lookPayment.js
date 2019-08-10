// pages/payment/lookPayment/lookPayment.js
var util = require('../../../common/js/util.js')
import { commons } from '../../../common/js/commons.js'
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '',
    toast:'',
    $toast: {
      show: false
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options){
      this.setData({
        voucherId: options.voucherId
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
    var that = this
  
    commons.pRequest(global.lookPayment_url, {
      voucherId: that.data.voucherId,

    }, 'POST')
      .then(res => {
        if (res.data.resultCode == '0000') {
          that.setData({
            imgUrl:res.data.data[0].image
          })
        } else {
          that.setData({
            toast: res.data.message,
          })
          util.showToast(that)
        }


      }).catch(res => {

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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

  }
})