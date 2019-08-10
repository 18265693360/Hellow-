// pages/payment/paymentDetail/paymentDetail.js
var util = require('../../../common/js/util.js')
var QRCode = require('../../../assests/libs/weapp-qrcode.js')
import { commons } from '../../../common/js/commons.js'
var global = getApp().globalData;
var qrcode;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcodeUrl:'',
    toast:'',
    allData:{},
    $toast: {
      show: false
    },
    buttonClicked:true,
    buttonClickedTwo:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.id){
      this.setData({
        id:options.id,
        agencyCode:options.agencyCode,
        uniqueCode: options.uniqueCode,
        voucherNumber: options.voucherNumber
      })
    }
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
   this.getDetail()
   this.logins()
  },
  getDetail:function(){
    commons.loginRequest(global.paymentProof_url,
    {
      id: this.data.id
    },'POST')
    .then(res=>{
      console.log(res.data)
      if(res.data.resultCode == '0000'){
        var datA = res.data.data[0]
        datA.issueDate = util.stringtoDateArray(datA.issueDate)
        this.setData({
          allData:datA
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
          url: '../firstPage/firstPage',
        })
      }else{
        this.setData({
          toast:res.data.message
        })
        util.showToast(this)
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
      } else if (res.errMsg == 'nologin') {
        wx.navigateTo({
          url: '/pages/firstPage/firstPage',
        })
      }
    })
  },
  sentToOther: function () {
    var that = this

    if (!that.data.allData || !that.data.allData.id) {
      wx.showToast({
        title: '票据不存在',
        icon:'none'
      })
     
      return
    }
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
    if (!phoneReg.test(sentToEmail)) {
      that.setData({
        toast: '请填写正确手机号'
      })
      that.showToast()
      return;
    }
    //发送电子票到手机号
    that.sendPhone(sentToEmail)
    that.hideDialog()
    wx.showToast({
      icon: 'none',
      title: '发送中..',
    })

  },
  /**
   * 发送电子票至手机
   */
  sendPhone: function (sentToEmail) {
    var that = this;

    commons.loginRequest(global.paymentSendToOther_url, {
      id: that.data.id,
      phone: sentToEmail,
    }, 'POST')
      .then((res) => {
        wx.hideToast()
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
          that.setData({
            sentToEmail: '',
          })
        } else if (res.data.resultCode == '0000') {
          that.setData({
            sentToEmail: '',
            toast: '已发送给对方'
          })

          that.showToast()
          setTimeout(() => {
            wx.navigateBack({

            })
          }
            , 1000)

        } else {
          that.setData({
            toast: res.data.message,
            sentToEmail: '',
          })
          that.showToast()
        }

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
  dialogCancel() {
    var that = this
    that.hideDialog()
    that.setData({
      sentToEmail: '',
    })
  },
  hideDialog() {
    var that = this;
    let dialogComponent = this.selectComponent('.wxc-dialog')
    dialogComponent && dialogComponent.hide();
  },
  emailInput: function (e) {
    var that = this;
    that.setData({
      sentToEmail: e.detail.value,
    })
  },
  
  showPopup(e) {
    this.setData({
      formId: e.detail.formId,
    })
    util.buttonClicked(this, 'buttonClickedTwo')
    this.getQRCode()
  },
  getQRCode: function () {
    commons.loginRequest(global.getPaymentQRCode_url,
      {
        agencyCode:this.data.agencyCode,
        uniqueCode:this.data.uniqueCode,
        wxJsCode: this.data.code,
        formId: this.data.formId,
        type: 3,
        voucherNumber: this.data.voucherNumber,
        client:1
      }, 'POST')
      .then(res => {
        this.setData({
          qrcodeUrl: res.data.data[0],
        })
        let popupComponent = this.selectComponent('.J_Popup');
        popupComponent && popupComponent.toggle(true);
 
      }).catch(res => {
        
      })
  },
 
  hidePopup() {
    let popupComponent = this.selectComponent('.J_Popup');
    popupComponent && popupComponent.toggle();
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
  logins: function () {
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
      fail: function (res) {
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
  lookInvoice:function(){
    var that = this
    var allData = that.data.allData
    util.buttonClicked(that, 'buttonClicked')
   
    commons.pRequest(global.lookPayment_url, {
      voucherId: allData.voucherId,
    }, 'POST')
      .then(res => {
        if (res.data.resultCode == '0000') {
          wx.navigateTo({
            url: '/pages/payment/lookPayment/lookPayment?voucherId=' + allData.voucherId,

          })
        } else {
          that.setData({
            toast: res.data.message,
          })
          util.showToast(that)
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