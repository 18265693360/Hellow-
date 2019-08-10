// pages/customCompany/customCompany.js
var util = require('../../common/js/util.js')
import {
  commons
} from '../../common/js/commons.js'
//获取应用实例
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    abnorShow:'hide',
    //下面是字母排序
    letter: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"],
    cityListId: '',
    toast: '',
    $toast: {
      show: false
    },
    allRelationComapny:[],
    searchInputValue:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '加载中...',
    })
    this.getAllRelationCompany(this.data.searchInputValue)
  },
  getAllRelationCompany(name){
    var that = this
    commons.pRequest(global.custom_relationAllCompany_url, {
      agencyName:name
    }, 'GET')
    .then(res=>{
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
      wx.hideLoading()
      if (res.data.resultCode == '0000'){
        that.setData({
          allRelationComapny: res.data.data
        })
      } else if (res.data.resultCode == '2002'){
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
          toast: res.data.message
        })
        util.showToast(that)
      }
    }).catch(res=>{
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
  //跳转到单位定制页面index
  jumpCustomIndex(e) {
    var code = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/index?agencyCode=' + code,
    })
  },
  //搜索名字 身份证号
  searchN(e) {
    var that = this
    that.setData({
      searchInputValue: e.detail.value.replace(/\s+/g, '')
    })
  },
  searchD() {
    var that = this
    
    that.getAllRelationCompany(that.data.searchInputValue)
  },
  //选中那个字母
  letterTap(e) {
    var that = this
    that.setData({
      cityListId: e.target.dataset.item
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