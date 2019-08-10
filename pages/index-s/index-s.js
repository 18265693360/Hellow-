/**
 * @param array 单位列表  被'picker'组件的range属性使用，在agencyByCity函数中赋值
 * @param index 单位列表  被'picker'组件的value属性使用，在bindPickerChange函数中赋值
 * @param city 当前选择城市 在onLoad函数中赋值
 * @param historyCitys 历史访问城市缓存数组  在cityStorage函数中赋值
 * @param queryHistoryStorage 历史查询记录缓存数组  在getQueryHistoryStorage函数中赋值
 */
var QQMapWX = require('../../assests/libs/qqmap-wx-jssdk.min.js');
var queryPages = require('../../common/js/queryPages.js');
var global = getApp().globalData;
var util = require('../../common/js/util.js')
import {
  commons
} from '../../common/js/commons.js'
Page({
  data: {
    index: 0,
    city: '请选择省份',
    cityNo: '',
    historyCitys: [],
    queryHistoryStorage: [],
    cityArray: [],
    //请求查票接口的参数
    parametersh: {
      name: '',
      card_no: '',
      microProgramPage: '',
      company: '',
    },
    //缓存数据
    storageData: {
      id: 0,
    },
    idPlaceholder: "",
    //查票按钮禁用
    btnDisable: false,
    //查票按钮显示加载状态
    btnLoading: false,
    contentHidden: true, //填写 内容是都显示
    abnorShow: true, //空白图是否显示
    microProgramPage: '',
    checkBtnText: '查找电子票', //按钮文字
    callNum: 0, //查找电子票调用次数
    cityAndCode: {
      北京: '01',
      天津: '02',
      上海: '03',
      重庆: '04',
      河北: '05',
      山西: '06',
      台湾: '07',
      辽宁: '08',
      吉林: '09',
      黑龙: '10',
      江苏: '11',
      浙江: '12',
      安徽: '13',
      福建: '14',
      江西: '15',
      山东: '16',
      河南: '17',
      湖北: '18',
      湖南: '19',
      广东: '20',
      甘肃: '21',
      四川: '22',
      贵州: '23',
      海南: '24',
      云南: '25',
      青海: '26',
      陕西: '27',
      广西: '28',
      西藏: '29',
      宁夏: '30',
      新疆: '31',
      内蒙: '32',
      澳门: '33',
      香港: '34'
    },
    scene: '', //判断是否是从二维码进来的
    isEditID: false //id input是否可以编辑
  },
  onLoad: function(options) {
    var that = this
    if (options.scene) {
      that.setData({
        "parametersh.agencyCode": options.scene,
        "storageData.agencyCode": options.scene,
        scene: options.scene
      })
      that.codeForAgencyName(options.scene)

      //判断是否登录
      that.isLoginState()

    } else if (options.agencyName){
      that.loginByIdentityToken()
      that.setData({
        "parametersh.company": options.agencyName,
        "parametersh.agencyCode": options.agencyCode,
        "parametersh.microProgramPage": options.page,
        "storageData.company": options.agencyName,
        "storageData.agencyCode": options.agencyCode,
        "storageData.microProgramPage": options.page,
        microProgramPage:options.page,
        contentHidden: false, //填写 内容是都显示
        abnorShow: false, //空白图是否显示
      })
    } else {
      that.loginByIdentityToken()
      //that.getLocation()
    }

    

  },
  onShow: function(options) {
    var that = this
    commons.getStorage('userPhone').then(res => {
      that.setData({
        userPhone: res.data,
      })
      if (that.data.microProgramPage == 'hospital_phone') {
        that.setData({
          'parametersh.card_no': res.data,
          'storageData.card_no': res.data,
        })
      }
    })
    commons.getStorage('loginInfoKey')
      .then(res => {
        if (res.data.userInfo.name) {
          that.setData({
            'parametersh.name': res.data.userInfo.name,
          })
        }
      })
    
  },
  //判断是否是登录状态 需不需要跳转到 登录注册页面
  isLoginState: function() {
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
      .then(res => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
        if (res.data.resultCode == '2002') {
          wx.removeStorage({ key: 'identityToken', })
          wx.removeStorage({ key: 'loginInfoKey', })
          wx.removeStorage({ key: 'userPhone', })
          wx.navigateTo({
            url: '../firstPage/firstPage',
          })
        }

      }).catch(res => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
       wx.removeStorage({             key: 'identityToken',           })          
        wx.removeStorage({             key: 'loginInfoKey',           })          
         wx.removeStorage({             key: 'userPhone',           })
        wx.navigateTo({
          url: '../firstPage/firstPage',
        })
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
  //根据城市编码去过去 城市名称 等信息
  codeForAgencyName: function(scene) {
    var that = this
    commons.pRequest(global.queryCompanysByAgencyId_url, {
      agencyId: scene,
    }, 'GET')
    .then(res => {
      var data = res.data
      if (data.resultCode == '0000') {
        var microProgramPage = ''
        if (data.data[0].microProgramPage) {
          microProgramPage = data.data[0].microProgramPage
          that.setData({
            microProgramPage: microProgramPage
          })
          if (microProgramPage == 'hospital_phone') {
            that.setData({
              'parametersh.card_no': that.data.userPhone,
              'storageData.card_no': that.data.userPhone,
            })
          }
          that.setData({
            "parametersh.microProgramPage": data.data[0].microProgramPage || '',
            "storageData.microProgramPage": data.data[0].microProgramPage || '',
            'parameters[0].agencyName': data.data[0].agencyName || '',
            "parametersh.company": data.data[0].agencyName || '',
            "storageData.company": data.data[0].agencyName || '',
            "parametersh.agencyCode": data.data[0].agencyCode || '',
            "storageData.agencyCode": data.data[0].agencyCode || '',
            city: data.data[0].cityName || '',
            "storageData.city": data.data[0].cityName || '',
            contentHidden: false,
            abnorShow: false,
          })
        }

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
  loginByIdentityToken: function() {
    var that = this
    commons.loginRequest(global.loginOrRegistByToken_url, {}, 'POST')
      .then(res => {
        wx.hideToast();
        // console.log(res)
        if (res.data.resultCode == '-1') {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
        if (res.data.resultCode == '2002') {
          wx.hideToast();
          that.setData({
            $toast: {
              show: false
            }
          })
          wx.removeStorage({ key: 'identityToken', })
          wx.removeStorage({ key: 'loginInfoKey', })
          wx.removeStorage({ key: 'userPhone', })
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }
        if (res.data.resultCode == '0000') {
          that.getQueryHistoryStorage()
        }
      })
      .catch(res => {

        wx.hideToast();
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

  
  bindPickerChangeHistory: function(e) {
    var that = this
    var i = e.detail.value;
    var history = that.data.queryHistoryStorage[i] || { microProgramPage:''}
    var pageName = history.microProgramPage 
    that.setData({
      microProgramPage: pageName
    })
    if (history.card_no) {
      if (pageName == 'hospital_phone') {
        that.setData({
          'parametersh.card_no': that.data.userPhone,
          'storageData.card_no': that.data.userPhone,
        })
      }
      that.setData({
        "parametersh.company": history.company,
        "parametersh.microProgramPage": history.microProgramPage,
        "parametersh.card_no": history.card_no,
        "parameters[0].agencyName": history.company,
        "parametersh.agencyCode": history.agencyCode,
        'parametersh.name': history.name,
        'storageData.name': history.name,
        city: history.city,
        contentHidden: false, //填写 内容是都显示
        abnorShow: false, //空白图是否显示
      })
    } else {
      that.setData({
        toast: '暂无历史取票单位',
        abnorShow: true, //空白图是否显示
      })
      util.showToast(that)
    }

  },
  //socialCardInput输入事件监听
  socialCardInput: function(e) {
    var that = this
    that.setData({
      'parametersh.card_no': e.detail.value,
      'storageData.card_no': e.detail.value,
    })
  },

  nameInput: function(e) {
    var that = this
    that.setData({
      'parametersh.name': e.detail.value,
      'storageData.name': e.detail.value,
    })
  },
  //'查找电子票'按钮点击事件
  checkTap: function() {
    var that = this
    var parameters = that.data.parametersh

    //判断用户是否输入用户名和密码
    if (parameters.name.length == 0) {
      that.setData({
        toast: '请输入姓名'
      })
      util.showToast(that)
    } else if (parameters.card_no.length == 0) {
      that.setData({
        toast: '请输入用户编号'
      })
      util.showToast(that)
    } else {
      that.setData({
        btnDisable: true,
        btnLoading: true,
        checkBtnText: '正在接收票据中，请稍等...'
      })
      that.queryEleInvoice()
    }

  },
  //查找电子票axjx
  queryEleInvoice: function() {
    var that = this
    var storageData = that.data.storageData
    var parameters = that.data.parametersh
    commons.loginRequest(global.queryEInvocieList_url, parameters, 'GET')
      .then(res => {
        // console.log(res)
        var result = res.data
        if (result.resultCode == '-1') {
          that.setData({
            toast: result.message
          })
          util.showToast(that)
          that.setData({
            btnDisable: false,
            btnLoading: false,
            checkBtnText: '查找电子票',
            callNum:0
          })
        } else if (result.resultCode == '5001') {
          that.setData({
            toast: result.message
          })
          util.showToast(that)
          that.setData({
            btnDisable: false,
            btnLoading: false,
            checkBtnText: '查找电子票',
            callNum:0
          })
        } else if (result.resultCode == '5002') {

          if (that.data.callNum == 3) {
            that.setData({
              toast: '电子票据未接收完成,请稍后重试'
            })
            util.showToast(that)
            that.setData({
              btnDisable: false,
              btnLoading: false,
              checkBtnText: '查找电子票',
              callNum:0
            })
          } else {
            setTimeout(function() {
              that.queryEleInvoice()
            }, 3000)

            that.setData({
              callNum: that.data.callNum + 1
            })
          }

        } else if (result.resultCode == '0000') {
          queryPages.queryHistoryStorage(storageData)
          that.setData({
            btnDisable: false,
            btnLoading: false,
            checkBtnText: '查找电子票',
            callNum:0
          })
          wx.navigateTo({
            url: '../getInvoiceSuccess/getInvoiceSuccess?num=' + res.data.num,
          })

        } else if (res.data.resultCode == '2002') {
          wx.removeStorage({ key: 'identityToken', })
          wx.removeStorage({ key: 'loginInfoKey', })
          wx.removeStorage({ key: 'userPhone', })
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }

        //queryPages.queryHistoryStorage(storageData)
      }).catch(res=>{
        that.setData({
          btnDisable: false,
          btnLoading: false,
          checkBtnText: '查找电子票',
        })
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
        } else if (res.errMsg == "nologin"){
          wx.navigateTo({
            url: '/pages/firstPage/firstPage',
          })
        }
      })
  },

  /** 
   *  获取查询历史记录缓存函数
   */
  getQueryHistoryStorage: function() {
    var that = this
    wx.getStorage({
      key: 'queryHistory',
      success: function(res) {
        if (res.data[0].company) {
          that.setData({
            queryHistoryStorage: res.data
          })
        } else {
          that.setData({
            "queryHistoryStorage.company": '没有历史取票单位'
          })
        }


      },
      fail: function(res) {
        that.setData({
          "queryHistoryStorage.company": '没有历史取票单位'
        })
      }
    })
  },

  /**
   * 历史访问城市缓存函数
   */
  cityStorage: function() {
    var that = this
    wx.getStorage({
      key: 'historyCitys',
      success: function(res) {
        that.setData({
          historyCitys: res.data
        })
        var historyCitys = that.data.historyCitys
        var city = that.data.city
        var cityNo = that.data.cityNo
        var flage = true
        for (let i in historyCitys) {
          if (historyCitys[i].cityName == city) {
            flage = false
          }
        }
        if (flage) {
          if (historyCitys.length >= 6) {
            for (var j = historyCitys.length - 1; j > 0; j--) {
              historyCitys[j] = historyCitys[j - 1]
            }
            historyCitys[0] = {
              cityCode: cityNo,
              cityName: city
            }
          } else {
            historyCitys.push({
              cityCode: cityNo,
              cityName: city
            })
          }
        }
        wx.setStorage({
          key: 'historyCitys',
          data: historyCitys,
        })
      },
      fail: function(res) {
        var city = that.data.city
        var cityNo = that.data.cityNo
        var historyCitys = that.data.historyCitys
        historyCitys.push({
          cityCode: cityNo,
          cityName: city
        })
        wx.setStorage({
          key: 'historyCitys',
          data: historyCitys,
        })
      }
    })
  },

  /**
   * 根据城市查询单位函数
   */
  agencyByCity: function() {
    var that = this;
    var pageName = that.data.parametersh.microProgramPage
    that.setData({
      microProgramPage: pageName
    })
    if (pageName == 'hospital_phone') {
      that.setData({
        'parametersh.card_no': that.data.userPhone,
        'storageData.card_no': that.data.userPhone,
      })
    }
    
  },
  onHide: function() {
    
  },
  onPullDownRefresh() {
    this.isLoginState()
    wx.showLoading({
      title: '加载中...',
    })
  }
})