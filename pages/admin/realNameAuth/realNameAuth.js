// pages/admin/realNameAuth/realNameAuth.js
var global = getApp().globalData;
import {
  commons
} from '../../../common/js/commons.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnDisable: false,
    btnLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    that.isLoginState()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.isLoginState()
    wx.showLoading({
      title: '加载中...',
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function() {
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
      .then(res => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
        if (res.data.resultCode == '2002') {
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }

      }).catch(res => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
        wx.navigateTo({
          url: '/pages/firstPage/firstPage',
        })
        if (res.errMsg == "request:fail 请求超时") {
          wx.showModal({
            title: '提示',
            content: global.overTime,
            showCancel: false
          })
          return
        }else if (res.errMsg == "request:fail ") {
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

  ocr: function() {
    var that = this
    var token = ''

    commons.getStorage('identityToken')
      .then(res => {
        token = res.data
      })
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        wx.showToast({
          title: '识别中...',
          icon: 'loading',
          duration: 10000
        })
        const tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: global.ocr_url,
          filePath: tempFilePaths[0],
          name: 'idcardImg',
          formData: {
            identityToken: token
          },
          success(res) {
            wx.hideToast()
            const data = JSON.parse(res.data)
            if (data.resultCode == '0000') {
             
              wx.navigateTo({
                url: '/pages/admin/realNameAuthT/realNameAuthT?id=' + data.data[0].id + '&name=' + data.data[0].name,
              })
            } else {
              wx.showToast({
                title: '图片识别失败',
                icon: 'none'
              })
            }
          },
          fail(res) {

            wx.hideToast()
            if (res.errMsg  == "request:fail 请求超时") {
              wx.showModal({
                title: '提示',
                content:global.overTime,
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
          }
        })
      }
    })
  },

})