// pages/custom/getInvoice/getInvoice.js
/**
 * @param array 单位列表  被'picker'组件的range属性使用，在agencyByCity函数中赋值
 * @param index 单位列表  被'picker'组件的value属性使用，在bindPickerChange函数中赋值
 * @param city 当前选择城市 在onLoad函数中赋值
 * @param historyCitys 历史访问城市缓存数组  在cityStorage函数中赋值
 * @param queryHistoryStorage 历史查询记录缓存数组  在getQueryHistoryStorage函数中赋值
 */
var QQMapWX = require('../../../assests/libs/qqmap-wx-jssdk.min.js');
var queryPages = require('../../../common/js/queryPages.js');
var global = getApp().globalData;
var util = require('../../../common/js/util.js')
import {
  commons
} from '../../../common/js/commons.js'
Page({
  data: {
    index: 0,
    //请求查票接口的参数
    parametersh: {
      name: '',
      card_no: '',
      microProgramPage: '',
      company: '',
    },
    //查票按钮禁用
    btnDisable: false,
    //查票按钮显示加载状态
    btnLoading: false,
    contentHidden: true, //填写 内容是都显示
    abnorShow: true, //空白图是否显示
    microProgramPage: '',
    checkBtnText: '查找电子票', //按钮文字
    callNum: 0, //查找电子票调用次数
    isEditID: false, //id input是否可以编辑

  },
  onLoad: function (options) {
    var that = this

      that.loginByIdentityToken()
      that.setData({
        "parametersh.company": global.custom.agencyName,
        "parametersh.agencyCode": global.custom.agencyCode,
        "parametersh.microProgramPage": global.custom.page,
        microProgramPage: global.custom.page,
        contentHidden: false, //填写 内容是都显示
        abnorShow: false, //空白图是否显示
      })


  },
  onShow: function (options) {
    var that = this
    commons.getStorage('userPhone').then(res => {
      that.setData({
        userPhone: res.data,
      })
      if (that.data.microProgramPage == 'hospital_phone') {
        that.setData({
          'parametersh.card_no': res.data,
        })
      }
    })
    commons.getStorage('loginInfoKey')
      .then(res => {
        if (res.data.userInfo.name) {
          that.setData({
            'parametersh.name': res.data.userInfo.name,
          })
        }
      })

  },


  loginByIdentityToken: function () {
    var that = this
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
      .then(res => {
        wx.hideToast();
        // console.log(res)
        if (res.data.resultCode == '-1') {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
        if (res.data.resultCode == '2002') {
          wx.hideToast();
          that.setData({
            $toast: {
              show: false
            }
          })
          wx.removeStorage({ key: 'identityToken', })
          wx.removeStorage({ key: 'loginInfoKey', })
          wx.removeStorage({ key: 'userPhone', })
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }
        if (res.data.resultCode == '0000') {
          that.getQueryHistoryStorage()
        }
      })
      .catch(res => {

        wx.hideToast();
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

  //socialCardInput输入事件监听
  socialCardInput: function (e) {
    var that = this
    that.setData({
      'parametersh.card_no': e.detail.value,
    })
  },

  nameInput: function (e) {
    var that = this
    that.setData({
      'parametersh.name': e.detail.value,
    })
  },
  //'查找电子票'按钮点击事件
  checkTap: function () {
    var that = this
    var parameters = that.data.parametersh

    //判断用户是否输入用户名和密码
    if (parameters.name.length == 0) {
      that.setData({
        toast: '请输入姓名'
      })
      util.showToast(that)
    } else if (parameters.card_no.length == 0) {
      that.setData({
        toast: '请输入用户编号'
      })
      util.showToast(that)
    } else {
      that.setData({
        btnDisable: true,
        btnLoading: true,
        checkBtnText: '正在接收票据中，请稍等...'
      })
      that.queryEleInvoice()
    }

  },
  //查找电子票axjx
  queryEleInvoice: function () {
    var that = this
    var parameters = that.data.parametersh
    commons.loginRequest(global.queryEInvocieList_url, parameters, 'GET')
      .then(res => {
        // console.log(res)
        var result = res.data
        if (result.resultCode == '-1') {
          that.setData({
            toast: result.message
          })
          util.showToast(that)
          that.setData({
            btnDisable: false,
            btnLoading: false,
            checkBtnText: '查找电子票',
            callNum: 0
          })
        } else if (result.resultCode == '5001') {
          that.setData({
            toast: result.message
          })
          util.showToast(that)
          that.setData({
            btnDisable: false,
            btnLoading: false,
            checkBtnText: '查找电子票',
            callNum: 0
          })
        } else if (result.resultCode == '5002') {

          if (that.data.callNum == 3) {
            that.setData({
              toast: '电子票据未接收完成,请稍后重试'
            })
            util.showToast(that)
            that.setData({
              btnDisable: false,
              btnLoading: false,
              checkBtnText: '查找电子票',
              callNum: 0
            })
          } else {
            setTimeout(function () {
              that.queryEleInvoice()
            }, 3000)

            that.setData({
              callNum: that.data.callNum + 1
            })
          }

        } else if (result.resultCode == '0000') {
          that.setData({
            btnDisable: false,
            btnLoading: false,
            checkBtnText: '查找电子票',
            callNum: 0
          })
          wx.navigateTo({
            url: '/pages/getInvoiceSuccess/getInvoiceSuccess?num=' + res.data.num + '&agencyName=' + parameters.company,
          })

        } else if (res.data.resultCode == '2002') {
          wx.removeStorage({ key: 'identityToken', })
          wx.removeStorage({ key: 'loginInfoKey', })
          wx.removeStorage({ key: 'userPhone', })
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }

      }).catch(res => {
        that.setData({
          btnDisable: false,
          btnLoading: false,
          checkBtnText: '查找电子票',
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
        } else if (res.errMsg == "nologin") {
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }
      })
  },

  onPullDownRefresh() {
    this.loginByIdentityToken()
    wx.showLoading({
      title: '加载中...',
    })
  }
})