var global = getApp().globalData;
var util = require('../../../common/js/util.js');
import { commons } from '../../../common/js/commons.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameters: {
      phone: '',
      verifyCode: '',
    },
    isShow: false,
    sec: 60,
    //提示框信息
    toast: '',
    $toast: {
      show: false
    },

    btnLoading: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if(options.index){
      that.setData({
        index:options.index
      })
    }
  },
  /**
   * 下一步按钮触发事件
   */
  nextTap: function () {
    var that = this
    var parameters = that.data.parameters
    var phone = that.data.parameters.phone
    var verifyCode = that.data.parameters.verifyCode
    var phoneReg = /^(13[0-9]|14[1|5|6|7|9]|15[0|1|2|3|5|6|7|8|9]|16[2|5|6|7]|17[0|1|2|3|5|6|7|8]|18[0-9]|19[1|8|9])\d{8}$/
    if (phone.length == 0) {
      that.setData({
        toast: '请输入手机号'
      })
      util.showToast(that)
    } else if (!phoneReg.test(phone)) {
      that.setData({
        toast: '请输入正确手机号'
      })
      util.showToast(that)
    }else if (verifyCode.length == 0) {
      that.setData({
        toast: '请输入验证码'
      })
      util.showToast(that)
    } else if (verifyCode.length != 4) {
      that.setData({
        toast: '请输入正确验证码'
      })
      util.showToast(that)
    } else {
      that.setData({
        btnDisable: true,
        btnLoading: true,
      })
      commons.pRequest(global.loginOrRegistByPhone_url, {
        phone: phone,
        verifyCode: verifyCode,
      }, 'POST')
        .then(result=>{
          // console.log(result)
          that.loginOrRegist_success(result)
        }).catch(res=>{
          that.setData({
            btnDisable: false,
            btnLoading: false,
          })
          if (res.errMsg  == "request:fail 请求超时") {
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
    }
  },
 
  loginOrRegist_success: function (res) {
    var that = this
    that.setData({
      btnDisable: false,
      btnLoading: false,
    })
    // console.log(res.data)
    if (res.data.resultCode =='-1'){
      that.setData({
        toast: res.data.message
      })
      util.showToast(that)
    }else{
      commons.putStorage('identityToken', res.data.data[0].identityToken)
      commons.putStorage('loginInfoKey', res.data.data[0])
      commons.putStorage('userPhone', res.data.data[0].userInfo.phone)
      if(that.data.index == 'index'){
        wx.navigateBack({
          delta:2
        })
      }else{
        wx.switchTab({
          url: '../../home/home',
        })
      }
    
     
    } 
    
   
  },
  /**
   * 电话号码输入框监听
   */
  phoneInput: function (e) {
    var that = this
    that.setData({
      'parameters.phone': e.detail.value
    })
  },
  /**
   * 验证码输入框监听
   */
  verifyCodeInput: function (e) {
    var that = this
    that.setData({
      'parameters.verifyCode': e.detail.value
    })
  },
  /**
   * 获取验证码按钮触发事件
   */
  getCode: function () {
    var that = this;
    var parameters = that.data.parameters
    var phone = that.data.parameters.phone
    var time = that.data.sec
    var phoneReg = /^(13[0-9]|14[1|5|6|7|9]|15[0|1|2|3|5|6|7|8|9]|16[2|5|6|7]|17[0|1|2|3|5|6|7|8]|18[0-9]|19[1|8|9])\d{8}$/
    if (phone.length == 0) {
      that.setData({
        toast: '请输入手机号'
      })
      util.showToast(that)
    }else if (!phoneReg.test(phone)) {
      that.setData({
        toast: '请输入正确手机号'
      })
      util.showToast(that)
    } else {
      that.setData({
        isShow: true                    //按钮1隐藏，按钮2显示
      })
      var remain = 60;             //用另外一个变量来操作秒数是为了保存最初定义的倒计时秒数，就不用在计时完之后再手动设置秒数
      var Times = setInterval(function () {
        if (remain == 1) {
          clearInterval(Times);
          that.setData({
            sec: 60,
            isShow: false
          })
          return false      //必须有
        }
        remain--;
        that.setData({
          sec: remain
        })
      }, 1000)
      commons.pRequest(global.sendNewPhoneMsg_url, {
        phone: phone,
      }, 'GET').then(res => {
          // console.log(res)
          if(res.data.resultCode == '-1'){
            that.setData({
              toast: res.data.message
            })
            util.showToast(that)
            clearInterval(Times);
            that.setData({
              sec: 60,
              isShow: false,
             
            })
          }
          if(res.data.resultCode == '0000'){
            that.setData({
              btnDisable: false
            })
          }

        }).catch(res=>{
          clearInterval(Times);
          that.setData({
            sec: 60,
            isShow: false
          })
          if (res.errMsg  == "request:fail 请求超时") {
            wx.showModal({
              title: '提示',
              content: global.overTime,
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
    }
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  }
})