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
    whereFrom: '',
    archiveStatus: 'hide',
    unArchiveStatus: 'hide',
    unArchiveStatusSend: 'hide',
    inputStatus: 'hide',
    containerStatus: 'hide',
    toast: '',
    $toast: {
      show: false
    },
    classify: [],
    classifyList: [
      '交通/差旅费',
      '业务费',
      '医疗费',
      '其他费'
    ],
    placeH: '',
    isSendEmail: false,
    isCollect: false,//是否显示归集按妞
    qrCodeData:'',
    numCodeData:{},
    reiStatus:false,
    reiUrl: ''
  },
  onLoad: function(options) {
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
    if (options.eInvoiceCode) {
  
        that.setData({
          whereFrom: 'byCodeNum',
          URL: global.getVoucherInfo_url,
        })

      var data = {
        eInvoiceCode: options.eInvoiceCode,
        eInvoiceNumber: options.eInvoiceNumber,
        randomNumber: options.randomNumber,
      }
      that.data.numCodeData = data
      // that.getVoucherInfo(data)
    }

  },
  onShow() {
    var that = this
    util.hideDialog(that)
    if (that.data.qrCodeData.length > 0){
      that.getVoucherInfoByQrcode(that.data.qrCodeData)
    }else{
      that.getVoucherInfo(that.data.numCodeData)
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
          console.log(einvoiceInfo);
          var base64Img = einvoiceInfo.img
          that.setData({
            detail: einvoiceInfo,
            'qrCodeText': einvoiceInfo.qrCodeText,
            imgUrl: 'data:image/png;base64,' + base64Img,
            param: {
              'eInvoiceCode': einvoiceInfo.eInvoiceCode,
              'eInvoiceNumber': einvoiceInfo.eInvoiceNumber,
              'randomNumber': einvoiceInfo.randomNumber,
              'agencyCode': einvoiceInfo.agencyCode,
              'agencyName': einvoiceInfo.invoicingPartyName
            },
            containerStatus: 'show',
            isCollect: einvoiceInfo.allowArchive
          })
       
        }  else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
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
          that.setData({
            detail: res.data.data[0],
            imgUrl: 'data:image/png;base64,' + base64Img,
            param: {
              'eInvoiceCode': res.data.data[0].eInvoiceCode,
              'eInvoiceNumber': res.data.data[0].eInvoiceNumber,
              'randomNumber': res.data.data[0].randomNumber,
              'agencyCode': res.data.data[0].agencyCode,
              'agencyName': res.data.data[0].invoicingPartyName
            },
            containerStatus: 'show',
            isCollect: res.data.data[0].allowArchive
          })
          if (res.data.status == '5') {
            that.setData({
              unArchiveStatus: 'hide',
              unArchiveStatusSend: 'hide',
              isSendEmail: false,
            })
          }
         
        } else {

          that.setData({
            containerStatus: 'hide',

            toast: res.data.message,
          })
          util.showToast(that)
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

  
  emailInput: function(e) {
    var that = this;
    that.setData({
      sentToEmail: e.detail.value,
    })
  },
  sentToOther: function() {
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
  //弹出层
  sentToEmailTap: function() {
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
      placeH: '请输入邮箱'
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
   * 发送至手机号dialog确定按钮事件监听
   */
  dialogConfirmSentPhone: function() {
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
   * 发送电子票至邮箱
   */
  sendEmailMsg: function(sentToEmail) {
    var that = this;
    var detail = that.data.detail
    //console.log(detail.issueDate.replace(/[^\d]/g, ''))
    commons.pRequest(global.sendEmailMsg_url, {
      randomNumber: detail.randomNumber,
      eInvoiceNumber: detail.eInvoiceNumber,
      eInvoiceCode: detail.eInvoiceCode,
      sentToEmail: sentToEmail,
      issueDate: detail.issueDate.replace(/[^\d]/g, ''),
    },'GET').then(res=>{
      that.setData({
        sentToEmail: '',
        toast: res.data.message
      })
      that.showToast()
    }).catch(res=>{
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
   * 发送电子票至手机
   */
  sendPhone: function(sentToEmail) {
    var that = this;
    var detail = that.data.detail
    //console.log(detail.issueDate.replace(/[^\d]/g, ''))
    commons.loginRequest(global.sendPhoneMsg_url, {
      randomNumber: detail.randomNumber,
      eInvoiceNumber: detail.eInvoiceNumber,
      eInvoiceCode: detail.eInvoiceCode,
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
      } else if (res.data.resultCode == '0000'){
        that.setData({
          sentToEmail: '',
        })
        wx.navigateBack({

        })
      }else{
        that.setData({
          toast: res.data.message
        })
        that.showToast()
      }

    }).catch(res=>{
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
   * 登陆dialog确定按钮事件监听
   */
  dialogPhone: function(e) {
    var that = this
    var encryptedData = e.detail.encryptedData
    if (e.detail.encryptedData) {
      return commons.phoneLogin(e)
        .then(res => {
          // console.log(res)
          if (res.data.status == 'login' || res.data.status == 'incomplete') {
            commons.putStorage('identityToken', res.data.identityToken)
            commons.putStorage('loginInfoKey', res.data)
            util.hideDialog(that)
            that.setData({
              toast: '登录成功'
            })
            that.showToast()
          }
        })
    }
  },
  /**
   * 登录dialog取消按钮事件监听
   */
  dialogCancelLogin() {
    var that = this
    that.hideDialog()
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
  //归集发票
  collectInvoice:function(){
    var detail = this.data.detail
    var data = {
      eInvoiceCode: detail.eInvoiceCode,
      eInvoiceNumber: detail.eInvoiceNumber,
      randomNumber:detail.randomNumber
    }
    commons.loginRequest(global.collectInvoice_url, data, 'POST')
      .then(res => {
        console.log(res)
        if (res.data.resultCode == '0000') {
          wx.navigateTo({
            url: '/pages/getInvoiceSuccess/getInvoiceSuccess?invoiceDetail=0',
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
        } else{
          that.setData({
            toast: res.data.message
          })
          that.showToast()
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
        } else if (res.errMsg == 'nologin') {
          wx.redirectTo({
            url: '/pages/firstPage/firstPage',
          })
        }
      })
  },
  addClassify: function(e) {
    var that = this
    var classify = that.data.classify
    var item = e.currentTarget.dataset.classify
    var flage = true
    for (let i in classify) {
      if (item == classify[i]) {
        flage = false
        return
      }
    }
    if (flage) {
      classify.push(item)
    }
    that.setData({
      classify: classify
    })
  },
  delClassify: function(e) {
    var that = this
    var classify = that.data.classify
    var item = e.currentTarget.dataset.classify
    var flage = true
    for (let i in classify) {
      if (item == classify[i]) {
        classify.splice(i, 1)
      }
    }
    that.setData({
      classify: classify
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
  showPopup() {
    let popupComponent = this.selectComponent('.J_Popup');
    popupComponent && popupComponent.toggle(true);
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
  onPullDownRefresh(){
    var that = this
    if (that.data.whereFrom=='byQrcode'){
      that.getVoucherInfoByQrcode(that.data.qrCodeData)
    }else{
      that.getVoucherInfo(that.data.numCodeData)
    }
  },
  // onShareAppMessage() {
  //   var that = this;
  //   　　// 设置菜单中的转发按钮触发转发事件时的转发内容
  //   　　var shareObj = {
  //     　　　　title: "转发的标题",        // 默认是小程序的名称(可以写slogan等)
  //     　　　　path: '/pages/mine/mine',        // 默认是当前页面，必须是以‘/’开头的完整路径
  //     　　　　imgUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
  //     　　　　success: function (res) {
  //       　　　　　　// 转发成功之后的回调
  //       　　　　　　if (res.errMsg == 'shareAppMessage:ok') {
  //                     console.log(res)
  //       　　　　　　}
  //     　　　　},
  //     　　　　fail: function () {
  //       　　　　　　// 转发失败之后的回调
  //       　　　　　　if (res.errMsg == 'shareAppMessage:fail cancel') {
  //         　　　　　　　　// 用户取消转发
  //       　　　　　　} else if (res.errMsg == 'shareAppMessage:fail') {
  //         　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
  //       　　　　　　}
  //     　　　　},
  //     　　　
  //     }
  //     return shareObj;
  // }
})