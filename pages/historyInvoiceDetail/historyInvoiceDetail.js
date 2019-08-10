// pages/historyInvoiceDetail/historyInvoiceDetail.js
import { commons } from '../../common/js/commons.js'
var global = getApp().globalData;
var time = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    datas:{},
    isShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.serialNumber
    })
    wx.showNavigationBarLoading()
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
    var that = this
    commons.loginRequest(getApp().globalData.invoiceHistoryDetails_url, { serialNumber: that.data.id }, 'POST').then((res) => {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      
      var data = res.data
      if (data.resultCode == '0000') {
        data.data[0].requestTime = time.formatTimeTwo(data.data[0].requestTime, 'Y-M-D h:m:s')
        switch (data.data[0].issueInvoiceStatus) {
          case '0':
            {
              data.data[0].issueInvoiceStatus = '开票中'
              break;
            }
          case '1':
            {
              data.data[0].issueInvoiceStatus = '已开票'
              that.setData({
                isShow:true
              })
              break;
            }
          case '2':
            {
              data.data[0].issueInvoiceStatus = '开票失败'
              break;
            }
          case '3':
            {
              data.data[0].issueInvoiceStatus = '已发送给他人'
              that.setData({
                isShow: false
              })
              break;
            }
        }
        that.setData({
          datas: data.data[0]
        })
      } else {
        wx.showToast({
          title: data.message,
          duration: 2000,
        })
      }

    }).catch(res=>{
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
  jumpP(){
    var that = this
    if(that.data.isShow){
      var result = that.data.datas
      if (result.eInvoiceType == '0') {
        //财票
        wx.navigateTo({
          url: global.PAGE_EINVOICEDETAIL + '?eInvoiceCode=' + result.eInvoiceCode + '&eInvoiceNumber=' + result.eInvoiceNumber + '&randomNumber=' + result.randomNumber + '&prePage=eInvoiceWallet',
        })
      } else {
        //发票
        var data = {
          eInvoiceCode: result.eInvoiceCode,
          eInvoiceNumber: result.eInvoiceNumber,
          randomNumber: result.randomNumber,
          issueDate: result.issueDate,
        }
        var invoiceInfo = JSON.stringify(data)
        wx.navigateTo({
          url: global.PAGE_BILLDETAIL + '?invoiceInfo=' + invoiceInfo + '&prePage=eInvoiceWallet',
        })
      }
    }
    
  }
})