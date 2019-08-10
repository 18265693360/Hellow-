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
    name: [],
    addRelatedName: '',
    delRelatedName: '',
    identityToken: '',
    abnorShow: 'show',
    inputShow: 'hide',
    addOrDelorQuy: '',

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this

    wx.showNavigationBarLoading()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
      that.queryTitle()
    
    that.setData({
      addRelatedName:''
    })
  },
  
  /**
   * 删除票据抬头
   */
  invoiceTitleDel(){
    var that=this
    var invoiceTitleId = that.data.invoiceTitleId
    
    commons.loginRequest(global.invoiceTitleDel_url, {
      'invoiceTitleId': invoiceTitleId
    }, 'POST')
      .then(res => {
        // console.log(res)
       if(res.data.resultCode == '0000'){
         that.queryTitle()
        } else if (res.data.resultCode == '2002') {
          wx.removeStorage({           key: 'identityToken',         })                           
          wx.removeStorage({           key: 'loginInfoKey',         })                            
          wx.removeStorage({           key: 'userPhone',         })
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
        }
      })
  },
  /**
   * 查询票据抬头
   */
  queryTitle(){
    var that=this
    commons.loginRequest(global.invoiceTitleQueryList_url, {}, 'GET')
      .then(res => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.hideLoading()
        // console.log(res)
        if(res.data.resultCode == '0000'){
          if (res.data.data.length == 0) {
            that.setData({
              abnorShow: 'show',
              results: []
            })
          } else {
            that.setData({
              results: res.data.data,
              findResults: res.data.data,
              abnorShow: 'hide'
            })
          }
        } else if (res.data.resultCode == '2002') {
           wx.removeStorage({           key: 'identityToken',         })                          
            wx.removeStorage({           key: 'loginInfoKey',         })                            
            wx.removeStorage({           key: 'userPhone',         })
      
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }else{
          wx.showToast({
            title:res.data.message,
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
        } else if (res.errMsg == 'nologin') {
         
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }

      })
  },
  /**
   * 跳转到编辑页面
   */
  toTitleEdit(){
    var that=this
   
    wx.navigateTo({
      url: global.PAGE_TITLEEDIT+'?title=添加',
    })
  },
  

  /**
   * 删除按钮事件监听
   */
  isDelTitleTap: function (e) {
    var that = this
    var invoiceTitleId = e.currentTarget.dataset.invoicetitleid
    that.setData({
      invoiceTitleId: invoiceTitleId,
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
   * 查找票据抬头
   */
  findTitleInput(e){
    var that = this
    var results=[]
    var findTitle = e.detail.value
    var findResults = that.data.findResults
    // console.log(findResults)
    for (let i in findResults){
      if (findResults[i].partyName.indexOf(findTitle)==0){
        // console.log(findResults[i])
        results.push(findResults[i])
      }
    }
    that.setData({
      results: results
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
   * 跳转到票据抬头详情页
   */
  toTitleDetailTap(e){
    var that=this
    var item=e.currentTarget.dataset.text
    var qrcode = item.qrCodeUrl.replace(/\=/g,'*')
    item.qrCodeUrl = qrcode
    var result=JSON.stringify(item)
    wx.navigateTo({
      url: global.PAGE_TITLEDETAIL + '?result=' + result,
    })
  },

  /**
  * 验证码输入框事件监听
  */
  codeInput: function (e) {
    var that = this
    that.setData({
      code: e.detail.value
    })
  },
  
  /**
   * 验证码dialog取消按钮事件监听
   */
  dialogCancel() {
    var that = this
    that.setData({
      abnorShow: 'hide'
    })
    util.hideDialog(that)
  },

  showPopup() {
    let popupComponent = this.selectComponent('.J_Popup');
    /*popupComponent && popupComponent.show();*/
    popupComponent && popupComponent.toggle(true);
  },
  hidePopup() {
    let popupComponent = this.selectComponent('.J_Popup');
    //popupComponent && popupComponent.hide();
    popupComponent && popupComponent.toggle();
  },
  onPullDownRefresh(){
    this.queryTitle()
    wx.showLoading({
      title: '加载中...',
    })
  }
})