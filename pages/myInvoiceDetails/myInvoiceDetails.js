// pages/myInvoiceDetails/myInvoiceDetails.js
//index.js
var util = require('../../common/js/util.js')
var QRCode = require('../../assests/libs/weapp-qrcode.js')
import {
  commons
} from '../../common/js/commons.js'
//获取应用实例
var global = getApp().globalData;
var qrcode;
Page({
  data: {
    maskStatus: 'hide',
    detail: {},
    btnDisable: false,
    archiveStatus: 'hide',
    inputStatus: 'hide',
    containerStatus: 'hide',
    toast: '',
    $toast: {
      show: false
    },

    placeH: '',
    isCollect: false,//是否显示归集按妞
    qrCodeData: '',
    numCodeData: {},
    isNormal: false,
    buttonClicked: true,
    isfalse: false,
    isCollect:false,//保存至票夹按钮是否存在
    isInvoiceCollect: false,//是已归集的票还是为归集的票
    buttonClicked: true,
  },
  onLoad: function (options) {
    var that = this;
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '加载中...',
    })

    //通过手动输入查票进入
    if (options.eInvoiceCode) {
     
        that.data.URL = global.custom_invoiceDetails_url
      
      var data = {
        eInvoiceCode: options.eInvoiceCode,
        eInvoiceNumber: options.eInvoiceNumber,
        randomNumber: options.randomNumber,
      }
      that.data.isInvoiceCollect = options.allowArchive
      that.data.numCodeData = data
      that.getVoucherInfo(data)
    }

  },
  onShow() {
    var that = this
    util.hideDialog(that)

  },

  /**
    * 票号票代码查票
    */
  getVoucherInfo(data) {
    var that = this
    // console.log(data)
    commons.pRequest(that.data.URL, data, 'GET')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        // console.log(res)
        if (res.data.resultCode == '0000') {
          var base64Img = res.data.data[0].img
          var einvoiceInfo = res.data.data[0]
          if (einvoiceInfo.status == '2') {
            einvoiceInfo.isStatus = '../../assests/images/val-2.png'
          } else if (einvoiceInfo.status == '5') {
            einvoiceInfo.isStatus = '../../assests/images/val-5.png'
          } else {
            einvoiceInfo.isStatus = ''
           
          }
          if (that.data.isInvoiceCollect == 'true') {
            that.setData({
              isCollect: true
            })
          }
          if (einvoiceInfo.eInvoiceType == '1') {
            einvoiceInfo.eInvoiceType = '税务电子发票'
          } else {
            einvoiceInfo.eInvoiceType = '财政电子票据'
          }
          einvoiceInfo.issueDate = util.stringtoDateArray(einvoiceInfo.issueDate)

          that.setData({
            detail: einvoiceInfo,
            'detail.img': 'data:image/png;base64,' + base64Img,
            param: {
              'eInvoiceCode': einvoiceInfo.eInvoiceCode,
              'eInvoiceNumber': einvoiceInfo.eInvoiceNumber,
              'randomNumber': einvoiceInfo.randomNumber,
              'agencyCode': einvoiceInfo.agencyCode,
              'agencyName': einvoiceInfo.invoicingPartyName
            },
            containerStatus: 'show',

          })

          if (res.data.data[0].status == '2' ||
            res.data.data[0].status == '5') {
            that.setData({
              isNormal: false
            })
          } else {
            that.setData({
              isNormal: true
            })
          }
        } else {

          that.setData({
            containerStatus: 'hide',

            toast: res.data.message,
          })
          util.showToast(that)
        }
      }).catch(res => {
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


  emailInput: function (e) {
    var that = this;
    that.setData({
      sentToEmail: e.detail.value,
    })
  },
  sentToOther: function () {
    var that = this
    that.setData({
      inputStatus: 'show',
      dialog_cancel: 'dialogCancel',
      dialog_confirm: 'dialogConfirmSentEmail',
      dialog_title: '发送到邮箱',
      dialog_img: '',
      dialog_img_tap: '',
      dialog_cancelText: '取消',
      dialog_confirmText: '发送',
      dialog_content: '',
      placeH: '请输入邮箱'
    })
    util.showDialog(that)
  },

  /**
   * 发送至邮箱dialog确定按钮事件监听
   */
  dialogConfirmSentEmail() {
    var that = this
    var emailReg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    var sentToEmail = that.data.sentToEmail
    if (!emailReg.test(sentToEmail)) {
      that.setData({
        toast: '请填写正确邮箱'
      })
      that.showToast()
      return;
    }
    //发送电子票到邮箱
    that.sendEmailMsg(sentToEmail)
    that.hideDialog()
    that.setData({
      toast: '发送中..',
      $toast: {
        show: true
      }
    })
  },
  /**
   * 发送电子票至邮箱
   */
  sendEmailMsg: function (sentToEmail) {
    var that = this;
    var detail = that.data.detail
    //console.log(detail.issueDate.replace(/[^\d]/g, ''))
    commons.pRequest(global.sendEmailMsg_url, {
      randomNumber: detail.randomNumber,
      eInvoiceNumber: detail.eInvoiceNumber,
      eInvoiceCode: detail.eInvoiceCode,
      sentToEmail: sentToEmail,
      issueDate: detail.issueDate.replace(/[^\d]/g, ''),
    }, 'GET').then(res => {
      that.setData({
        sentToEmail: '',
        toast: res.data.message
      })
      that.showToast()
    }).catch(res => {
      that.setData({
        sentToEmail: '',
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

  },

  /**
   * 登录dialog取消按钮事件监听
   */
  dialogCancelLogin() {
    var that = this
    that.hideDialog()
  },
  hideDialog() {
    var that = this;
    let dialogComponent = this.selectComponent('.wxc-dialog')
    dialogComponent && dialogComponent.hide();
  },
  /**
   * 发送至邮箱dialog取消按钮监听
   */
  dialogCancel() {
    var that = this
    that.hideDialog()
    that.setData({
      sentToEmail: '',
    })
  },

  
  showToast() {
    this.setData({
      $toast: {
        show: true
      }
    })
    setTimeout(() => {
      this.setData({
        $toast: {
          show: false
        }
      })
    }, 1000)
  },

  onPullDownRefresh() {
    var that = this
    that.getVoucherInfo(that.data.numCodeData)

  },
  //归集发票
  doArchive: function () {
    var detail = this.data.detail
    var data = {
      eInvoiceCode: detail.eInvoiceCode,
      eInvoiceNumber: detail.eInvoiceNumber,
      randomNumber: detail.randomNumber
    }
    commons.loginRequest(global.custom_collectInvoice_ul, data, 'POST')
      .then(res => {
        console.log(res)
        if (res.data.resultCode == '0000') {
          this.setData({
            toast: res.data.message
          })
          util.showToast(this)
          wx.navigateBack({
            
          })
        } else if (res.data.resultCode == '2002') {
          wx.removeStorage({ key: 'identityToken', })
          wx.removeStorage({ key: 'userInfo', })
          wx.navigateTo({
            url: "/pages/firstPage/firstPage"
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
  //查看电子票
  lookInvoice: function () {
    var that = this
    var detail = that.data.detail
    util.buttonClicked(that, 'buttonClicked')

    wx.navigateTo({
      url: '/pages/lookInvoice/lookInvoice?code=' + detail.eInvoiceCode + '&num=' + detail.eInvoiceNumber + '&random=' + detail.randomNumber + '&issue=' + detail.issueDate + '&invoiceType=' + detail.eInvoiceType + '&invoiceState=' + detail.status,
    })

  }
})