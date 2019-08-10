var global = getApp().globalData;
var util = require('../../../common/js/util.js')
import { commons } from '../../../common/js/commons.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      { title: '医疗费' },
      { title: '学校费' },
      { title: '出行费' },
      { title: '出差费' },
    ],
    selectIndex: [],
    ifCheckAll: false,
    abnorShow: 'hide',
    countSelect:0,
    countAmount:0,
    ids:'',
    partyName:'',
    tongyi:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断是否登录
    this.isLoginState()
    // this.querySaleItems()
    wx.showNavigationBarLoading()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that=this
    that.querySaleItems()
  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function () {
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
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
            url: '/pages/firstPage/firstPage',
          })
        }

      }).catch(res => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
        wx.hideNavigationBarLoading()
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
  /**
   * 查询单位列表
   */
  querySaleItems() {
    var that = this

    commons.loginRequest(global.querySaleItems_url,{},'GET')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        // console.log(res)
        // if (res.data.resultCode == '2002') {
        //   wx.clearStorage()

        //   wx.navigateTo({
        //     url: '/pages/firstPage/firstPage',
        //   })
        // }
        if(res.data.resultCode == '0000'){
         
          if (res.data.data.length > 0) {
            for (let i in res.data.data) {
              if (res.data.data[i].datetime) {
                var year = res.data.data[i].datetime.substring(0, 4) + '-'
                var month = res.data.data[i].datetime.substring(4, 6) + '-'
                var day = res.data.data[i].datetime.substring(6, 8)
                var time = res.data.data[i].datetime.substring(9, 17)
                var date = year + month + day + ' ' + time
                res.data.data[i].datetime = date
              }
            }
            that.setData({
              abnorShow: 'hide',
              footShow: true,
              resultList: res.data.data
            })
            // console.log(that.data.resultList[0])
          } else if (res.data.data.length == 0 ) {
            that.setData({
              abnorShow: 'show',
              footShow: false,
              resultList: [],
            })
          } 
        } else if (res.data.resultCode == '-1') {
          that.setData({
            toast: res.data.message,
            abnorShow: 'show',
            footShow: false,
          })
          util.showToast(that)
        }
        
      })
      .catch(res=>{
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        // if (res.errMsg == "request:fail 请求超时") {
        //   wx.showModal({
        //     title: '提示',
        //     content: global.overTime,
        //     showCancel: false
        //   })
        //   return
        // } else if (res.errMsg.substring(0, 12) == "request:fail") {
        //   wx.showModal({
        //     title: '提示',
        //     content: global.nowork,
        //     showCancel: false
        //   })
        // } 

      })
  },
  /**
   * 下一步按钮点击
   */
  toMakeEInvoicePage(){
    var that=this
    var commont = that.data.tongyi
    var countAmount = that.data.countAmount
    var ids=that.data.ids
    var partyName = that.data.partyName
    var agencyCode = that.data.agencyCode
    if (countAmount==0){
      that.setData({
        toast: '请选择流水明细！'
      })
      util.showToast(that)
    } else if (commont){
      wx.navigateTo({
        url: global.PAGE_MAKEEINVOICEPAGE + '?amount=' + countAmount + '&ids=' + ids + '&partyName=' + partyName + '&agencyCode=' + agencyCode ,
      })
    } else if (!commont){
      that.setData({
        toast: '请选择同一销方公司'
      })
      util.showToast(that)
    }
    
  },
  /**
   * 选项卡点击
   */
  onClick: function (e) {
    var that = this
    // console.log(`ComponentId:${e.detail.componentId},you selected:${e.detail.key}`);
    that.setData({
      ifCheckAll: false
    })
    if (e.detail.key == 0) {
      that.querySaleItems()
    } else if (e.detail.key == 1) {
      
    } else if (e.detail.key == 2) {
      
    } else if (e.detail.key == 3) {
     
    }
  },
  /**
   * checkbox改变事件监听
   */
  checkboxChange: function (e) {
    var that = this
    var index = e.detail.value
    var resultList=that.data.resultList
    if(index.length != resultList.length){
      that.setData({
        ifCheckAll: false,
      })
    }else{
      that.setData({
        ifCheckAll: true,
      })
    }
    // console.log(resultList)
    var countAmount = 0
    var ids=''
    var firstTax = ''//第一个税号
    // console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    if(index.length > 0){
      firstTax = resultList[index[0]].fsaleTaxNumber
    }
    for (let i in index){
      var p=index[i]
      var id=resultList[p].id
      var tax = resultList[p].fsaleTaxNumber  
      if(firstTax != tax){
        that.setData({
          toast: '请选择同一销方公司',
          tongyi:false,
        })
        util.showToast(that)
        return;
      }
      var StringAmount = resultList[p].amount
      countAmount += parseFloat(StringAmount);
      ids=ids+id+','
    }
    
    that.setData({
      selectIndex: index,
      countSelect:index.length,
      countAmount: countAmount.toFixed(2),
      ids:ids,
      tongyi: true,
    })
    if(index.length > 0){
      that.setData({
        partyName: resultList[index[0]].partyName,
        agencyCode: resultList[index[0]].agencyCode,
      })
    }else{
      that.setData({
        partyName: '',
        agencyCode: '',
      })
    }
    // console.log(that.data.ids)
    
  },
  /**
   * 全选
   */
  checkAll: function () {
    var that = this
    var ifCheckAll = that.data.ifCheckAll
    var resultList = that.data.resultList
    var selectIndex = []
    var countAmount = 0
    var ids = ''
    if (ifCheckAll) {
      for (let i in resultList) {

        var item = 'resultList[' + i + '].checked'
        that.setData({
          [item]: false,
          ifCheckAll: false,
        })
      }
      that.setData({
        selectIndex: [],
        countAmount: countAmount,
        countSelect:0,
        ids:'',
       
      })
      // console.log(that.data.selectIndex)
    } else {
      for (let i in resultList) {
        if (resultList[0].fsaleTaxNumber != resultList[i].fsaleTaxNumber) {
          that.setData({
            toast: '请选择同一销方公司',
            tongyi: false,
          })
          util.showToast(that)
          return;
        }
        var item = 'resultList[' + i + '].checked'
        var id=resultList[i].id
        var ArrayAmount = resultList[i].amount
        var amount = parseFloat(ArrayAmount);
        countAmount = countAmount + amount
        ids=ids+id+','
        that.setData({
          [item]: true,
          ifCheckAll: true
        })
        selectIndex.push(i)
      }
      that.setData({
        selectIndex: [],
        countAmount: countAmount.toFixed(2),
        countSelect: resultList.length,
        ids:ids,
        partyName: resultList[0].partyName,
        tongyi: true,
      })
    }
    // console.log(that.data.ids)
  },
  /**
   * 取消全选
   */
  cancelCheckAll: function () {
    var that = this
    var resultList = that.data.resultList
    var selectIndex = that.data.selectIndex
    for (let i in resultList) {
      var item = 'resultList[' + i + '].checked'
      that.setData({
        [item]: false
      })
    }
    that.setData({
      selectIndex: []
    })
    // console.log(that.data.selectIndex)
  },
  /**
   * 登陆dialog确定按钮事件监听
   */
  dialogPhone: function (e) {
    var that = this
    var encryptedData = e.detail.encryptedData
    var options = that.data.options
    if (e.detail.encryptedData) {
      return commons.phoneLogin(e)
        .then(res => {
          // console.log(res)
          if (res.data.status == 'login' || res.data.status == 'incomplete') {
            commons.putStorage('identityToken', res.data.identityToken)
            commons.putStorage('loginInfoKey', res.data)
            util.hideDialog(that)
            that.querySaleItems()
          }
        })
    } 
  },
  /**
   * 登陆dialog取消按钮事件监听
   */
  dialogCancelLogin() {
    var that = this
    util.hideDialog(that)
    wx.switchTab({
      url: global.PAGE_HOME,
    })
  },
  dialogConfirmLogin() {
    var that = this
    util.hideDialog(that)

  },
  jumpGetInvoive(){
    wx.navigateTo({
      url: '/pages/openInvoiceHistory/openInvoiceHistory',
    })
  },
  onPullDownRefresh(){
    this.querySaleItems()
    this.setData({
      countSelect:0,
      countAmount:0,
      ids: '',
      ifCheckAll: false,
    })
    wx.showLoading({
      title: '加载中...',
    })
  }
})