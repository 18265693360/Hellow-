// pages/admin/realNameAuthT/realNameAuthT.js
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
    noName: '',
    noId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.isLoginState()
    if (options) {
      that.setData({
        noName: options.name,
        noId: options.id
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.isLoginState()
    wx.showLoading({
      title: '加载中...',
    })
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
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function () {
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
        } else if (res.errMsg == "request:fail ") {
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
  bindName: function (e) {
    var that = this
    that.setData({
      noName: e.detail.value,
    })
  },
  bindNo: function (e) {
    var that = this
    that.setData({
      noId: e.detail.value,
    })
  },
  checkTap: function () {
    var that = this
    var data = that.data
    var negx = /^\d{17}[A-Z0-9]{1}$/
    // if (data.noName.length < 1) {
    //   wx.showToast({
    //     title: '请输入真实姓名',
    //     icon: 'none'
    //   })
    //   return
    // }
    // if (!negx.test(data.noId)) {
    //   wx.showToast({
    //     title: '请输入身份证号',
    //     icon: 'none'
    //   })
    //   return
    // }
    that.setData({
      btnLoading: true
    })
    var datas = {}
    wx.getStorage({
      key: 'loginInfoKey',
      success: function (ress) {
        datas = ress.data
        commons.loginRequest(global.bindID_url, {
          name: data.noName,
          idcard: data.noId
        }, 'POST')
          .then(res => {
            var data = res.data
            that.setData({
              btnLoading: false
            })
            if (data.resultCode == '0000') {

              datas.userInfo.idCard = that.data.noId
              datas.userInfo.name = that.data.noName
              commons.putStorage('loginInfoKey', datas)
              wx.navigateTo({
                url: '/pages/admin/authSuccess/authSuccess',
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
    })




  },
  ocr: function () {
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
              that.setData({
                noId: data.data[0].id,
                noName: data.data[0].name
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
          }
        })
      }
    })
  },

})