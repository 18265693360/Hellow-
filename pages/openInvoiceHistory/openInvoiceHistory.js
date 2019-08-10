// pages/openInvoiceHistory/openInvoiceHistory.js
import { commons } from '../../common/js/commons.js'
var time = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    datas:[],
    abnorShow:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.isLoginState()
    wx.showNavigationBarLoading()//在标题栏中显示加载
    wx.showLoading({
      title: '加载中...',
    })

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
   this.getinit()
  },

  getinit(){
    var that = this
    commons.loginRequest(getApp().globalData.invoiceHistory_url, {}, 'POST')
      .then((res) => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        console.log(res)
        var data = res.data || {}
        if (data.resultCode == '0000') {
          if (data.data.length < 1) {
            return
          }
          for (var i in data.data) {
            data.data[i].requestTime = time.formatTimeTwo(data.data[i].requestTime, 'Y-M-D h:m:s')
            switch (data.data[i].issueInvoiceStatus) {
              case '0':
                {
                  data.data[i].issueInvoiceStatus = '开票中'
                  break;
                }
              case '1':
                {
                  data.data[i].issueInvoiceStatus = '已开票'
                  break;
                }
              case '2':
                {
                  data.data[i].issueInvoiceStatus = '开票失败'
                  break;
                }
            }
          }

          that.setData({
            datas: data.data,
            abnorShow: false
          })
        } else {
          wx.showToast({
            icon:'none',
            title: data.message,
            duration: 2000,
          })
        }

      }).catch(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
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
    this.getinit()
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
  jumpPage:function(e){
    console.log(e.currentTarget.id)
    wx.navigateTo({
      url: '../historyInvoiceDetail/historyInvoiceDetail?serialNumber=' + e.currentTarget.id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function () {
    commons.loginRequest(getApp().globalData.loginOrRegistByToken_url, {}, 'POST')
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

})