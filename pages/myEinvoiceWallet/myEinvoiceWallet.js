// pages/myEinvoiceWallet/myEinvoiceWallet.js
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
    result: [],//已归集票据列表
    unResult:[],//未归集票据列表
    abnorShow: 'hide',
    // abnorShowUN:'hide',//未归集列表的空提示
    show: false,
    selectStatus: 'show',
    numTip: 'show',
    rightContent: ['已冲红', '已打印'],
    filterPattern: true,
    options: {
      channelKey: '9103', //渠道 9101（支付宝userid）9103（微信userid）
      channelValue: '', //渠道值 支付宝userid
      agencyId: '', //单位识别码
      queryParameter: '', //搜索框条件 票据号码或姓名
      issueDate: '',
      invoiceStatus: '', //票据状态 2已冲红 5已打印
      pageSize: '10',
      pageNo: 1,
      clientType: '1', //1：微信小程序 2：支付宝小程序 3 ：微信公众号 4：H5页面

    },
    isNormalClose: true,
    isLoadmore: false,
    // isLoadmoreUN:false,//未归集的加载更多
    isfocus: false,
    toast:'',
    $toast: {
      show: false,
    },
    isStatus: '',
    collectStatus: false, //归集状态 false未归集
    checkboxtext: '全选',
    allChecked: false, //是否全部归集
    collectSelect: false, //归集按钮是否存在
    Arr: [], //选中要归集的票据数组
    marginBottom: 200,
    checked:false,
    tips:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 小程序初始化完成时触发，全局只触发一次。参数也可以使用 wx.getLaunchOptionsSync 获取。  写在onload钩子里面就好
    var that = this
    wx.getStorage({
      key: 'loginInfoKey', // 缓存数据的key
      success: (ress) => {
        that.setData({
          'options.channelValue': ress.data.unionId,
        })
      },

    })
    if (options.agencyId) {
      that.setData({
        'options.agencyId': options.agencyId,
      })
    }
    that.getTips()
    

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    wx.showLoading({
      title: '加载中...',
    })
 
    // that.getUnvoucherPage(that.data.options)
    that.getVoucherPage(that.data.options)
  },
  onHide: function() {
    var that = this
    that.setData({
      abnorShow: 'hide',
    })


  },
  getTips() {
    var that = this
    commons.pRequest(global.custom_imageLogo_url, {
      agencyId: that.data.options.agencyId,
    }, 'GET').then(res => {

      if (res.data.resultCode == '0000') {
        that.setData({
          tips: res.data.data[0].tips,
        })
        if (that.data.tips.length > 0) {
          that.setData({
            isTips: true
          })
          wx.getStorage({
            key: 'remind',
            success: function (res) {
              if (res.data != 'no') {
                //提示框
                that.jumpTip()
              }
            },
            fail: res => {
              that.jumpTip()
            }
          })
        }
        
      }
      if (res.data.resultCode == '2002') {
        if (!that.data.isNormalClose) {
          that.setData({
            isNormalClose: true,
            abnorShow: 'hide',
            result: [],
          })
        } else {
          that.setData({
            isNormalClose: false,
            abnorShow: 'hide',
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
  //搜索名字 身份证号
  searchN(e) {
    var that = this
    that.setData({
      "options.queryParameter": e.detail.value.replace(/\s+/g, ''),
   
    })
  },
  searchD() {
    var that = this
    if (that.data.options.queryParameter.length > 0) {
      this.setData({
        filterStatus: true,
        nameFilterStatus: true,
        nameFilterText: this.data.options.queryParameter,
        'options.pageNo': 1
      })
    } else {
      if (!that.data.statusFilterStatus && !that.data.dateFilterStatus) {
        that.setData({
          filterStatus: false,
        })
      }
      that.setData({
        nameFilterStatus: false,
      })
    }
    that.getVoucherPage(that.data.options)
    // that.getUnvoucherPage(that.data.options)
  },

  /**
   * 获取已归集了的票
   */
  // getVoucherPage: function(datas) {
  //   var that = this
  //   var inTotalData = that.data.inTotalData
  //   //  v(data)
  //   commons.loginRequest(global.custom_invoiceList_url, datas, 'POST')
  //     .then(res => {
  //       wx.hideNavigationBarLoading()
  //       wx.stopPullDownRefresh()
  //       wx.hideLoading()
  //       // console.log(res)
  //       if (res.data.resultCode == '-1') {
  //         that.setData({
  //           getTip: 'show',
  //           abnorShow: 'show',
  //           isNormalClose: true,
  //           toast: res.data.message,
  //         })
  //         util.showToast(that)
  //       } else if (res.data.resultCode == '2002') {
  //         if (!that.data.isNormalClose) {
  //           that.setData({
  //             isNormalClose: true,
  //             abnorShow: 'hide',
  //             result: [],
  //           })
  //         } else {
  //           that.setData({
  //             isNormalClose: false,
  //             abnorShow: 'hide',
  //           })
  //           wx.removeStorage({
  //             key: 'identityToken',
  //           })
  //           wx.removeStorage({
  //             key: 'loginInfoKey',
  //           })
  //           wx.removeStorage({
  //             key: 'userPhone',
  //           })
  //           wx.navigateTo({
  //             url: '/pages/firstPage/firstPage',
  //           })
  //         }
  //       } else if (res.data.resultCode == '0000') {
  //         var totalPage = res.data.data[0].totalPage
  //         var pageNo = that.data.options.pageNo
  //         if (totalPage == pageNo && totalPage != 0) {
  //           that.setData({
  //             isLoadmore: true
  //           })
  //         } else {
  //           that.setData({
  //             isLoadmore: false
  //           })
  //         }
  //         that.setData({
  //           isNormalClose: true,
  //         })
  //         if (res.data.data[0].result.length > 0) {
  //           if (that.data.options.pageNo == 1) {
  //             that.setData({
  //               result: [],
  //             })
  //           }
  //           var item, DATA
  //           DATA = res.data.data[0].result
  //           for (var i = 0; i < DATA.length; i++) {
  //             item = DATA[i]
  //             item.issueDate = util.stringtoDateArray(item.issueDate)


  //             if (item.invoiceStatus == '2') {
  //               item.isStatus = '../../assests/images/val-2.png'

  //             } else if (item.invoiceStatus == '5') {
  //               item.isStatus = '../../assests/images/val-5.png'
  //             } else {
  //               item.isStatus = ''
  //             }
  //           }
  //           that.setData({
  //             result: that.data.result.concat(DATA),
  //             abnorShow: 'hide',
  //             getTip: 'hide',
  //           })

  //         } else {
  //           if (that.data.options.pageNo == 1 && res.data.message == '查无数据') {
  //             that.setData({
  //               result: [],
  //               abnorShow: 'show',

  //             })
  //             if (!that.data.filterStatus) {
  //               that.setData({
  //                 getTip: 'show'
  //               })
  //             } else {
  //               that.setData({
  //                 getTip: 'hide'
  //               })
  //             }

  //           }
  //         }

  //       }else{
  //         that.setData({
  //           toast: res.data.message,
  //         })
  //         util.showToast(that)
  //       }

  //     }).catch(res => {
  //       wx.stopPullDownRefresh()
  //       wx.hideLoading()
  //       that.setData({
  //         result: [],
  //       })
  //       if (res.errMsg == "request:fail 请求超时") {
  //         wx.showModal({
  //           title: '提示',
  //           content: global.overTime,
  //           showCancel: false
  //         })
  //         return
  //       } else if (res.errMsg.substring(0, 12) == "request:fail") {
  //         wx.showModal({
  //           title: '提示',
  //           content: global.nowork,
  //           showCancel: false
  //         })
  //       } else if (res.errMsg == 'nologin') {
  //         if (!that.data.isNormalClose) {
  //           that.setData({
  //             isNormalClose: true,
  //           })
  //         } else {
  //           that.setData({
  //             isNormalClose: false,
  //           })
  //           wx.navigateTo({
  //             url: '/pages/firstPage/firstPage',
  //           })
  //         }


  //       }
  //     })
  // },
  /**
   * 未归集获取票
   */
  getVoucherPage: function(data) {
    var that = this
    wx.showLoading({
      content: '加载中...',
    });
    setTimeout(function() {
      wx.hideLoading();
    }, 5000)

    commons.loginRequest(global.custom_invoiceList_url, data, 'POST')
      .then(res => {
        wx.hideLoading();
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
        if (res.data.resultCode == '-1') {
          wx.showToast({
            type: 'none',
            content: res.data.message,
            duration: 2000,
          });
          that.setData({
            isNormalClose: true,
            abnorShow: "show",
            abnorShows: true,
            showDom: true
          })
          return
        }
        if (res.data.resultCode == '2002') {
          if (!that.data.isNormalClose) {
            that.setData({
              isNormalClose: true,
              abnorShow: 'hide',
              result: [],
            })
          } else {
            that.setData({
              isNormalClose: false,
              abnorShow: 'hide',
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
          return
        }
        if (res.data.resultCode == '0000') {

          that.setData({
            isNormalClose: true
          })
          if (res.data.data.length < 1) {
            that.setData({
              result: [],
              isLoadmore: false,
              abnorShow: "show",
              abnorShows: true,
              showDom: true,
              text: ""
            })
            return
          }


          if (res.data.data.length > 0) {

            var DATA = res.data.data
          
            for (var i = 0; i < DATA.length; i++) {
              var item = DATA[i]

              if (item.status == '2') {
                item.isStatus = '../../assests/images/val-2.png'

              } else if (item.status == '5') {
                item.isStatus = '../../assests/images/val-5.png'
              } else {
                item.isStatus = ''
              }
            }
            that.setData({
              result: DATA,
              isLoadmore: true,
              abnorShow: "hide",
              abnorShows: false,
              showDom: true,
              collectSelect: true
            })


          }

          return
        } else {
          that.setData({
            toast: res.data.message,
          })
          util.showToast(that)
        }
      }).catch(err => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        that.setData({
          result: [],
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
    // if (!that.data.collectStatus){//未归集
    url = '/pages/myInvoiceDetails/myInvoiceDetails?eInvoiceCode=' + result.eInvoiceCode + '&eInvoiceNumber=' + result.eInvoiceNumber + '&randomNumber=' + result.randomNumber +'&allowArchive='+ result.allowArchive
    // }else{
    //   url = '/pages/eInvoiceDetails/eInvoiceDetails?eInvoiceCode=' + result.eInvoiceCode + '&eInvoiceNumber=' + result.eInvoiceNumber + '&randomNumber=' + result.randomNumber + '&invoiceType=' + result.invoiceType
    // }
    
    
    
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
    options.issueDate = date

    options.pageNo = 1
    that.setData({
      options: options,
      filterStatus: true,
      dateFilterStatus: true,
      dateFilterText: year + '-' + month + '-' + day,

    })
    that.getVoucherPage(that.data.options)
    // that.getUnvoucherPage(that.data.options)
  },
  /**
   * 票据状态具体选中
   */
  rightSelect(e) {
    var that = this
    var options = that.data.options
    var status = e.detail
    var invoiceStatus = ''
    if (status == "已打印") {
      invoiceStatus = '5'
    } else if (status == "已冲红") {
      invoiceStatus = '2'
    }
    options.invoiceStatus = invoiceStatus
    options.pageNo = 1
    that.setData({
      options: options,
      filterStatus: true,
      statusFilterStatus: true,
      statusFilterText: e.detail,
    })
    that.getVoucherPage(that.data.options)
    // that.getUnvoucherPage(that.data.options)
  },
  /**
   * 取消开票日期过滤
   */
  cancelDateFilter() {
    var that = this

    var options = that.data.options
    options.issueDate = ''
    options.pageNo = 1
    if (!that.data.statusFilterStatus && !that.data.nameFilterStatus) {
      that.setData({
        filterStatus: false,
      })
    }
    that.setData({
      dateFilterStatus: false,
      options: options,
    })
    that.getVoucherPage(that.data.options)
    // that.getUnvoucherPage(that.data.options)
  },
  /**
   * 取消票据状态过滤
   */
  cancelStatusFilter() {
    var that = this

    var options = that.data.options
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
    })
    that.getVoucherPage(that.data.options)
    // that.getUnvoucherPage(that.data.options)
  },
  // 取消 名字搜索
  cancelNameFilter() {
    var that = this
    var options = that.data.options
    options.queryParameter = ''
    options.pageNo = 1
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
    that.getVoucherPage(that.data.options)
    // that.getUnvoucherPage(that.data.options)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function() {
  //   var that = this
  //   var options = that.data.options

  //   // var filterPattern = that.data.filterPattern
  //   // if (filterPattern) {

  //   // }
  //   if (!that.data.isLoadmore) {
  //     options.pageNo = options.pageNo + 1
  //     that.getVoucherPage(options)
  //     wx.showLoading({
  //       title: '加载中...',
  //     })
  //   }
  // },
  //下拉刷新
  onPullDownRefresh: function() {
    var that = this
    var options = that.data.options
    // if (that.data.collectStatus) {

      options.pageNo = 1
      that.getVoucherPage(options)

    // } else {
    //   that.getUnvoucherPage(options)
    // }
    wx.showLoading({
      title: '加载中...',
    })

  },
  jumpGetInvoive: function() {
    wx.navigateTo({
      url: '/pages/index-s/index-s',
    })
  },
  getFocus() {
    this.setData({
      isfocus: true
    })
  },
  // //已归集状态
  // collectActive() {
  //   var that = this
  //   that.setData({
  //     collectStatus: true,
  //     collectSelect: false,
  //     marginBottom: 100,
      
  //   })

  // },
  // //未归集状态
  // unCollectActive() {
  //   var that = this
  //   that.setData({
  //     collectStatus: false,
  //     // collectSelect: true,
  //     marginBottom: 200,

  //   })

  // },
  jumpTip() {
    if (this.data.tips.length > 0) {
      wx.showModal({
        title: '温馨提示',
        content: this.data.tips,
        confirmText: '我知道了',
        cancelText: '不再提醒',
        cancelColor: '#999999',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
            wx.setStorage({
              key: 'remind',
              data: 'no',
            })

          }
        }
      })
    }



  },

  // checkboxChange: function(e) {
  //   var that = this
  //   var index = e.target.dataset.index
  //   var code = e.target.dataset.code
  //   var num = e.target.dataset.num
  //   var random = e.target.dataset.random
  //   var str = code + '-' + num + '-' + random
  //   var arr = that.data.Arr
  //   if (arr.length > 0) {
  //     for (var i = 0; i < arr.length; i++) {
  //       if (arr[i] == str) {
  //         arr.splice(i, 1)

  //         that.setData({
  //           allChecked: false,
  //           checkboxtext: '全选',
  //         })
  //         return
  //       }
  //     }
  //   }
  //   arr.push(str)
  //   if (arr.length == that.data.unResult.length) {
  //     that.setData({
  //       allChecked: true,
  //       checkboxtext: '取消全选',
  //       checked:true
  //     })
  //   }
  //   that.setData({
  //     Arr: arr,
  //   })

  // },
  // allCheckboxChange: function(e) {
  //   var that = this
  //   that.setData({
  //     Arr: [],
  //     checkboxtext: '全选',
  //     allChecked: !that.data.allChecked,
  //     checked:false
  //   })
  //   if (that.data.allChecked) {

  //     var item;
  //     var Arr = that.data.Arr
  //     for (var i = 0; i < that.data.unResult.length; i++) {
  //       item = that.data.unResult[i]
  //       Arr.push(item.eInvoiceCode + '-' + item.eInvoiceNumber + '-' + item.randomNumber)

  //     }
  //     that.setData({
  //       checkboxtext: '取消全选',
  //       Arr: Arr,
  //       checked:true
  //     })
  //   }

  // },
  // collectBtn() {
  //   var that = this
  //   if(that.data.Arr.length <1 ){
  //     that.setData({
  //       toast: '请选择要归集的票据',
  //     })
  //     util.showToast(that)
  //     return
  //   }
  //   var data = {
  //     ids: that.data.Arr
  //   }
  //   commons.loginRequest(global.custom_collectNInvoice_url, data, 'POST')
  //     .then(res => {
  //       if (res.data.resultCode == '0000') {
  //         that.setData({
  //           toast: res.data.message,
  //           allChecked: false,
  //           checkboxtext: '全选',
  //           Arr: []
  //         })
  //         util.showToast(that)

  //         that.getUnvoucherPage(that.data.options)
  //       } else if (res.data.resultCode == '2002') {
  //         wx.removeStorage({
  //           key: 'identityToken',
  //         })
  //         wx.removeStorage({
  //           key: 'userInfo',
  //         })
  //         wx.navigateTo({
  //           url: "/pages/firstPage/firstPage"
  //         })
  //       }
  //     }).catch(res => {
  //       if (res.errMsg == "request:fail 请求超时") {
  //         wx.showModal({
  //           title: '提示',
  //           content: global.overTime,
  //           showCancel: false
  //         })
  //         return
  //       } else if (res.errMsg.substring(0, 12) == "request:fail") {
  //         wx.showModal({
  //           title: '提示',
  //           content: global.nowork,
  //           showCancel: false
  //         })
  //       } else if (res.errMsg == 'nologin') {
  //         if (!that.data.isNormalClose) {
  //           that.setData({
  //             isNormalClose: true,
  //           })
  //         } else {
  //           that.setData({
  //             isNormalClose: false,
  //           })
  //           wx.navigateTo({
  //             url: '/pages/firstPage/firstPage',
  //           })
  //         }


  //       }
  //     })
  // }
})