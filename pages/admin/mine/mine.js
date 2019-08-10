//pages/mine/mine.js
var global = getApp().globalData;
var util = require('../../../common/js/util.js');
import {
  commons
} from '../../../common/js/commons.js'
Page({
  data: {
    parameters: {
      unionId: '',
    },
    avatarUrl: '/assests/images/icon-avatar-mine.png',
    incomplete: false,
    login: false,
    name: '',
    toast: '',
    $toast: {
      show: false
    },
    toRelatedUser: global.PAGE_TITLELIST,
    code: '',
    realText: '未认证',
    realAddress: '/pages/admin/realNameAuth/realNameAuth',
    item:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.showNavigationBarLoading()
    this.loginStatue()
    this.data.item = 0
  },
  loginStatue:function(){
    var that = this;
    wx.getStorage({
      key: 'loginInfoKey',
      success: function (res) {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        if (res.data.identityToken) {
          if (res.data.identityToken.length > 0) {
            that.setData({
              incomplete: false,
              login: true,
              isLogin: true,
              name: res.data.userInfo.phone,
            })
          }
        } else {
          that.setData({
            incomplete: false,
            login: false,
            isLogin: false,
            name: '',
          })
        }
        if (res.data.userInfo) {
          if (res.data.userInfo.idCard && res.data.userInfo.idCard != '000000000000000000') {
            that.setData({
              realText: '已认证',
              realAddress: '/pages/admin/privateInfo/privateInfo'
            })
          }
        } else {
          that.setData({
            realText: '未认证',
            realAddress: '/pages/admin/realNameAuth/realNameAuth'
          })
        }
      },
      fail: function (res) {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        that.setData({
          incomplete: false,
          login: false,
         // inlogin: true,
          isLogin: false,
          realText: '未认证',
          realAddress: '/pages/admin/realNameAuth/realNameAuth'
        })

      }
    })
  },
  getPhoneNumber: function() {
    var that = this
    wx.navigateTo({
      url: '/pages/firstPage/firstPage',
    })
  },

  /**
   * 退出登录按钮事件监听
   */
  exitLoginTap: function() {
    var that = this
    that.setData({
      dialog_phone: '',
      dialog_phone_tap: '',
      dialog_cancel: 'dialogCancelExit',
      dialog_confirm: 'dialogConfirmExit',
      dialog_title: '退出登录',
      dialog_img: '',
      dialog_img_tap: '',
      dialog_cancelText: '取消',
      dialog_confirmText: '确定',
      dialog_content: '您确定退出当前账号吗？',
    })
    util.showDialog(that)
  },
  /**
   * 退出登录dialog确定按钮事件监听
   */
  dialogConfirmExit: function() {
    var that = this
    commons.loginRequest(global.logout_url, {}, 'GET')
    .then(res=>{
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
          incomplete: false,
          login: false,
          isLogin: false,
          // toast: '退出登录成功',
          realText: '未认证',
          realAddress: '/pages/admin/realNameAuth/realNameAuth'
        })
        // util.showToast(that)
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    }).catch(res=>{
      util.hideDialog(that)
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
          content:global.nowork,
          showCancel: false
        })
      }
    })
    
      
  },
  /**
   * 退出登录dialog取消按钮事件监听
   */
  dialogCancelExit: function() {
    var that = this
    util.hideDialog(that)
  },
  jumpInfoPage: function() {
    this.data.item = 4
    this.isLoginState()
    
  },
  jumpReal: function() {
    this.data.item = 2
    this.isLoginState()
  },
  jumpHistory:function(){
    this.data.item = 3
    this.isLoginState()
  },
  jumpTitle:function(){
    this.data.item = 1
    this.isLoginState()
  },
  onPullDownRefresh() {
    var that = this
    that.loginStatue()
   
   
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
        }else{
          switch (this.data.item) {
            case 1: {
              wx.navigateTo({
                url: this.data.toRelatedUser,
              })
              break;
            }
            case 2: {
              wx.navigateTo({
                url: this.data.realAddress,
              })
              break;
            }
            case 3: {
              wx.navigateTo({
                url: '/pages/openInvoiceHistory/openInvoiceHistory',
              })
              break;
            }
            case 4:{
              wx.navigateTo({
                url: '/pages/admin/privateInfo/privateInfo',
              })
              break;
            }
          }
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