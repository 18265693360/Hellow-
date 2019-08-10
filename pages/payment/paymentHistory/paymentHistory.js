// pages/paymentHistory/paymentHistory.js
import { commons } from '../../../common/js/commons.js'
var util = require('../../../common/js/util.js')
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,
    dataList: [],
    abnorShow: 'hide',
    isLoadmore: false,
    toast:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.isLoginState()
    wx.showNavigationBarLoading() //在标题栏中显示加载
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
    this.getPaymentList(1)
    this.setData({
      pageNum: 1
    })
  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function () {
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        if (res.data.resultCode == '2002') {
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
        } else {
          
        }

      }).catch(res => {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        wx.navigateTo({
          url: '../firstPage/firstPage',
        })
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
  getPaymentList: function (pageNum) {
    commons.loginRequest(global.paymentList_url,
      {
        agencyName: '',
        page: pageNum,
        voucherStatus: 2

      }, 'POST')
      .then(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.data.resultCode == '0000') {
          for (var i=0;i<res.data.data.length;i++){
            var item = res.data.data
            if(item.length != 0){

              for(var j=0;j<item[i].list.length;j++){
                switch (item[i].list[j].voucherStatus){
                  case '2':
                    {
                      item[i].list[j].voucherStatus = '已结算'
                      item[i].list[j].style = 'blueC'
                      break;
                    }
                  case '3':
                    {
                      item[i].list[j].voucherStatus = '已退费'
                      item[i].list[j].style = ''
                      break;
                    }
                  case '4':
                    {
                      item[i].list[j].voucherStatus = '已作废'
                      item[i].list[j].style = ''
                      break;
                    }
                }
              }
            }
          }
          if (this.data.pageNum == 1 && res.data.data.length < 1) {
            this.setData({
              abnorShow: 'show',
              dataList: []
            })
          } else if (this.data.pageNum == 1) {
            this.data.dataList=[]
            this.setData({
              dataList: res.data.data,
              abnorShow: 'hide',
              isLoadmore: false
            })
          } else if (this.data.pageNum > 1 && res.data.data.length < 1) {
            this.setData({
              isLoadmore: true
            })
          } else {
            this.setData({
              dataList:this.data.dataList.concat(res.data.data),
              abnorShow: 'hide'
            })
          }
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
        }else{
          this.setData({
            toast: res.data.message
          })
          util.showToast(this)
        }
        // console.log(res.data)
      }).catch(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
  },
  jumpRefund:function(e){
   
    wx.navigateTo({
      url: '/pages/payment/refundDetail/refundDetail?id=' + e.currentTarget.dataset.id ,
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
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      pageNum: 1
    })
    this.getPaymentList(this.data.pageNum)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
    if(!this.data.isLoadmore){
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getPaymentList(this.data.pageNum)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})