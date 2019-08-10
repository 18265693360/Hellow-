// pages/firstPage/firstPage.js
var util = require('../../common/js/util.js')
var { commons } = require('../../common/js/commons.js')
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:'',
    isDisable:false,
    isLoading:false,
    toast: '',
    $toast: {
      show: false
    },
    goback:'',
    index:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.login() 
    if(options.index){
      that.setData({
        index:options.index
      })
    }
  },
  login:function(){
    var that = this
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求    
          that.setData({
            code: res.code
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail:function(res){
        if (res.errMsg == "request:fail ") {
          wx.showModal({
            title: '提示',
            content: global.overTime,
            showCancel: false
          })
        } else if (res.errMsg == "request:fail 请求超时") {
          wx.showModal({
            title: '提示',
            content: global.nowork,
            showCancel: false
          })
        }
        
      }
    });
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
    var that= this
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // if(this.data.index == 'index'){

    // }else if(this.data.goback != 'back'){
    //   wx.switchTab({
    //     url: "/pages/home/home",
    //   })
    // }
  },

  jumpAgreement:function(){
  
    wx.navigateTo({
      url: '../admin/agreement/agreement',
    })
  },
  jumpRegiste:function(){
    wx.navigateTo({
      url: '../admin/login/login?index='+this.data.index,
    })
  },
  /**
    * 自动获取手机号登录
    */
  getPhoneNumber(e) {
    var that = this
    var iv = e.detail.iv
    that.setData({
      isDisable: true,
      isLoading: true
    })
   
    var encryptedData = e.detail.encryptedData
    if (e.detail.encryptedData) {

      return commons.pRequest(global.loginOrRegist_url, {
        encryptedData: encryptedData,
        iv: iv,
        jsCode: that.data.code,
      }, 'POST')
        .then(res => {
          that.setData({
            isDisable: false,
            isLoading: false
          })
          // console.log(res)
          that.judgeStatus(res)
        }).catch(res=>{
          that.setData({
            isDisable: false,
            isLoading: false
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
          }
        })

    } else {
      that.setData({
        isDisable: false,
        isLoading: false
      })
    }
  },
  /**
  * 判断登陆状态，并修改界面显示
  */
  judgeStatus(res) {
    var that = this
    if (res.data.resultCode == '-1' || res.data.resultCode == '2003') {
      that.setData({
        toast: res.data.message
      })
      util.showToast(that)
      that.login()
      
    }  else if(res.data.resultCode == '0000')  {
    
      commons.putStorage('identityToken', res.data.data[0].identityToken)
      commons.putStorage('loginInfoKey', res.data.data[0])
      commons.putStorage('userPhone', res.data.data[0].userInfo.phone)
      
      that.setData({
        goback:'back'
      })
      wx.navigateBack({

      })
      // wx.switchTab({
      //   url: "/pages/home/home",
      // })
    }
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  }
})