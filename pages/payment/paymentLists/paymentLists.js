// pages/payment/paymentLists/paymentLists.js
// pages/paymentList/paymentList.js
import {
  commons
} from '../../../common/js/commons.js'
var util = require('../../../common/js/util.js')
var global = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    agencyName: '',
    pageNum: 1,
    dataList: [],
    abnorShow: 'hide',
    isLoadmore: false,
    $toast: {
      show: false
    },
    circleShow: false,
    tapSendOther: true, //发送给他人 按钮时候显示 true是显示
    totalNum: 0, //复选框选中几张票
    totalMoney: 0, //复选框选中的票价值多少钱
    totalArr: [],
    Arr: [],
    checked: false,
    checkboxtext: '全选',
    sec: '发送验证码',
    disable: false,
    phone: '',
    code: '',
    isclear: false,
    showAll: '0', //是否全选 全选 是1
    allChecked: false,
    setTimes: '',
    showDialog:false,//发送给他人弹框 时候是显示的 //是否禁止页面滚动
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      pageNum: 1
    })
    this.isLoginState()

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



  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function() {
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
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
            url: '../firstPage/firstPage',
          })
        } else {

          this.getPaymentList(this.data.agencyName, this.data.pageNum)
        }

      }).catch(res => {
        wx.hideNavigationBarLoading()
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
        } else if (res.errMsg == 'nologin') {
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }
      })

  },
  getPaymentList: function(agencyName, pageNum) {
    commons.loginRequest(global.paymentList_url, {
        agencyName: agencyName,
        page: pageNum,
        voucherStatus: 1,
        showAll: this.data.showAll
      }, 'POST')
      .then(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.data.resultCode == '0000') {
          if (this.data.pageNum == 1 && res.data.data[0].resultVOList.length < 1) {
            this.setData({
              abnorShow: 'show',
              dataList: [],
              isLoadmore: false
            })
          } else if (this.data.pageNum == 1) {
            this.data.dataList = []
            var datA = res.data.data[0].resultVOList
            this.setData({
              dataList: datA,
              abnorShow: 'hide',
            })
            if (res.data.data[0].totalPage == this.data.pageNum &&
              res.data.data[0].totalPage != 0) {
              this.setData({
                isLoadmore: true
              })
            } else {
              this.setData({
                isLoadmore: false
              })
            }
            if (this.data.showAll == '1') {
              for (var item of this.data.dataList) {
                this.data.totalNum += item.count
                this.data.totalMoney += item.aoumt
                for (var val of item.list) {
                  this.data.totalArr.push(val.id)
                  this.data.Arr.push({
                    id: val.id,
                    money: val.amount
                  })
                }
              }
              this.setData({
                totalMoney: this.data.totalMoney,
                totalNum: this.data.totalNum,
                totalArr: this.data.totalArr,
                Arr: this.data.Arr,
                isLoadmore: true
              })
            }
          } else {
            if (res.data.data[0].totalPage == this.data.pageNum &&
              res.data.data[0].totalPage != 0) {
              this.setData({
                isLoadmore: true
              })
            } else {
              this.setData({
                isLoadmore: false
              })
            }
            this.setData({
              dataList: this.data.dataList.concat(res.data.data[0].resultVOList),
              abnorShow: 'hide',
              toast: res.data.message
            })
            util.showToast(this)
          }

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
        } else {
          that.setData({
            toast: res.data.message
          })
          util.showToast(this)
        }

      }).catch(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
  },
  blankTap(e) {
    if (e.detail.value.length < 1) {
      this.setData({
        agencyName: '',
        pageNum: 1
      })
      this.getPaymentList('', this.data.pageNum);
    }
  },
  searchAgency(e) {
    // console.log('confirm: ', e.detail.value)
    this.setData({
      agencyName: e.detail.value,
      pageNum: 1
    })
    this.getPaymentList(e.detail.value, this.data.pageNum);
  },

  jumpDetail: function(e) {
    var item = this.data.dataList[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '/pages/payment/paymentDetail/paymentDetail?id=' + e.currentTarget.dataset.id + '&agencyCode=' + item.agencyCode + '&uniqueCode=' + item.uniqueCode + '&voucherNumber=' + item.list[e.currentTarget.dataset.idx].voucherNumber,
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
    if (!this.data.showDialog){
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        pageNum: 1,
        allChecked: false,
        totalArr: [],
        totalMoney: 0,
        totalNum: 0,
        Arr: [],
        showAll: '0',
        checked: false,
        checkboxtext: '全选'
      })
      this.getPaymentList(this.data.agencyName, this.data.pageNum)
    }else{
      wx.stopPullDownRefresh()
    }
   
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {


    if (!this.data.isLoadmore && this.data.showAll == '0' && !this.data.showDialog) {
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getPaymentList(this.data.agencyName, this.data.pageNum)
    }


  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /*
   * 选择具体日期
   */
  tapDayTap(e) {
    var that = this
    var year = e.detail.year + ''
    var month = e.detail.month + ''
    var day = e.detail.day + ''
    that.setData({
      curYear: e.detail.year,
      curMonth: e.detail.month,
      curDate: e.detail.day,
      agencyName: year + '-' + month + '-' + day,
      isclear: true,
      totalMoney: 0,
      totalNum: 0,
      totalArr: [],
      Arr: [],
      checkboxtext: '全选',
      showAll: '0',
      allChecked: false,
      checked: false,
      pageNum: 1
    })
    this.getPaymentList(that.data.agencyName, that.data.pageNum);


  },
  checkboxChange: function(e) {
    var id = e.target.id
    var money = e.target.dataset.m
    var that = this
    var arr = that.data.Arr
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
          var mon = that.data.totalMoney - arr[i].money
          arr.splice(i, 1)
          that.data.totalArr.splice(i, 1)

          that.setData({
            allChecked: false,
            checkboxtext: '全选'
          })

          that.setData({
            totalNum: arr.length,
            totalMoney: mon
          })
          return
        }

      }
    }
    arr.push({
      id: id,
      money: money
    })
    that.data.totalArr.push(id)

    var mon = that.data.totalMoney + money
    var index = 0
    for (var item of that.data.dataList) {
      for (var val of item.list) {
        index++
      }
    }
    if (that.data.totalArr.length == index && that.data.isLoadmore) {
      that.setData({
        allChecked: true,
        checkboxtext: '取消全选'
      })
    }
    that.setData({
      totalNum: arr.length,
      totalMoney: mon
    })
  },
  allCheckboxChange: function(e) {
    var that = this

    that.setData({
      checked: false,
      totalMoney: 0,
      totalNum: 0,
      totalArr: [],
      Arr: [],
      checkboxtext: '全选',
      showAll: '0',
      allChecked: !that.data.allChecked
    })
    if (that.data.allChecked) {

      that.setData({
        checkboxtext: '取消全选',
        showAll: '1',
        pageNum: 1,
        checked:true
      })
      that.getPaymentList(this.data.agencyName, that.data.pageNum)
    }

  },
  showBox: function() {
    if (this.data.totalNum < 1) {
      wx.showToast({
        title: '请选择票据',
        icon: 'none'
      })
      return
    }
    this.setData({
      showDialog:true
    })
    util.showDialog(this)
  },
  onConfirm() {

    var that = this
    if (that.data.phone.length < 1) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }
    if (that.data.code.length < 1) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }
   
    commons.pRequest(global.paymentSendToOtherAll_url, {
      id: that.data.totalArr,
      phone: that.data.phone,
      verifyCode: that.data.code
    }, 'post').then(res => {
      if (res.data.resultCode == '0000') {
        that.setData({
          totalNum: 0, //复选框选中几张票
          totalMoney: 0, //复选框选中的票价值多少钱
          totalArr: [],
          Arr: [],
          checked: false,
          allChecked: false,
          phone: '',
          code: '',
          pageNum: 1,
          showDialog:false,
          showAll:'0',
          sec: '发送验证码',
          disable: false
        })
        clearInterval(that.data.setTimes);
     
        util.hideDialog(that)
        that.getPaymentList(that.data.agencyName, that.data.pageNum);
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }

    }).catch(res => {
      that.setData({
        showDialog:false
      })
      util.hideDialog(this)
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
  onCancel() {
    clearInterval(this.data.setTimes);
    this.setData({
      phone: '',
      code: '',
      sec: '发送验证码',
      disable: false,
      showDialog:false
    })

    util.hideDialog(this)
  },
  //得到校验码
  getQuerycode: function() {
    var that = this;
    var phone = that.data.phone
    var time = that.data.sec

    var phoneReg = /^(13[0-9]|14[1|5|6|7|9]|15[0|1|2|3|5|6|7|8|9]|16[2|5|6|7]|17[0|1|2|3|5|6|7|8]|18[0-9]|19[1|8|9])\d{8}$/
    if (phone.length == 0) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })

    }else if (!phoneReg.test(phone)) {
     
      wx.showToast({
        title: '手机号输入错误',
        icon: 'none'
      })
    } else {
      var remain = 60; //用另外一个变量来操作秒数是为了保存最初定义的倒计时秒数，就不用在计时完之后再手动设置秒数
      

      commons.loginRequest(global.paymentGetCode_url, {
        phone: phone,
      }, 'post').then(res => {
        // console.log(res)
        if (res.data.resultCode != '0000') {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })

        }else{
          that.data.setTimes = setInterval(function () {
            if (remain == 1) {
              clearInterval(that.data.setTimes);
              that.setData({
                sec: '发送验证码',
                disable: false
              })
              return false //必须有
            } else {
              remain--;
              that.setData({
                sec: remain + 's',
                disable: true
              })
            }

          }, 1000)
        }


      }).catch(res => {
        clearInterval(that.data.setTimes);
        that.setData({
          sec: '发送验证码',
          disable: false
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
  },
  getphone: function(e) {
    this.setData({
      phone: e.detail.value.replace(/\s+/g, "")
    })
  },
  getcode: function(e) {
    this.setData({
      code: e.detail.value.replace(/\s+/g, "")
    })
  },
  clearDate: function() {
    this.setData({
      agencyName: '',
      isclear: false,
      pageNum: 1
    })
    this.getPaymentList(this.data.agencyName, this.data.pageNum);
  }

})