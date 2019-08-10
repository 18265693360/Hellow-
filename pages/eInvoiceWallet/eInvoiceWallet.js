var global = getApp().globalData;
var util = require('../../common/js/util.js');
import {
  commons
} from '../../common/js/commons.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: [],
    abnorShow: 'hide',
    show: false,
    selectStatus: 'show',
    numTip: 'show',
    rightContent: ['已冲红', '已打印'],
    filterPattern: true,
    inTotalData: {},
    options: {
      pageSize: 10,
      pageNo: 1,
      payerPartyNameOrchannelInfo: '',
      zfbUserId: '',
      clientType: '1', //1：微信小程序 2：支付宝小程序 3 ：微信公众号 4：H5页面
    },
    isNormalClose: true,
    isLoadmore: false,
    getTip: 'hide', //自助取票提示
    $toast: {
      show: false,
    },
    isStatus: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 小程序初始化完成时触发，全局只触发一次。参数也可以使用 wx.getLaunchOptionsSync 获取。  写在onload钩子里面就好
    if (options.agencyName) {
      this.setData({
        'options.payerPartyNameOrchannelInfo': options.agencyName,
        'options.InvoicingPartyName': options.agencyName,
        searchInputValue: options.agencyName,
        filterStatus: true,
        nameFilterStatus: true,
        nameFilterText: options.agencyName
      })

    }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this


    that.getVoucherPage(that.data.options)
    that.setData({
      'options.pageNo': 1,
      // 'options.agencyName': commons.getStorage("agencyName")

    })
    wx.showNavigationBarLoading() //在标题栏中显示加载
    wx.showLoading({
      title: '加载中...',
    })
  },
  onHide: function() {

  },
  //搜索名字 身份证号
  searchN(e) {
    var that = this
    that.setData({
      "options.payerPartyNameOrchannelInfo": e.detail.value.replace(/\s+/g, '')
    })
  },
  searchD() {
    var that = this
    if (that.data.options.payerPartyNameOrchannelInfo.length > 0) {
      this.setData({
        filterStatus: true,
        nameFilterStatus: true,
        nameFilterText: this.data.options.payerPartyNameOrchannelInfo
      })
    } else {
      if (!that.data.statusFilterStatus && !that.data.dateFilterStatus) {
        that.setData({
          filterStatus: false,
        })
      }
      that.setData({
        nameFilterStatus: false,
        'options.InvoicingPartyName': ''
      })
    }
    that.getVoucherPage(that.data.options)
  },

  /**
   * 获取已归集了的票
   */
  getVoucherPage: function(datas) {
    var that = this
    var inTotalData = that.data.inTotalData
    //  v(data)
    commons.loginRequest(global.getVoucherPage_url, datas, 'GET')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        // console.log(res)
        if (res.data.resultCode == '-1') {
          that.setData({
            getTip: 'show',
            abnorShow: 'show',
            isNormalClose: true,
            toast: res.data.message,
          })
          util.showToast(that)
        } else if (res.data.resultCode == '2002') {
          if (!that.data.isNormalClose) {
            that.setData({
              isNormalClose: true,
              abnorShow: 'show',
              result: []
            })
          } else {
            that.setData({
              isNormalClose: false,
              abnorShow: 'show',
              result: []
            })
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
        } else if (res.data.resultCode == '0000') {
          var totalPage = res.data.data[0].totalPage
          var pageNo = that.data.options.pageNo
          if (totalPage == pageNo && totalPage != 0) {
            that.setData({
              isLoadmore: true
            })
          } else {
            that.setData({
              isLoadmore: false
            })
          }
          that.setData({
            isNormalClose: true,
          })
          if (res.data.data[0].result.length > 0) {
            if (that.data.options.pageNo == 1) {
              that.setData({
                result: [],
              })
            }
            var item, DATA
            DATA = res.data.data[0].result
            for (var i = 0; i < DATA.length; i++) {
              item = DATA[i]
              item.issueDate = util.stringtoDateArray(item.issueDate)


              if (item.invoiceStatus == '2') {
                item.isStatus = '../../assests/images/val-2.png'

              } else if (item.invoiceStatus == '5') {
                item.isStatus = '../../assests/images/val-5.png'
              } else {
                item.isStatus = ''
              }
            }
            that.setData({
              result: that.data.result.concat(DATA),
              abnorShow: 'hide',
              getTip: 'hide',
            })

          } else {
            if (that.data.options.pageNo == 1 && res.data.message == '查无数据') {
              that.setData({
                result: [],
                abnorShow: 'show',

              })
              if (!that.data.filterStatus) {
                that.setData({
                  getTip: 'show'
                })
              } else {
                that.setData({
                  getTip: 'hide'
                })
              }

            }
          }

        } else {
          that.setData({
            toast: res.data.message,
          })
          util.showToast(that)
        }

      }).catch(res => {

        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        that.setData({
          result: [],
          abnorShow: 'show',
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
        } else if (res.errMsg == 'nologin') {
          if (!that.data.isNormalClose) {
            that.setData({
              isNormalClose: true,
            })
          } else {
            that.setData({
              isNormalClose: false,
            })
            wx.navigateTo({
              url: '/pages/firstPage/firstPage',
            })
          }


        }
      })
  },
  //跳转详情页面
  toDetail(e) {
    var that = this
    var result = e.currentTarget.dataset.result
    var url = ''

      url = '/pages/eInvoiceDetails/eInvoiceDetails?eInvoiceCode=' + result.eInvoiceCode + '&eInvoiceNumber=' + result.eInvoiceNumber + '&randomNumber=' + result.randomNumber + '&invoiceType=' + result.invoiceType
 

    wx.navigateTo({
      url: url,
    })


  },
  /**
   * 显示和隐藏日期选择按钮
   */
  filterPattern() {
    var that = this
    var filterPattern = that.data.filterPattern
    that.setData({
      filterPattern: !filterPattern
    })
    // console.log(filterPattern)
  },
  /*
   * 选择具体日期
   */
  tapDayTap(e) {
    var that = this
    var year = e.detail.year + ''
    var month = e.detail.month + ''
    var day = e.detail.day + ''
    var inTotalData = that.data.inTotalData
    var options = that.data.options
    that.setData({
      curYear: e.detail.year,
      curMonth: e.detail.month,
      curDate: e.detail.day,
    })

    if (month.length == 1) {
      month = '0' + month
    }
    if (day.length == 1) {
      day = '0' + day
    }
    var date = year + month + day
    options.pageNo = 1,
      options.date = date
    inTotalData.date = date
    options.type = inTotalData.type || ''
    options.InvoicingPartyName = ''
    that.setData({
      inTotalData: inTotalData,
      options: options,
      filterStatus: true,
      dateFilterStatus: true,
      dateFilterText: year + '-' + month + '-' + day,
    })
    that.getVoucherPage(options)

  },
  /**
   * 票据状态具体选中
   */
  rightSelect(e) {
    var that = this
    var inTotalData = that.data.inTotalData
    var options = that.data.options
    var status = e.detail
    var invoiceStatus = ''
    var statu = ''
    if (status == "已打印") {
      invoiceStatus = '5'
    } else if (status == "已冲红") {
      invoiceStatus = '2'
    }

    options.pageNo = 1,
      options.type = statu
    inTotalData.type = statu
    options.invoiceStatus = invoiceStatus
    inTotalData.invoiceStatus = invoiceStatus
    options.date = inTotalData.date || ''
    options.InvoicingPartyName = ''
    that.setData({
      inTotalData: inTotalData,
      options: options,
      filterStatus: true,
      statusFilterStatus: true,
      statusFilterText: e.detail,
    })
    that.getVoucherPage(options)
  },
  /**
   * 取消开票日期过滤
   */
  cancelDateFilter() {
    var that = this
    var inTotalData = that.data.inTotalData
    var options = that.data.options
    options.date = ''
    options.pageNo = 1,
      inTotalData.date = ''
    if (!that.data.statusFilterStatus && !that.data.nameFilterStatus) {
      that.setData({
        filterStatus: false,
      })
    }
    that.setData({
      dateFilterStatus: false,
      options: options,
      inTotalData: inTotalData,
    })
    that.getVoucherPage(options)
  },
  /**
   * 取消票据状态过滤
   */
  cancelStatusFilter() {
    var that = this
    var inTotalData = that.data.inTotalData
    var options = that.data.options
    inTotalData.type = ''
    options.type = ''
    inTotalData.invoiceStatus = ''
    options.invoiceStatus = ''
    options.pageNo = 1
    if (!that.data.dateFilterStatus && !that.data.nameFilterStatus) {
      that.setData({
        filterStatus: false,
      })
    }
    that.setData({
      statusFilterStatus: false,
      options: options,
      inTotalData: inTotalData,
    })
    that.getVoucherPage(options)
  },
  // 取消 名字搜索
  cancelNameFilter() {
    var that = this
    var options = that.data.options
    options.pageNo = 1
    options.payerPartyNameOrchannelInfo = ''
    options.InvoicingPartyName = ''
    if (!that.data.statusFilterStatus && !that.data.dateFilterStatus) {
      that.setData({
        filterStatus: false,
      })
    }
    that.setData({
      nameFilterStatus: false,
      options: options,
      nameFilterText: '',
      searchInputValue: '',
    })
    that.getVoucherPage(options)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this
    var options = that.data.options

    // var filterPattern = that.data.filterPattern
    // if (filterPattern) {

    // }
    if (!that.data.isLoadmore) {
      options.pageNo = options.pageNo + 1
      that.getVoucherPage(options)
      wx.showLoading({
        title: '加载中...',
      })
    }
  },
  //下拉刷新
  onPullDownRefresh: function() {
    var that = this
    var options = that.data.options
    options.pageNo = 1
    that.getVoucherPage(options)
    wx.showLoading({
      title: '加载中...',
    })

  },
  jumpGetInvoive: function() {
    wx.navigateTo({
      url: '/pages/index-s/index-s',
    })
  },
})