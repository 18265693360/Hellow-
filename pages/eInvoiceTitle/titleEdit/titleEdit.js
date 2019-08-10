import { commons } from '../../../common/js/commons.js'
var util = require('../../../common/js/util.js')
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameters:{
      titleType:'0',
      taxNumber:''
    },
    partyCheck: true,
    personalCheck: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if (options.title) {
      that.setData({
        title: options.title
      })
      wx.setNavigationBarTitle({
        title: options.title
      })
    }
    if (options.result) {
      var result = JSON.parse(options.result)
      that.setData({
        parameters: result,
      })
      var titleType = result.titleType
      if (titleType == '0') {
        that.setData({
          partyCheck: true,
          personalCheck: false,
        })
      } else {
        that.setData({
          partyCheck: false,
          personalCheck: true,
        })
      }

        that.setData({
          'parameters.titleType': result.titleType,
        })

    }
  },
  partyNameInput(e) {
    var that = this
    that.setData({
      'parameters.partyName': e.detail.value.replace(/\s+/g,""),
    })
  },
  taxNumberInput(e) {
    var that = this
    that.setData({
      'parameters.taxNumber': e.detail.value.replace(/\s+/g, ""),
    })
  },
  partyAddressInput(e) {
    var that = this
    that.setData({
      'parameters.partyAddress': e.detail.value.replace(/\s+/g, ""),
    })
  },
  phoneNumberInput(e) {
    var that = this
    that.setData({
      'parameters.phoneNumber': e.detail.value.replace(/\s+/g, ""),
    })
  },
  bankOpenInput(e) {
    var that = this
    that.setData({
      'parameters.bankOpen': e.detail.value.replace(/\s+/g, ""),
    })
  },
  bankAccountInput(e) {
    var that = this
    that.setData({
      'parameters.bankAccount': e.detail.value.replace(/\s+/g, ""),
    })
  },
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e)
    var that = this
    var titleType = e.detail.value
    if (titleType == '0') {
      that.setData({
        partyCheck: true,
        personalCheck: false,
      })
    } else {
      that.setData({
        partyCheck: false,
        personalCheck: true,
      })
    }
    that.setData({
      'parameters.titleType': titleType
    })
    // console.log(that.data.parameters.titleType)
  },
  saveTap() {
    var that = this
    var parameters = that.data.parameters
    // console.log(that.data.parameters.titleType)
    var title = that.data.title
    var negx = /^[0-9A-Z]{15,20}$/
    if(parameters.titleType=='0'){
      if (!parameters.partyName || parameters.partyName == '') {
        that.setData({
          toast: '请输入票据抬头名称',
        })
        util.showToast(that)
      }else if (!parameters.taxNumber || parameters.taxNumber == ''){
        that.setData({
          toast: '请输入税号',
        })
        util.showToast(that)
      } else if (!negx.test(parameters.taxNumber)){
        that.setData({
          toast: '请输入正确税号',
        })
        util.showToast(that)
      } else {
        if (title == '添加') {
          commons.loginRequest(global.invoiceTitleAdd_url, parameters, 'POST')
            .then(res => {
              // console.log(res)
              if (res.data.resultCode == '0000') {
                
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.data.resultCode == '2002') {
                 wx.removeStorage({           key: 'identityToken',         })         
                 wx.removeStorage({           key: 'loginInfoKey',         })         
                 wx.removeStorage({           key: 'userPhone',         })
                wx.navigateTo({
                  url: '/pages/firstPage/firstPage',
                })
              }else{
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            }).catch(res=>{
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
              } else if (res.errMsg == 'nologin') {
                wx.navigateTo({
                  url: '/pages/firstPage/firstPage',
                })
              }
            })
        } else if (title == '编辑') {
          commons.loginRequest(global.invoiceTitleModify_url, parameters, 'POST')
            .then(res => {
              // console.log(res)
              if (res.data.resultCode == '0000') {

                wx.navigateBack({
                  delta: 2
                })
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
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            }).catch(res=>{
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
              else if (res.errMsg == 'nologin') {
                wx.navigateTo({
                  url: '/pages/firstPage/firstPage',
                })
              }
            })
        }
      }
    } else if (parameters.titleType == '1'){
      if (!parameters.partyName || parameters.partyName == '') {
        that.setData({
          toast: '请输入票据抬头名称',
        })
        util.showToast(that)
      } else if (parameters.taxNumber.length > 0  && !negx.test(parameters.taxNumber)){
        that.setData({
          toast: '请输入正确税号',
        })
        util.showToast(that)
      } else {
        if (title == '添加') {
          commons.loginRequest(global.invoiceTitleAdd_url, parameters, 'POST')
            .then(res => {
              // console.log(res)
              if (res.data.resultCode == '0000') {
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.data.resultCode == '2002') {
                 wx.removeStorage({           key: 'identityToken',         })         
                 wx.removeStorage({           key: 'loginInfoKey',         })         
                 wx.removeStorage({           key: 'userPhone',         })
                wx.navigateTo({
                  url: '/pages/firstPage/firstPage',
                })
              }else{
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            }).catch(res=>{
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
              } else if (res.errMsg == 'nologin') {
                wx.navigateTo({
                  url: '/pages/firstPage/firstPage',
                })
              }
            })
        } else if (title == '编辑') {
          commons.loginRequest(global.invoiceTitleModify_url, parameters, 'POST')
            .then(res => {
              // console.log(res)
              if (res.data.resultCode == '0000') {
                wx.navigateBack({
                  delta: 2
                })
              } else if (res.data.resultCode == '2002') {
                 wx.removeStorage({           key: 'identityToken',         })        
                  wx.removeStorage({           key: 'loginInfoKey',         })        
                   wx.removeStorage({           key: 'userPhone',         })
                wx.navigateTo({
                  url: '/pages/firstPage/firstPage',
                })
              }else{
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            }).catch(res=>{
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
              } else if (res.errMsg == 'nologin') {
                wx.navigateTo({
                  url: '/pages/firstPage/firstPage',
                })
              }
            })
        }
      }
    }
    

  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  }
})