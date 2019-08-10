var global = getApp().globalData;
var util = require('../../../common/js/util.js')
import { commons } from '../../../common/js/commons.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameters: {
      titleType:'企业单位'
    },
    ckParty: false,
    checkPersonal: false,
    partyCheck: true,
    personalCheck: false,
    titleData:{},
    companyT : [],
    priT :[],
    code:""

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showNavigationBarLoading()
    if (options.amount) {
      that.setData({
        'parameters.invoiceAmount': options.amount
      })
    }
    if(options.ids!=''){
      that.setData({
        'parameters.ids': options.ids
      })
    }
    if (options.partyName) {
      that.setData({
        'parameters.partyName': options.partyName
      })
    }
    if (options.agencyCode) {
      that.setData({
        'parameters.agencyCode': options.agencyCode
      })
    }
    that.queryTitle()
  },
  /**
   * 查询票据抬头
   */
  queryTitle() {
    var that = this
    commons.loginRequest(global.invoiceTitleQueryList_url, {}, 'GET')
      .then(res => {
        // console.log(res)
        wx.hideNavigationBarLoading()
        if(res.data.resultCode == '0000'){
          if (res.data.data.length == 0) {
            titleList: '暂无预填写的发票抬头'
          } else if (res.data.resultCode == '2002') {
            wx.removeStorage({             key: 'identityToken',           })                   
            wx.removeStorage({             key: 'loginInfoKey',           })                   
             wx.removeStorage({             key: 'userPhone',           })
            wx.navigateTo({
              url: '/pages/firstPage/firstPage',
            })
          } else if(res.data.resultCode == '0000'){
            
            var list = res.data.data
            if(list.length > 0){
              for (var i = 0; i < list.length; i++) {
                if (list[i].titleType == '0') {
                  that.data.companyT.push(list[i])
                } else {
                  that.data.priT.push(list[i])
                }
              }
              that.setData({
                titleList: that.data.companyT,
              })
            }else{
              that.setData({
                titleList: [],
              })
            }
              

            
          }
        }
        
      }).catch(res=>{
        wx.hideNavigationBarLoading()
        if (res.errMsg== "request:fail 请求超时") {
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
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e)
    var that = this
    var titleType = e.detail.value
    if (titleType == '企业单位') {
      that.setData({
        partyCheck: true,
        personalCheck: false,
        'parameters.titleName': '',
        'parameters.taxNumber': '',
        titleList:that.data.companyT
      })
    } else {
      that.setData({
        partyCheck: false,
        personalCheck: true,
        'parameters.titleName': '',
        'parameters.taxNumber': '',
        titleList:that.data.priT
      })
    }
    that.setData({
      'parameters.titleType': titleType
    })
  },
  /**
   * picker组件触发函数
   */
  bindPickerChange: function (e) {
    var that = this
    
    var titleList = that.data.titleList
    if(titleList.length > 0){
      var i = e.detail.value;

      that.setData({
        titleData: titleList[i],
        'parameters.titleName': titleList[i].partyName,
        'parameters.taxNumber': titleList[i].taxNumber,
      })
    }
    
  },

  postDetail(ress,e) {
    var that= this
    var parameters = that.data.parameters
    var partyCheck = that.data.partyCheck
    var personalCheck = that.data.personalCheck
    var titleData = that.data.titleData 
    //企业类型
    if (partyCheck) {
      if (!parameters.invoiceAmount || !parameters.taxNumber || !parameters.titleName || !parameters.titleType) {
        that.setData({
          toast: '请填写所有信息！'
        })
        util.showToast(that)
      } else {
        that.setData({
          btnLoading: true,
          btnDisable: true,
        })
        // 发起网络请求
        commons.loginRequest(global.issueVoucher_url, {
          ids: parameters.ids,
          invoiceAmount: parameters.invoiceAmount,
          taxNumber: parameters.taxNumber,
          titleName: parameters.titleName,
          titleType: parameters.titleType,
          partyName: parameters.partyName,
          agencyCode: parameters.agencyCode,
          partyAddress: titleData.partyAddress || '',
          phoneNumber: titleData.phoneNumber || '',
          bankOpen: titleData.bankOpen || '',
          bankAccount: titleData.bankAccount || '',
          wxJsCode: ress.code||"",
          formId: e.detail.formId || "",
        }, 'POST')
          .then(res => {
            that.setData({
              btnDisable: false,
              btnLoading: false,
            })
            if (res.data.resultCode == "0000") {
              wx.navigateTo({
                url: '/pages/billSuccess/billSuccess',
              })
            } else if (res.data.resultCode == '2002') {
              wx.removeStorage({             key: 'identityToken',           })                   
              wx.removeStorage({             key: 'loginInfoKey',           })                    
              wx.removeStorage({             key: 'userPhone',           })
              wx.navigateTo({
                url: '/pages/firstPage/firstPage',
              })
            } else {
              that.setData({
                toast: res.data.message
              })
              util.showToast(that)
            }
          }).catch(res => {
            that.setData({
              btnDisable: false,
              btnLoading: false,
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
      }
      //个人类型
    } else if (personalCheck) {
      if (!parameters.invoiceAmount || !parameters.titleName || !parameters.titleType) {
        that.setData({
          toast: '请填写所有信息！'
        })
        util.showToast(that)
      } else {
        that.setData({
          btnLoading: true,
          btnDisable: true,
        })
        commons.loginRequest(global.issueVoucher_url, {
          ids: parameters.ids,
          invoiceAmount: parameters.invoiceAmount,
          titleName: parameters.titleName,
          titleType: parameters.titleType,
          partyName: parameters.partyName,
          agencyCode: parameters.agencyCode,
          taxNumber: titleData.taxNumber || '',
          partyAddress: titleData.partyAddress || '',
          phoneNumber: titleData.phoneNumber || '',
          bankOpen: titleData.bankOpen || '',
          bankAccount: titleData.bankAccount || '',
          wxJsCode: ress.code || "",
          formId: e.detail.formId || "",
        }, 'POST')
          .then(res => {
            if (res.data.resultCode == "0000") {
              wx.navigateTo({
                url: '/pages/billSuccess/billSuccess',
              })
            } else if (res.data.resultCode == '2002') {
              wx.removeStorage({             key: 'identityToken',           })                   
              wx.removeStorage({             key: 'loginInfoKey',           })                    
              wx.removeStorage({             key: 'userPhone',           })
              wx.navigateTo({
                url: '/pages/firstPage/firstPage',
              })
            } else {
              that.setData({
                toast: res.data.message
              })
              util.showToast(that)
            }
            that.setData({
              btnDisable: false,
              btnLoading: false,
            })
          }).catch(res => {
            that.setData({
              btnDisable: false,
              btnLoading: false,
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
      }
    }
    
  },
  /**
   * 提交按钮事件
   */
  submissionTap(e) {
  //  console.log(e)
    var that = this
    
  
// ----------------------------------------------------------------------------------------
// wx.login获取code （wxJsCode）   点击事件加参数 e 获取 formId （formId）
    wx.login({
      success(ress) {
       that.postDetail(ress,e)
      },
      fail(err) {
        //企业类型
        that.postDetail(err,e)
      },
    })
  },
  /**
   * 发票抬头输入框
   */
  titleNameInput: function (e) {
    var that = this
    that.setData({
      'parameters.titleName': e.detail.value.replace(/\s+/g, ""),
    })
  },
  /**
   * 税号抬头输入框
   */
  taxNumberInput: function (e) {
    var that = this
    that.setData({
      'parameters.taxNumber': e.detail.value.replace(/\s+/g, ""),
    })
  },
  onConfirm(){
    var  that=this
    wx.navigateBack({
      
    })
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  }
 
})