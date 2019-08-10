// pages/billBefore/billBefore.js

/**
 * @param btnDisable 查票按钮禁用
 * @param btnLoading 查票按钮显示加载状态
 * @param toast 提示框信息
 * @param $toast 提示框弹出
 * @param parameters 请求查票接口的参数
 * @param storageData 缓存数据
 */
var util = require('../../../common/js/util.js');
var queryPages = require('../../../common/js/queryPages.js');
var global = getApp().globalData;
import {
  commons
} from '../../../common/js/commons.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //查票按钮禁用
    btnDisable: false,
    //查票按钮显示加载状态
    btnLoading: false,
    //提示框信息
    toast: '',
    $toast: {
      show: false
    },
    //请求查票接口的参数
    parameters: {
      eInvoiceNumber: '',
      eInvoiceCode: '',
      randomNumber: '',
      issueDate: '',
      money: ''
    },
    codePlaceholder: '请输入票据代码',
    numberPlaceholder: '请输入票据号码',
    queryPlaceholder: '请输入校验码',
    invoiceCheck: false,
    eInvoiceCheck: true,
    billType: 'eInvoice',
    //开票日期是否显示
    isDateShow: true,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    // isDateShow: (options.isDateShow == "true" ? true : false)
    // isShow: (options.isShow == "true" ? true : false)
  },
  //nameInput输入事件监听
  numberInput: function(e) {
    var that = this
    that.setData({
      'parameters.eInvoiceNumber': e.detail.value,
    })
  },
  //socialCardInput输入事件监听
  codeInput: function(e) {
    var that = this
    that.setData({
      'parameters.eInvoiceCode': e.detail.value,
    })
  },
  // identifyInput输入事件监听
  randomInput: function(e) {
    var that = this
    that.setData({
      'parameters.randomNumber': e.detail.value,
    })
  },
  //不含税金额 输入监听事件
  moneyInput: function(e) {
    var that = this
    that.setData({
      'parameters.money': e.detail.value,
    })
  },
  // 发票日期输入事件监听
  datePicker: function(e) {
    var that = this
    that.setData({
      'parameters.issueDate': e.detail.value,

    })

  },

  radioChange: function(e) {
    // console.log('radio发生change事件，携带value值为：', e)
    var that = this
    var titleType = e.detail.value
    if (titleType == '税务电子发票') {
      that.setData({
        invoiceCheck: true,
        eInvoiceCheck: false,
        billType: 'invoice',
        isDateShow: false,
        queryPlaceholder: '请输入校验码后六位',
        codePlaceholder: '请输入发票代码',
        numberPlaceholder: '请输入发票号码',
        'parameters.eInvoiceNumber':'',
        'parameters.eInvoiceCode':'',
        'parameters.randomNumber':'',
        'parameters.money': '',
        'parameters.issueDate': ''
      })
    } else {
      that.setData({
        partyCheck: false,
        personalCheck: true,
        billType: 'eInvoice',
        isDateShow: true,
        queryPlaceholder: '请输入校验码',
        codePlaceholder: '请输入票据代码',
        numberPlaceholder: '请输入票据号码',
        'parameters.eInvoiceNumber': '',
        'parameters.eInvoiceCode': '',
        'parameters.randomNumber': '',
        'parameters.money': '',
        'parameters.issueDate': ''
      })
    }
  },
  //'查找电子票'按钮点击事件
  checkTap: function() {
    var that = this
    var parameters = that.data.parameters
    var eInvoiceNumber = parameters.eInvoiceNumber
    var eInvoiceCode = parameters.eInvoiceCode
    var randomNumber = parameters.randomNumber
    var billType = that.data.billType
    var money = parameters.money
    var issueDate = parameters.issueDate
    var zhuan = util.isZP(eInvoiceCode)
    var eInvoiceDate = parameters.issueDate.replace(/-/g, '')
    //判断用户是否输入用户名和密码
    if (billType == 'eInvoice' && eInvoiceCode.length != 8) {
      that.setData({
        toast: that.data.codePlaceholder.substring(0, 3) + '正确的' + that.data.codePlaceholder.substring(3)
      })
      util.showToast(that)
      return
    } else if (billType == 'eInvoice' && eInvoiceNumber.length != 10) {
      that.setData({
        toast: that.data.numberPlaceholder.substring(0, 3) + '正确的' + that.data.numberPlaceholder.substring(3)
      })
      util.showToast(that)
      return
    } else if (billType == 'invoice' && !(/^\d{10}|\d{12}$/).test(eInvoiceCode)) {
      that.setData({
        toast: that.data.codePlaceholder.substring(0, 3) + '正确的' + that.data.codePlaceholder.substring(3)
      })

      util.showToast(that)
      return
    } else if (billType == 'invoice' && !(/^\d{8}$/).test(eInvoiceNumber)) {
      that.setData({
        toast: that.data.codePlaceholder.substring(0, 3) + '正确的' + that.data.numberPlaceholder.substring(3)
      })

      util.showToast(that)
      return
    } else if (!(/^[0-9A-Za-z]{6}$/).test(randomNumber)) {
      that.setData({
        toast: '请输入正确校验码'
      })
      util.showToast(that)
      return
    } else if (billType == 'invoice' && zhuan && money.length < 1) {

        that.setData({
          toast: '请输入不含税金额'
        })
        util.showToast(that)
        return
    }else if (billType == 'invoice' && eInvoiceDate.length < 1) {
      that.setData({
        toast: '请选择开票日期'
      })
      util.showToast(that)
      return
    }else {
      that.setData({
        btnDisable: true,
        btnLoading: true,
      })
      if (billType == 'eInvoice') {//财票
        wx.navigateTo({
          url: global.PAGE_EINVOICEDETAIL + '?eInvoiceCode=' + eInvoiceCode + '&eInvoiceNumber=' + eInvoiceNumber + '&randomNumber=' + randomNumber + '&prePage=eInvoice',
        })
      } else if (billType == 'invoice') {//税票
        var data = {
          eInvoiceCode: eInvoiceCode,
          eInvoiceNumber: eInvoiceNumber,
          randomNumber: randomNumber,
          issueDate: eInvoiceDate,
          money: money,
        }
        var invoiceInfo = JSON.stringify(data)
        wx.navigateTo({
          url: '/pages/billDetail/billDetail' + '?invoiceInfo=' + invoiceInfo,
        })
      }

    }
    that.setData({
      btnDisable: false,
      btnLoading: false,
    })
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },

})