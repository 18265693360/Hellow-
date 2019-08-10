//index.js
var util = require('../../common/js/util.js')
var QRCode = require('../../assests/libs/weapp-qrcode.js')
import { commons } from '../../common/js/commons.js'
//获取应用实例
var global = getApp().globalData;
var qrcode;
Page({
  data: {
    btnDisable: false,
    unArchiveStatusSend: 'hide',
    inputStatus: 'hide',
    unArchiveStatus:'hide',
    abnorShow: 'hide',
    toast: '',
    $toast: {
      show: false
    },
    isSendEmail:false,
    URL:'',
    placeH:'',
    containerStatus:'show',
    indicatorDots:false,
    qrCodeData:''
  },
  onLoad: function (options) {
    var that = this;
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '加载中...',
    })
    //通过扫二维码进入
    if (options.qrCode) {
      // that.getVoucherInfoByQrcode(options.qrCode)
      that.data.qrCodeData = options.qrCode
      that.setData({
        whereFrom: 'byQrcode',
       
      })
    }
    //通过手动输入查票进入
    if (options.invoiceInfo) {
     //查验
        that.setData({
          whereFrom: 'byCodeNum',
          URL: global.getInvoiceInfo_url
        })
      

      var optionsa = JSON.parse(options.invoiceInfo)
      var data = {
        eInvoiceCode: optionsa.eInvoiceCode,
        eInvoiceNumber: optionsa.eInvoiceNumber,
        randomNumber: optionsa.randomNumber,
        checkCode: optionsa.randomNumber,
        issueDate: optionsa.issueDate,
        amount:optionsa.money||''
      }
      that.data.numCodeData = data
      // that.getInvoiceDetail(data)
    }

  },
  onShow() {
    var that = this
    util.hideDialog(that)
    if (that.data.qrCodeData.length > 0) {
      that.getVoucherInfoByQrcode(that.data.qrCodeData)
    } else {
      that.getInvoiceDetail(that.data.numCodeData)
    }
  },
  /**
   * 二维码查票
   */
  getVoucherInfoByQrcode(qrCode) {
    var that = this
    commons.pRequest(global.getVoucherInfoByQrcode_url, {
      qrCode: qrCode
    }, 'GET')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        if (res.data.resultCode == '0000') {
          var einvoiceInfo = res.data.data[0]
          that.setData({
            detail: einvoiceInfo,
            'qrCodeText': einvoiceInfo.qrCodeText,
            paramlist: einvoiceInfo.list,
            param: {
              'eInvoiceCode': einvoiceInfo.eInvoiceCode,
              'eInvoiceNumber': einvoiceInfo.eInvoiceNumber,
              'randomNumber': einvoiceInfo.randomNumber,
            },
            containerStatus: 'show',
          })
          if (einvoiceInfo.list.length >1){
            that.setData({
              indicatorDots:true
            })
          }
          // 判断是否已归集
          //  that.isArchiveVoucher()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }


      }).catch(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
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
  },
  getInvoiceDetail(data){
    var that = this
    commons.pRequest(this.data.URL, data, 'GET')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        if (res.data.resultCode == '-1') {
          that.setData({
            containerStatus: 'hide',
            footStatus: 'hide',
            abnorShow: 'show',
            toast: res.data.message,
          })
          that.showToast()
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
        } else if (res.data.resultCode == '0000') {
          //console.log(res.data)
          var invoiceInfo = res.data.data[0]
          that.setData({
            detail: invoiceInfo,
            'qrCodeText': invoiceInfo.qrCodeText,
            paramlist: invoiceInfo.list,
            containerStatus: 'show',
            footStatus: 'show',
            abnorShow: 'hide',
          })
          if (invoiceInfo.list.length > 1) {
            that.setData({
              indicatorDots: true
            })
          }
        }
      }).catch(res=>{
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
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
      dialog_confirm: 'dialogConfirmSentPhone',
      dialog_title: '发送给他人',
      dialog_img: '',
      dialog_img_tap: '',
      dialog_cancelText: '取消',
      dialog_confirmText: '发送',
      dialog_content: '',
      placeH: '请输入手机号'
    })
    util.showDialog(that)
  },
  /**
   * 发送至手机号dialog确定按钮事件监听
   */
  dialogConfirmSentPhone: function () {
    var that = this
    var phoneReg = /^(13[0-9]|14[1|5|6|7|9]|15[0|1|2|3|5|6|7|8|9]|16[2|5|6|7]|17[0|1|2|3|5|6|7|8]|18[0-9]|19[1|8|9])\d{8}$/;
    var sentToEmail = that.data.sentToEmail
    if (!sentToEmail || sentToEmail.length < 1) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return;
    }
    if (!phoneReg.test(sentToEmail)) {
      wx.showToast({
        title: '请输入正确手机号',
        icon: 'none'
      })
      return;
    }
    //发送电子票到手机号
    that.sendPhone(sentToEmail)
    that.hideDialog()
    that.setData({
      toast: '发送中..',
      $toast: {
        show: true
      }
    })
  },
  /**
   * 发送电子票至手机
   */
  sendPhone: function (sentToEmail) {
    var that = this;
    var detail = that.data.detail
    //console.log(detail.issueDate.replace(/[^\d]/g, ''))
    commons.loginRequest(global.sendPhoneMsg_url, {
      randomNumber: detail.checkCode,
      eInvoiceNumber: detail.invoiceNumber,
      eInvoiceCode: detail.invoiceCode,
      phone: sentToEmail,
    }, 'GET')
      .then((res) => {
        if (res.data.resultCode == '2002') {
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
        } else if (res.data.resultCode == '0000') {
          that.setData({
            sentToEmail: '',
          })
          wx.navigateBack({

          })
        } else {
          that.setData({
            toast: res.data.message
          })
          that.showToast()
        }

      }).catch(res => {
        that.setData({
          sentToEmail: '',
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


  },
  //弹出层
  sentToEmailTap: function () {
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
      placeH:'请输入邮箱'
    })
    util.showDialog(that)
  },
  hideDialog() {
    var that = this;
    let dialogComponent = this.selectComponent('.wxc-dialog')
    dialogComponent && dialogComponent.hide();
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
    // console.log(detail.issueDate.replace(/[^\d]/g,''))
    commons.pRequest(global.sendEmailMsg_url, {
      randomNumber: detail.checkCode,
      eInvoiceNumber: detail.invoiceNumber,
      eInvoiceCode: detail.invoiceCode,
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
  showPopup() {
    let popupComponent = this.selectComponent('.J_Popup');
    popupComponent && popupComponent.toggle(true);
    //console.log(this.data.detail)
    qrcode = new QRCode('canvas', {
      text: this.data.detail.qrCodeText,
      image: '',
      width: 200,
      height: 200,
      colorDark: "black",
      colorLight: "white",
      correctLevel: QRCode.CorrectLevel.H,
    });
  },
  hidePopup() {
    let popupComponent = this.selectComponent('.J_Popup');
    popupComponent && popupComponent.toggle();
  },
  onPullDownRefresh() {
    var that = this
    if (that.data.whereFrom == 'byQrcode') {
      that.getVoucherInfoByQrcode(that.data.qrCodeData)
    } else {
      that.getInvoiceDetail(that.data.numCodeData)
    }
  },
  //滚动触发函数
  scrollFn(even){
    console.log(even.detail.scrollTop)
  },
  //提示框函数
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
  imgYu(event){

  }
})
