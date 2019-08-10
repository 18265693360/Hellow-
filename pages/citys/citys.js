/**
 * @param location  当前定位城市  在getLocation函数中赋值
 * @param hotCitys 热门城市数组  在requestCitys函数中赋值
 * @param historyCitys  历史访问城市数组 在getCityStorage函数中赋值
 * @param toast 提示框信息
 * @param $toast 提示框弹出
 */
var QQMapWX = require('../../assests/libs/qqmap-wx-jssdk.min.js');
var global = getApp().globalData;
import {
  commons
} from '../../common/js/commons.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    location: '',
    hotCitys:[],
    historyCitys:[],
    toast: '',
    $toast: {
      show: false
    },
    parameters:[],
    city:'',//当前选中的城市
    idx:66,//当前选中城市中的第几个
    cityName:'',
    company:'',
    //下面是字母排序
    letter: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z","#"],
    cityListId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //定位当前城市函数
    // that.getLocation()
    // //获取历史访问城市缓存函数
    // that.getCityStorage()
    //请求城市列表函数
    that.requestCitys()
    wx.showNavigationBarLoading()
    
  },
  //请求城市列表函数
  requestCitys:function(){
    var that = this
    commons.pRequest(global.querySupportCitys_url,{},'GET')
    .then(res=>{
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
      wx.hideLoading()
      if (res.data.resultCode == '-1') {
        that.setData({
          toast: res.data.message
        })
        that.showToast()
      } else {
       
          that.setData({
            hotCitys: res.data.data,
            city: '',
            idx:'66'
          })
        that.agencyByCity()
      }  
    }).catch(res=>{
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
      wx.hideLoading()
      if (res.errMsg  == "request:fail 请求超时") {
        wx.showModal({
          title: '提示',
          content:global.overTime,
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
   * 根据城市查询单位函数
   */
  agencyByCity: function (e) {
    var that = this;
    if(e){
      if (e.target.id == '66'){
        that.setData({
          city: '',
          cityName: '',
          idx: e.target.id,

        })
      }else{
        that.setData({
          city: that.data.hotCitys[e.target.id].cityCode || '',
          cityName: that.data.hotCitys[e.target.id].cityName,
          idx: e.target.id,
        })
      }
      
    }
   
    commons.pRequest(global.queryCompanysByCity_url, {
      'cityCode': that.data.city
    }, 'GET').then(res => {
      if (res.data.resultCode == '0000') {

          if (res.data.data.length != 0) {
            that.setData({
              parameters: res.data.data,
              contentHidden: false,
              abnorShow: false,
            })
          } else {
            that.setData({
              // 'parameters[0].agencyName': '本省暂无开票单位',
              parameters: [],
              contentHidden: true,
              abnorShow: true,
            })
          }
        
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })

      }
    }).catch(res => {
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
  
  // //获取历史访问城市缓存函数
  // getCityStorage:function(){
  //   var that = this
  //   wx.getStorage({
  //     key: 'historyCitys',
  //     success: function (res) {
  //       that.setData({
  //         historyCitys: res.data
  //       })
  //     },
  //   })
  // },
  
  //提示框函数
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
  gotoresult:function (e) {
    var that = this
    var item = that.data.parameters[e.currentTarget.dataset.id].data[e.target.id]
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    that.setData({
      company: item.agencyName
    })

    prevPage.setData({
      "parametersh.company": item.agencyName,
      "parametersh.agencyCode": item.agencyCode,
      "parametersh.microProgramPage": item.microProgramPage,
      "storageData.company": item.agencyName,
      "storageData.agencyCode": item.agencyCode,
      "storageData.microProgramPage": item.microProgramPage,
      "storageData.city": this.data.city,
      contentHidden: false,
      abnorShow: false,
    })
    //调用历史访问城市缓存方法
    prevPage.cityStorage()
    //根据城市请求单位
    prevPage.agencyByCity()
    wx.navigateBack({
    })
  },

  onPullDownRefresh(){
    var that = this
    //请求城市列表函数
    wx.stopPullDownRefresh()
    that.requestCitys()
    wx.showLoading({
      title: '加载中...',
    })
  },
  letterTap(e){
    var that = this
    that.setData({
      cityListId: e.target.dataset.item
    })
  }
})