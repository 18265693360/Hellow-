// pages/QRCode/QRCode.js
import { commons } from '../../../common/js/commons.js'
var util = require('../../../common/js/util.js')
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcodeUrl:'',
    code:'',
    aoumt:'',
    count:'',
    toast:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.formId) {
      this.setData({
        formId: options.formId,
        uniqueCode: options.uniqueCode,
        agencyCode: options.agencyCode,
        aoumt: options.aoumt,
        count: options.count

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
    this.logins()
    
  },
  logins: function () {
    var that = this
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求    
          that.setData({
            code: res.code
          })
          that.getQRCode()
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: function (res) {
        if (res.errMsg == "request:fail ") {
          wx.showModal({
            title: '提示',
            content: global.overTime,
            showCancel: false
          })
        } else if (res.errMsg == "request:fail 请求超时") {
          wx.showModal({
            title: '提示',
            content: global.nowork,
            showCancel: false
          })
        }

      }
    });
  },
  getQRCode: function () {
    var that = this
    commons.loginRequest(global.getPaymentQRCode_url,
      {
        wxJsCode: this.data.code,
        formId: this.data.formId,
        type: 2,
        agencyCode: this.data.agencyCode ,
        uniqueCode: this.data.uniqueCode,
        voucherNumber:'',
        client:1
      }, 'POST')
      .then(res => {
        console.log(res)
        if(res.data.resultCode == '0000'){
         
          that.setData({
            qrcodeUrl: res.data.data[0]
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
            toast:res.data.message
          })
          util.showToast(this)
        }
        
      }).catch(res => {

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