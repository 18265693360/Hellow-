// pages/custom/customIndex/cusomIndex.js
var global = getApp().globalData;
var util = require('../../common/js/util.js')
import {
  commons
} from '../../common/js/commons.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:0,
    userPhone:'未登录',
    loginText:'登录',
    logoUrl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    
    if (options.agencyCode) {
      global.custom.agencyCode = options.agencyCode
     
      that.isLoginState()
      
    } 
    
  },
  onShow: function () {
    var that = this
    
    commons.getStorage('userPhone').then(res => {
      that.setData({
        userPhone: res.data,
        loginText: '退出'
      })
      if (that.data.microProgramPage == 'hospital_phone') {
        that.setData({
          'parametersh.card_no': res.data,
          'storageData.card_no': res.data,
        })
      }
     
      that.getLogo()
      that.codeForAgencyName()
      that.bindCustom()
    })
  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function () {
    var that = this
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
      .then(res => {
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideLoading()
        if (res.data.resultCode == '2002') {
          that.setData({
            loginText: '登录',
            userPhone: '未登录'
          })
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
        if (res.data.resultCode == '0000') {
          that.setData({
            loginText: '退出'
          })
          switch (that.data.item) {
            case 1: {
              wx.navigateTo({
                url: '/pages/custom/getInvoice/getInvoice',
              })
              break;
            }
            case 2: {
              wx.navigateTo({
                url: '/pages/custom/myWallet/myWallet',
              })
              break;
            }
            case 3: {
              wx.navigateTo({
                url: '/pages/admin/sendRecord/sendRecord?agencyId=' + global.custom.agencyCode,
              })
              break;
            }
          }
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
        }
        wx.hideLoading()
        wx.stopPullDownRefresh() //停止下拉刷新
        if (res.errMsg == 'nologin') {
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }
      })


  },

 
  //定制单位的图片
  getLogo(){
    var that = this
    commons.pRequest(global.custom_imageLogo_url, {
      agencyId: global.custom.agencyCode,
    }, 'GET').then(res=>{

        if(res.data.resultCode == '0000'){
          that.setData({
            logoUrl:res.data.data[0].logoPng,
          })
          global.custom.tips = res.data.data[0].tips || ''
        }
     
    }).catch(res=>{
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
  bindCustom(){
    commons.loginRequest(global.custom_bindCustomCompany_url, {
      agencyId: global.custom.agencyCode,
    }, 'POST').then(res => {
      if (res.data.resultCode == '0000') {

      }
    }).catch(res => {

    })
  },
  //根据城市编码去过去 城市名称 等信息
  codeForAgencyName: function () {
    var that = this
    commons.pRequest(global.queryCompanysByAgencyId_url, {
      agencyId: global.custom.agencyCode,
    }, 'GET')
      .then(res => {
        var data = res.data
        if (data.resultCode == '0000') {
            global.custom.agencyName = data.data[0].agencyName || ''
            global.custom.page = data.data[0].microProgramPage || ''
          wx.setNavigationBarTitle({
            title: global.custom.agencyName,
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
        }
      })
  },
  loginOrQuiet(){
    var that = this
    if(that.data.loginText === '退出'){
      wx.showLoading({
        title: '请稍后...',
      })
      commons.loginRequest(global.logout_url, {}, 'GET')
        .then(res => {
          wx.hideLoading()
          util.hideDialog(that)
          if (res.data.resultCode == '0000') {

            wx.removeStorage({
              key: 'identityToken',
            })
            wx.removeStorage({
              key: 'loginInfoKey',
            })
            wx.removeStorage({
              key: 'userPhone',
            })

            that.setData({
             loginText:'登录',
             userPhone:'未登录'
            })
            wx.showToast({
              title: '退出成功',
            })

          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        })
    }else{
      wx.navigateTo({
        url: '/pages/firstPage/firstPage?index=index',
      })
    }
  },
  jumpGetInvoice(){
    this.data.item = 1
    this.isLoginState()
   
  },
  jumpMyWallet(){
    this.data.item = 2
    this.isLoginState()
    
  },
  jumpSend(){
    this.data.item = 3
    this.isLoginState()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  

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