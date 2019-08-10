import { commons } from '../../../common/js/commons.js'
var QRCode = require('../../../assests/libs/weapp-qrcode.js')
var util = require('../../../common/js/util.js')
var global = getApp().globalData;
var qrcode;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
   
    if (options.result) {
      var result = JSON.parse(options.result)
      
      that.setData({
        result:result,
        JSONresult: options.result
      })
      
      if (result.partyName){
        that.setData({
          'result.partyName': result.partyName,
        })
      } else{
        that.setData({
          'result.partyName': '未填写',
        })
      }
      if (result.taxNumber){
        that.setData({
          'result.taxNumber': result.taxNumber,
        })
      } else {
        that.setData({
          'result.taxNumber': '未填写',
        })
      }
      if (result.partyAddress) {
        that.setData({
          'result.partyAddress': result.partyAddress,
        })
      } else {
        that.setData({
          'result.partyAddress': '未填写',
        })
      }
      if (result.phoneNumber) {
        that.setData({
          'result.phoneNumber': result.phoneNumber,
        })
      } else {
        that.setData({
          'result.phoneNumber': '未填写',
        })
      }
       if (result.bankOpen) {
        that.setData({
          'result.bankOpen': result.bankOpen,
        })
       } else {
         that.setData({
           'result.bankOpen': '未填写',
         })
       }
      if (result.bankAccount) {
        that.setData({
          'result.bankAccount': result.bankAccount,
        })
      } else {
        that.setData({
          'result.bankAccount': '未填写',
        })
      }
      that.creatQRcodeTap(result.qrCodeUrl)
    }
  },

  /**
   * 生成二维码
   */
  creatQRcodeTap: function (estring) {
    var that = this
   
    qrcode = new QRCode('canvas', {
      text:estring.replace(/\*/g,'='),
      width: 100,
      height: 100,
      colorDark: "black",
      colorLight: "white",
      correctLevel: QRCode.CorrectLevel.H,
    });
  },
  /**
   * 长按保存二维码
   */
  save: function () {
    // console.log('save')
    wx.showActionSheet({
      itemList: ['保存图片'],
      success: function (res) {
        // console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          qrcode.exportImage(function (path) {
            wx.saveImageToPhotosAlbum({
              filePath: path,
            })
          })
        }
      }
    })
  },
  toHomeTap: function () {
    wx.switchTab({
      url: global.PAGE_HOME,
    })
  },
  toTitleEdit() {
    var that = this
    var JSONresult = that.data.JSONresult
    wx.navigateTo({
      url: global.PAGE_TITLEEDIT + '?title=编辑&result=' + JSONresult,
    })
  },
  /**
   * 删除按钮事件监听
   */
  isDelTitleTap: function (e) {
    var that = this
    that.setData({
      dialog_phone: '',
      inputShow: 'hide',
      dialog_cancel: 'dialogCancel',
      dialog_confirm: 'dialogConfirmDel',
      dialog_title: '删除票据抬头',
      dialog_img: '',
      dialog_img_tap: '',
      dialog_cancelText: '取消',
      dialog_confirmText: '确定',
      dialog_content: '您确认删除该票据抬头吗?',
    })
    util.showDialog(that)
  },
  /**
  * 删除票据抬头
  */
  invoiceTitleDel(e) {
    var that = this
    // console.log(that.data.result)
    var invoiceTitleId = that.data.result.invoiceTitleId
    commons.loginRequest(global.invoiceTitleDel_url, {
      'invoiceTitleId': invoiceTitleId
    }, 'POST')
      .then(res => {
        // console.log(res)
        if (res.data.resultCode == '0000') {
          wx.navigateBack({
            
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
  },
  /**
   * 删除票据抬头dialog确定按钮事件监听
   */
  dialogConfirmDel: function () {
    var that = this
    //调用删除票据抬头函数
    that.invoiceTitleDel()
    util.hideDialog(that)
  },
  /**
   * 验证码dialog取消按钮事件监听
   */
  dialogCancel() {
    var that = this
    util.hideDialog(that)
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  }
})