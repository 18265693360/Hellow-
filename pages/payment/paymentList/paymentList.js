// pages/paymentList/paymentList.js
import {
  commons
} from '../../../common/js/commons.js'
var util = require('../../../common/js/util.js')
var util = require('../../../common/js/util.js')
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    agencyName: '',
    pageNum: 1,
    dataList: [],
    abnorShow: 'hide',
    isLoadmore: false,
    $toast: {
      show: false
    },
    circleShow: false,
    isclear: false,
    tapSendOther: true,
    buttonClicked: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    wx.showLoading({
      title: '加载中...',
    })
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
    this.setData({
      pageNum: 1
    })
    this.isLoginState()
    

  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function() {
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
          this.getPaymentList(this.data.agencyName, this.data.pageNum)
        }

      }).catch(res => {
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
        } else if (res.errMsg == 'nologin') {
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }
      })

  },
  getPaymentList: function(agencyName, pageNums) {
    commons.loginRequest(global.paymentList_url, {
        inHospitalDate: agencyName,
        page: pageNums,
        voucherStatus: 1,
        showAll: '0'
      }, 'POST')
      .then(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.data.resultCode == '0000') {
          if (this.data.pageNum == 1 && res.data.data[0].resultVOList.length < 1) {
            this.setData({
              abnorShow: 'show',
              dataList: [],
              tapSendOther: false,
              isLoadmore:false,
            })
          } else if (this.data.pageNum == 1) {
            this.data.dataList = []
            this.setData({
              dataList: res.data.data[0].resultVOList,
              abnorShow: 'hide',
              tapSendOther:true
            })
            if (res.data.data[0].totalPage == this.data.pageNum) {
              this.setData({
                isLoadmore: true
              })
            } else {
              this.setData({
                isLoadmore: false
              })
            }
          } else {
            if (res.data.data[0].totalPage == this.data.pageNum) {
              this.setData({
                isLoadmore: true
              })
            } else {
              this.setData({
                isLoadmore: false
              })
            }
            this.setData({
              dataList: this.data.dataList.concat(res.data.data[0].resultVOList),
              abnorShow: 'hide',
              toast: res.data.message
            })
            util.showToast(this)
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
          that.setData({
            toast: res.data.message,
            tapSendOther:false
          })
          util.showToast(this)
        }

      }).catch(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
  },
  getAgainPaymentList: function() {
    var that = this
    commons.loginRequest(global.againPaymentList, {}, 'POST')
      .then(res => {

        if (res.data.resultCode == '0000') {
          wx.showLoading({
            title:'预交金票据导入中',
          })
          setTimeout(function() {
            wx.hideLoading()
            that.clearDate()
          }, 1000)
          

        } else {
          that.setData({
            toast: res.data.message
          })
          util.showToast(this)
        }

      }).catch(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
  },
  blankTap(e) {
    if (e.detail.value.length < 1) {
      this.setData({
        agencyName: ''
      })
      this.setData({
        pageNum:1
      })
      this.getPaymentList('', this.data.pageNum);
    }
  },
  searchAgency(e) {
    // console.log('confirm: ', e.detail.value)
    this.setData({
      agencyName: e.detail.value,
      pageNum:1
    })
    this.getPaymentList(e.detail.value, this.data.pageNum);
  },
  //发送给他人
  sendOther: function() {
    util.buttonClicked(this, 'buttonClicked')
    //隐藏 发送给他人按钮
    wx.navigateTo({
      url: '/pages/payment/paymentLists/paymentLists',
    })

  },
  jumpDetail: function(e) {
    var item = this.data.dataList[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '/pages/payment/paymentDetail/paymentDetail?id=' + e.currentTarget.dataset.id + '&agencyCode=' + item.agencyCode + '&uniqueCode=' + item.uniqueCode + '&voucherNumber=' + item.list[e.currentTarget.dataset.idx].voucherNumber,
    })
  },
  jumpQRCode: function(e) {

    console.log(e);
    var item = e.target.dataset.all
    wx.navigateTo({
      url: '/pages/payment/QRCode/QRCode?formId=' + e.detail.formId + '&agencyCode=' + item.agencyCode + '&uniqueCode=' + item.uniqueCode + '&count=' + item.count + '&aoumt=' + item.aoumt,
    })
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
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      pageNum: 1
    })
    this.getPaymentList(this.data.agencyName, this.data.pageNum)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {


    if (!this.data.isLoadmore) {
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getPaymentList(this.data.agencyName, this.data.pageNum)
    }


  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  tapDayTap(e) {
    var that = this
    var year = e.detail.year + ''
    var month = e.detail.month + ''
    var day = e.detail.day + ''
    if (month.length == 1) {
      month = '0' + month
    }
    that.setData({
      curYear: e.detail.year,
      curMonth: e.detail.month,
      curDate: e.detail.day,
      agencyName: year + '-' + month + '-' + day,
      isclear: true,
      pageNum: 1
    })
    that.getPaymentList(that.data.agencyName, that.data.pageNum);
  },
  clearDate: function() {
    this.setData({
      agencyName: '',
      isclear: false,
      pageNum: 1
    })
    this.getPaymentList(this.data.agencyName, this.data.pageNum);
  }

})