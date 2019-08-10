import {
  request,
  Promise
} from './request-promise.js';
var util = require('./util.js');
var sessionKey = "identityToken";
var loginInfoKey = "loginInfoKey";
var unionId = "unionId";
var jsCode = "jsCode";
var global = getApp().globalData;
const commons = {
  /**
   * 获取用户自定义登陆状态，并根据用户的自定义登陆状态调整页面显示
   */

  /**
   * 异步获取缓存方法， 返回为一个Promise对象， 成功时调用then方法，失败为catch方法
   */
  getStorage: function(key, others) {
    var that = this;
    var p = new Promise((resolve, reject) => {
      wx.getStorage({
        key: key,
        success: function(res) {
          resolve(that.packagingResult(res, others));
        },
        fail: function(res) {
          reject(that.packagingResult(res, others));
        },
        complete: function(res) {},
      })
    });
    return p;
  },
  /**
   * put操作， 为异步接口， 成功后需要回调可直接.then((e)=>{})
   */
  putStorage: function(key, value) {
    var p = new Promise((resolve, reject) => {
      wx.setStorage({
        key: key,
        data: value,
        success: resolve,
        fail: reject
      })
    });
    return p;
  },
  /**
   * request 操作
   */
  pRequest: function (url, options, type) {
    var that = this;
    options.clientType = '1'
    var p = new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: options,
        method: type,
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        success: res => {
          if (res.statusCode == 200){
            resolve(res)
          } else if (res.statusCode == 404 || res.statusCode == 405){
            wx.showToast({
              title: '网络连接异常,请稍后重试',
              icon:'none'
            })
          }
          
        },
        fail: res => {
          reject(res)
        }
      })

    })
    return p;
  },


  loginRequest: function(Url, options, type) {
    var that = this;
    var _data = options;
    var p = new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'identityToken',
        success: function(res) {

            if (!res) {
              // 替换请求参数
              _data.identityToken = '';
            } else {
              // 替换请求参数
              _data.identityToken = res.data;
            }
            options = _data;
            resolve()
        },
        fail: function(res) {
          reject({errMsg:'nologin'})
         
        }
      })
    }).then(() => {
      options.clientType = '1'
      var p = new Promise((resolve, reject) => {
        wx.request({
          url: Url,
          data: options,
          method: type,
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
          success: res => {
            if (res.statusCode == 200) {
              resolve(res)
            } else if (res.statusCode == 404 || res.statusCode == 405) {
              wx.showToast({
                title: '网络连接异常,请稍后重试',
                icon: 'none'
              })
            }
          
          },
          fail: res => {
            reject(res)
            if (res.errMsg == "request:fail ") {
              wx.showModal({
                title: '提示',
                content: global.nowork,
                showCancel: false
              })
            } else if (res.errMsg == "request:fail timeout") {
              wx.showModal({
                title: '提示',
                content: global.overTime,
                showCancel: false
              })
            }
          }
        })

      })
      return p;
    })

    return p;

  },

  /**
   * 获取用户信息， 只能在登录之后使用
   */
  getUserInfo: function() {
    var that = this;
    return that.getStorage(loginInfoKey);
  },

  /**
   * 检查当前session是否有效，返回一个Promise, then方法成功时参数为本地token的值， 失败为false
   *  注：此方法只会检查本地缓存
   */
  checkSession: function(others) {
    var that = this;
    var p = new Promise((resolve, reject) => {
      that.getStorage(sessionKey)
        .then(res => {
          if (res.data) {
            resolve(that.packagingResult(res.data, others));
          } else {
            resolve(that.packagingResult(false, others));
          }
        })
        .catch(res => {
          resolve(that.packagingResult(false, others));
        });
    });
    return p;
  },

  /**
   * 检查当前session是否有效
   */
  checkSessionRemote: function() {
    var that = this;
    var remoteUrl = global.loginOrRegistByToken_url;;
    var method = 'POST';
    return that
      .wxCheckSession()
      .checkSession()
      .then(res => {
        if (!res) {
          throw new Error("没有登录");
        }
        return that.pRequest({
          url: remoteUrl,
          method: method,
          data: {
            identityToken: res
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        });
      })
      .then(res => {
        if (res.data.identityToken) {
          return res.data.identityToken
        }
        console.log("检查token失败");
        // console.log(res);
        if (res.data.errcode == 2) {
          throw new Error("身份过期")
        }
      });
  },


  /**
   * 微信自己的登录， 主要是获取openid,then参数为微信自己的参数
   */
  wxLogin: function() {
    var p = new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
    return p;
  },

  wxCheckSession: function() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: resolve,
        fail: function() {
          reject("wechat checkSession failed");
        }
      })
    });
  },

  /**
   * 微信接口， 获取微信信息， then方法参数为微信自己的参数
   */
  wxGetUserInfo: function() {
    var p = new Promise((resolve, reject) => {
      wx.getUserInfo({
        success: resolve,
        fail: reject
      })
    });
    return p;
  },
  /**
   * 每次请求都会带上unionId的加密数据
   */
  unionIdRequest: function(options) {
    var _this = this
    return _this.wxLogin()
      .then(res => {
        // console.log(res)
        var code = res.code
        if (code) {
          return _this.wxGetUserInfo()
            .then(res => {
              options.data.encryptedData = res.encryptedData,
                options.data.iv = res.iv,
                options.data.jsCode = code
              // console.log(options)
              return _this.pRequest(options)
                .then(res => {
                  return res
                })
            }).catch(res => {
              console.log(res)
            })
        }
      })
  },
  /**
   * 自动获取手机号登录
   */
  phoneLogin: function(e) {
    var _this = this
    var iv = e.detail.iv
    var encryptedData = e.detail.encryptedData
    return _this.getStorage(jsCode)
      .then(res => {
        var code = res.data;
        return _this.pRequest({
            url: global.loginOrRegist_url,
            method: 'POST',
            data: {
              encryptedData: encryptedData,
              iv: iv,
              jsCode: code,
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          })
          .then(res => {
            return res
          })
      })
  },



  /**
   * 获取验证码
   */
  queryVerifyImg: function(that) {
    var _this = this
    return _this.pRequest({
        url: global.queryVerifyImg_url,
        data: {},
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        }
      })
      .then(res => {
        // console.log(res)
        if (res.data.code) {
          var base64Img = res.data.code
          that.setData({
            inputShow: 'show',
            id: res.data.id,
            dialog_phone: '',
            dialog_cancel: 'dialogCancel',
            dialog_confirm: 'dialogConfirmVerify',
            dialog_img_tap: 'dialogImgTap',
            dialog_title: '请输入验证码',
            dialog_img: 'data:image/png;base64,' + base64Img,
            dialog_cancelText: '取消',
            dialog_confirmText: '确定',
            dialog_content: '',
          })
          util.showDialog(that)
        }
      })
  },
  /**
   * 判断验证码是否正确，同时根据结果操作页面，返回 success 字符串或错误信息
   */
  verifyImg: function(that) {
    var _this = this
    var identityToken = wx.getStorageSync(sessionKey)
    var id = that.data.id
    var code = that.data.code
    if (code && code.length == 0) {
      that.setData({
        toast: '请输入验证码'
      })
      util.showToast(that)
    } else {
      return commons.pRequest({
          url: global.verifyImg_url,
          data: {
            id: id,
            code: code,
            identityToken: identityToken,
          },
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          }
        })
        .then(res => {
          if (res.data.resultCode == '0000') {
            var result = 'success'
          } else {
            var result = res.data.errcode
            that.setData({
              toast: '验证码错误'
            })
            util.showToast(that)
            _this.queryVerifyImg(that)
          }
          return result
        })
    }
  },
  /**
   * 登录提示框
   */
  loginDialog: function(that) {

    var _this = this;
    _this.wxLogin().then(res => {
      _this.putStorage(jsCode, res.code);
      that.setData({
        inputShow: 'hide',
        dialog_phone: 'has',
        dialog_phone_tap: 'dialogPhone',
        dialog_cancel: 'dialogCancelLogin',
        dialog_confirm: 'dialogConfirmLogin',
        dialog_title: '尚未登录',
        dialog_img: '',
        dialog_img_tap: '',
        dialog_cancelText: '取消',
        dialog_confirmText: '登录',
        dialog_content: '您还没有注册或登录，请前往注册/登录页面',
      })
      util.showDialog(that)
    });

  },

  /**
   * 内部方法， 包装结果类
   */
  packagingResult: function(res, others) {
    if (!others) {
      return res;
    }
    return {
      data: res,
      others: others
    };
  },

  newPromise: function() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  },

}

export {
  commons
};