// pages/payment/refundDetail/refundDetail.js
import { commons } from '../../../common/js/commons.js'
var util = require('../../../common/js/util.js')
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList:{},
    qrcodeUrl:'',
    $toast: {
      show: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.id){
      this.setData({
        id:options.id
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
    this.getDetail()
  },
  getDetail: function () {
    commons.loginRequest(global.paymentProof_url,
      {
        id: this.data.id
      }, 'POST')
      .then(res => {
        console.log(res.data)
        if (res.data.resultCode == '0000') {
          var li = res.data.data[0]
          switch (li.voucherStatus) {
            case '2':
              {
                li.voucherStatus = '已结算'
                break;
              }
            case '3':
              {
                li.voucherStatus = '已退费'
                break;
              }
            case '4':
              {
                li.voucherStatus = '已作废'
                break;
              }
          }
          this.setData({
            qrcodeUrl: res.data.data[0].image,
            dataList: res.data.data[0]
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
            url: '../firstPage/firstPage',
          })
        }else{
           this.setData({
             toast: res.data.message
           })
           util.showToast(this)
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
        } else if (res.errMsg == 'nologin') {
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