// pages/home/home.js
var global = getApp().globalData;
var util = require('../../common/js/util.js')
var { commons } = require('../../common/js/commons.js')
Page({
  data: {
    res: {},
    parameters: {},
    avatarUrl: '/assests/images/icon-avatar.png',
    badge_max:99,
    ifAvatarUrl: false,
    code:'',
    userPhone:'',
    goFirstPage:false,
    footerTip:true,
    footerText:'马上实名认证，便享更轻松的归集方式',
    realAddress:'../admin/realNameAuth/realNameAuth',
    item:0,//选中主页的那个功能
    buttonClicked1:true,
    buttonClicked2:true,
    buttonClicked3: true,
    buttonClicked4: true,
    buttonClicked5:true,
    relationCompanyArr:[],
    isMore: true,//固定的定制单位是否 显示
  },
  onLoad: function (options) {
    var that = this
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      wx.navigateTo({
        url: '/pages/index-s/index-s?scene='+scene,
      })
    }else{
      that.isLoginState()
    }
   
    
  },
  onShow: function () {
    var that = this
    that.data.item = 0
    wx.showNavigationBarLoading()//在标题栏中显示加载
   //commons.getLoginStatus(that)
   wx.getStorage({
     key: 'identityToken',
     success: function(res) {
       that.getRelationCompany()
     },
   })
    commons.getStorage('loginInfoKey')
      .then(res => {
        if (res.data.userInfo.idCard && res.data.userInfo.idCard != '000000000000000000'){
          that.setData({
            footerText: '已实名认证',
            realAddress: '/pages/admin/privateInfo/privateInfo',
            footerTip: true
          })
        }else{
          that.setData({
            footerText: '马上实名认证，便享更轻松的归集方式',
            realAddress: '../admin/realNameAuth/realNameAuth',
            footerTip: true
          })
        }
        that.setData({
          userPhone: res.data.userInfo.phone,
        })
          wx.hideNavigationBarLoading()
      }).catch(res=>{
        that.setData({
          footerTip:false,
          userPhone: '',
        })
        wx.hideNavigationBarLoading()
      })
     
  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function () {
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
    .then(res=>{
      wx.stopPullDownRefresh() //停止下拉刷新
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
      }else{
        switch(this.data.item){
          case 3:{
            wx.navigateTo({
              url: global.PAGE_INDEX,
            })
            break;
          }
          case 4:{
            wx.navigateTo({
              url: global.PAGE_MAKEEINVOICEDETAIL,
            })
            break;
          }
          case 5:{
            wx.navigateTo({
              url: '/pages/payment/paymentList/paymentList',
            })
            break;
          }
          case 6:{
            wx.navigateTo({
              url: '/pages/index/index?agencyCode=' + this.data.code,
            })
            break;
          }
          case 7:{
            wx.navigateTo({
              url: '/pages/customCompany/customCompany',
            })
            break;
          }
        }

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
      } 
      wx.hideLoading()
      wx.stopPullDownRefresh() //停止下拉刷新
      if (res.errMsg == 'nologin'){
        wx.navigateTo({
          url: '/pages/firstPage/firstPage',
        })
      }
    })

    
  },
  
 
  /**
   * “查票”按钮事件监听
   */
  checkTap: function () {
    //自助取票
    util.buttonClicked(this,'buttonClicked2')
    this.data.item = 3
    this.isLoginState()
  },
  makeEinvoiceTap(){
    //自助开票
    this.setData({
      item: 4
    })
    util.buttonClicked(this,'buttonClicked3')
    this.isLoginState()
    
   
  },
  /**
   * “扫码”按钮事件监听
   */
  scanCodeTap: function () {
    var that = this
    wx.scanCode({
      success: (res) => {
     
        var qrCode=res.result
        
        commons.pRequest(global.qrInfo_url, {
          qrCode: qrCode
        }, 'GET')
        .then(res=>{
          // console.log(res)
          if(res.data.resultCode == '-1'){
            that.setData({
              toast:res.data.message
            })
            util.showToast(that)
            return;
          }else if(res.data.resultCode == '0000'){
            if (res.data.data[0].invoiceInfo) {
              wx.navigateTo({
                url: global.PAGE_BILLDETAIL + '?qrCode=' + qrCode,
              })
            } else if (res.data.data[0].eInvoiceInfo) {//财票
              wx.navigateTo({
                url: global.PAGE_EINVOICEDETAIL + '?qrCode=' + qrCode,
              })
            }
          }
          
        }).catch(res=>{
          if (res.errMsg == "request:fail 请求超时") {
            wx.showModal({
              title: '提示',
              content: '网络请求超时，请重试',
              showCancel: false
            })
            return
          } else if (res.errMsg.substring(0, 12) == "request:fail") {
            wx.showModal({
              title: '提示',
              content: '网络错误，请稍后重试',
              showCancel: false
            })
          } 
        })
      },
      fail:(res)=>{
        
      }
    })
  },
  /**
   * “票号票代码查票”按钮事件监听
   */
  eInvoiceTap: function () {
    util.buttonClicked(this,'buttonClicked1')
    wx.navigateTo({
      url: global.PAGE_EINVOICE,
    })
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  jumpAuth:function(){
    wx.navigateTo({
      url: this.data.realAddress,
    })
  },
  jumpFirstPage:function(){
    wx.navigateTo({
      url: '/pages/firstPage/firstPage',
    })
  },
  //预交金按钮
  payment:function(){
    util.buttonClicked(this,'buttonClicked4')
    this.setData({
      item:5
    })
    this.isLoginState()
    
  },
  reimbursement:function(){
    wx.showToast({
      title: '功能暂未开通',
      icon:'none'
    })
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  },
  //更多单位
  jumpMoreCompany(){
    this.data.item = 7
    this.isLoginState()
    
  },
  //跳转到单位定制页面index
  jumpCustomIndex(e){
    this.data.code = e.currentTarget.dataset.id
    this.data.item = 6
    this.isLoginState()
  },
  //首页获得关联单位
  getRelationCompany(){
    commons.loginRequest(global.custom_relationCompany_url,{},'POST')
    .then(res=>{
      if(res.data.resultCode == '0000'){
        if (res.data.data.length >= 2){
          this.setData({
            isMore:false
          })
        }
   
        this.setData({
          relationCompanyArr: res.data.data
        })
      }else{
        this.setData({
          toast: res.data.message
        })
        util.showToast(this)
      }
    }).catch(res=>{

    })
  },
})