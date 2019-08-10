// pages/lookInvoice/lookInvoice.js
var util = require('../../common/js/util.js')
import {
  commons
} from '../../common/js/commons.js'
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toast: '',
    $toast: {
      show: false
    },
    detail: {},
    reiStatus: false,
    reiUrl: '',
    sentToEmail: '',
    invoiceT: true,//true代表财票 fales代表税票
    paramlist: [],
    isShow: false,
    abnorShow: 'hide'
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
    if (sentToEmail.length < 1) {
      that.setData({
        toast: '请输入邮箱'
      })
      that.showToast()
      return;
    }
    if (!emailReg.test(sentToEmail)) {
      that.setData({
        toast: '请输入正确邮箱'
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
  sendEmailMsg: function(sentToEmail) {
    var that = this;
    var detail = that.data.detail
    //console.log(detail.issueDate.replace(/[^\d]/g, ''))
    commons.loginRequest(global.sendEmailMsg_url, {
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
  /**
   * 登录dialog取消按钮事件监听
   */
  dialogCancel() {
    var that = this
    that.hideDialog()
  },
  emailInput: function(e) {
    var that = this;
    that.setData({
      sentToEmail: e.detail.value,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options) {
      this.setData({
        'detail.eInvoiceCode': options.code,
        'detail.eInvoiceNumber': options.num,
        'detail.randomNumber': options.random,
        'detail.issueDate': options.issue,
        invoiceType: options.invoiceType,
        status: options.invoiceState
      })
      if (options.invoiceType == '1') {//税票
        this.setData({
          invoiceT: false
        })
      }
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    var detail = that.data.detail
    var url
    if (that.data.invoiceType == '1') {//税票
      url = global.lookBill_url
    } else {
      url = global.lookInvoice_url
    }
    commons.loginRequest(url, {
        eInvoiceCode: detail.eInvoiceCode,
        eInvoiceNumber: detail.eInvoiceNumber,
        randomNumber: detail.randomNumber,
        issueDate: detail.issueDate
      }, 'GET')
      .then(res => {
        if (res.data.resultCode == '0000') {
          if (that.data.status != '2' && that.data.status != '5') {
            that.setData({
              isShow: true
            })
          }
          if (that.data.invoiceType == '1') {//税票
            that.setData({
              paramlist: res.data.data[0].list,
            })
            return
          }
          that.setData({
            'detail.img': res.data.data[0].img,
            'detail.reiStatus': res.data.data[0].reiStatus,
          })
         
          switch (that.data.detail.reiStatus) {
            case '1':
              {
                that.setData({
                  reiStatus: true,
                  reiUrl: '/assests/images/lock.png'
                })
                break;
              }
            case '2':
              {
                that.setData({
                  reiStatus: true,
                  reiUrl: '/assests/images/reimbursement.png'
                })
                break;
              }
            case '3':
              {
                that.setData({
                  reiStatus: true,
                  reiUrl: '/assests/images/entry.png'
                })
                break;
              }
            default:
              {
                that.setData({
                  reiStatus: false,
                })
              }
          }

        } else {
          that.setData({
            toast: res.data.message,
            abnorShow: 'show'
          })
          that.showToast(that)
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
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})