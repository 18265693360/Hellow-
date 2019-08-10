// pages/admin/sendRecord/sendRecord.js
var global = getApp().globalData;
var util = require('../../../common/js/util.js');
import {
  commons
} from '../../../common/js/commons.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchInputValue:'',
    pageNum:1,
    dataList:[],
    isLoadmore:false,
    abnorShow: 'hide',
    phone:'',
    toast: '',
    $toast: {
      show: false
    },
    agencyId:''//单位识别码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.agencyId){
      this.setData({
        agencyId:options.agencyId
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
    this.getPaymentList(this.data.searchInputValue,this.data.pageNum,this.data.agencyId)
  },
  searchN(e) {
    var that = this
    that.setData({
      searchInputValue: e.detail.value.replace(/\s+/g, '')
    })
  },
  searchD() {
    var that = this
    that.data.pageNum = 1
    that.getPaymentList(that.data.searchInputValue,that.data.pageNum,that.data.agencyId)
  },
  getPaymentList: function (phone, pageNums, agencyId) {
    commons.loginRequest(global.sendRecord_url, {
      sharePhone:phone,
      pageNumber: pageNums,
      agencyId: agencyId
    }, 'POST')
      .then(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.data.resultCode == '0000') {
          if (pageNums == 1 && res.data.data[0].resultVOList.length < 1) {
            this.setData({
              abnorShow: 'show',
              dataList: [],
              isLoadmore: false,
            })
          } else if (pageNums == 1) {
            this.data.dataList = []
            var datal = res.data.data[0].resultVOList
          
            this.setData({
              dataList: res.data.data[0].resultVOList,
              abnorShow: 'hide',
            })
            if (res.data.data[0].totalPage == pageNums) {
              this.setData({
                isLoadmore: true
              })
            } else {
              this.setData({
                isLoadmore: false
              })
            }
          } else {
            if (res.data.data[0].totalPage == pageNums) {
              this.setData({
                isLoadmore: true
              })
            } else {
              this.setData({
                isLoadmore: false
              })
            }
            var datal = res.data.data[0].resultVOList
         
            this.setData({
              dataList: this.data.dataList.concat(res.data.data[0].resultVOList),
              abnorShow: 'hide',
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
        } else {
          this.setData({
            toast: res.data.message,
        
          })
          util.showToast(this)
        }

      }).catch(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
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
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      pageNum: 1
    })
    this.getPaymentList(this.data.searchInputValue, this.data.pageNum, this.data.agencyId)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isLoadmore) {
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getPaymentList(this.data.searchInputValue, this.data.pageNum, this.data.agencyId)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})