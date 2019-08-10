//index.js
var util = require('../../common/js/util.js')
var QRCode = require('../../assests/libs/weapp-qrcode.js')
var util = require('../../common/js/util.js');
import {
    commons
} from '../../common/js/commons.js'
//获取应用实例
var global = getApp().globalData;
var qrcode;
Page({
    data: {
        maskStatus: 'hide',
        detail: {},
        btnDisable: false,
        archiveStatus: 'hide',
        inputStatus: 'hide',
        containerStatus: 'hide',
        toast: '',
        $toast: {
            show: false
        },

        placeH: '',
        isCollect: false,//是否显示归集按妞
        qrCodeData:'',
        numCodeData:{},

        isNormal:false,
        buttonClicked:true,
        isfalse:false,
        lookUrl:''
    },
    onLoad: function(options) {
        var that = this;
        wx.showNavigationBarLoading()
        wx.showLoading({
            title: '加载中...',
        })
        //通过手动输入查票进入
        if (options.eInvoiceCode) {
            that.setData({
                URL: global.getVoucherInfoSelf_url,
                invoiceType: options.invoiceType
            })

            var data = {
                eInvoiceCode: options.eInvoiceCode,
                eInvoiceNumber: options.eInvoiceNumber,
                randomNumber: options.randomNumber,
            }
            that.data.numCodeData = data
            that.getVoucherInfo(data)
        }

    },
    onShow() {
        var that = this
        util.hideDialog(that)
    },

    /**
     * 票号票代码查票
     */
    getVoucherInfo(data) {
        var that = this
        // console.log(data)
        commons.pRequest(that.data.URL, data, 'GET')
            .then(res => {
                wx.hideNavigationBarLoading()
                wx.stopPullDownRefresh()
                wx.hideLoading()
                // console.log(res)
                if (res.data.resultCode == '0000') {
                    var base64Img = res.data.data[0].img
                    var einvoiceInfo = res.data.data[0]
                    if (einvoiceInfo.status == '2') {
                        einvoiceInfo.isStatus = '../../assests/images/val-2.png'
                    } else if (einvoiceInfo.status == '5') {
                        einvoiceInfo.isStatus = '../../assests/images/val-5.png'
                    } else {
                        einvoiceInfo.isStatus = ''
                    }
                    if (einvoiceInfo.eInvoiceType == '1'){
                        einvoiceInfo.eInvoiceType ='税务电子发票'
                    }else{
                        einvoiceInfo.eInvoiceType = '财政电子票据'
                    }
                    einvoiceInfo.issueDate = util.stringtoDateArray(einvoiceInfo.issueDate)

                    that.setData({
                        detail: einvoiceInfo,
                        'detail.img': 'data:image/png;base64,' + base64Img,
                        param: {
                            'eInvoiceCode': einvoiceInfo.eInvoiceCode,
                            'eInvoiceNumber': einvoiceInfo.eInvoiceNumber,
                            'randomNumber': einvoiceInfo.randomNumber,
                            'agencyCode': einvoiceInfo.agencyCode,
                            'agencyName': einvoiceInfo.invoicingPartyName
                        },
                        containerStatus: 'show',

                    })

                    if (res.data.data[0].status == '2' ||
                        res.data.data[0].status == '5' ){
                        that.setData({
                            isNormal: false
                        })
                    }else{
                        that.setData({
                            isNormal: true
                        })
                    }
                } else {

                    that.setData({
                        containerStatus: 'hide',

                        toast: res.data.message,
                    })
                    util.showToast(that)
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
            }
        })
    },


    emailInput: function(e) {
        var that = this;
        that.setData({
            sentToEmail: e.detail.value,
        })
    },
    sentToOther: function() {
        var that = this
        that.setData({
            inputStatus: 'show',
            dialog_cancel: 'dialogCancel',
            dialog_confirm: 'dialogConfirmSentPhone',
            dialog_title: '发送给他人',
            dialog_img: '',
            dialog_img_tap: '',
            dialog_cancelText: '取消',
            dialog_confirmText: '发送',
            dialog_content: '',
            placeH: '请输入手机号'
        })
        util.showDialog(that)
    },

    /**
     * 发送至手机号dialog确定按钮事件监听
     */
    dialogConfirmSentPhone: function() {
        var that = this
        var phoneReg = /^(13[0-9]|14[1|5|6|7|9]|15[0|1|2|3|5|6|7|8|9]|16[2|5|6|7]|17[0|1|2|3|5|6|7|8]|18[0-9]|19[1|8|9])\d{8}$/;
        var sentToEmail = that.data.sentToEmail
        if (!sentToEmail || sentToEmail.length < 1){
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            })
            return;
        }
        if (!phoneReg.test(sentToEmail)) {
            wx.showToast({
                title: '请输入正确手机号',
                icon: 'none'
            })
            return;
        }
        //发送电子票到手机号
        that.sendPhone(sentToEmail)
        that.hideDialog()
        that.setData({
            toast: '发送中..',
            $toast: {
                show: true
            }
        })
    },

    /**
     * 发送电子票至手机
     */
    sendPhone: function(sentToEmail) {
        var that = this;
        var detail = that.data.detail
        //console.log(detail.issueDate.replace(/[^\d]/g, ''))
        commons.loginRequest(global.sendPhoneMsg_url, {
            randomNumber: detail.randomNumber,
            eInvoiceNumber: detail.eInvoiceNumber,
            eInvoiceCode: detail.eInvoiceCode,
            phone: sentToEmail,
        }, 'GET')
            .then((res) => {
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
                } else if (res.data.resultCode == '0000'){
                    that.setData({
                        sentToEmail: '',
                    })
                    wx.navigateBack({

                    })
                }else{
                    that.setData({
                        toast: res.data.message
                    })
                    that.showToast()
                }

            }).catch(res=>{
            that.setData({
                sentToEmail: '',
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
            }
        })


    },

    /**
     * 登陆dialog确定按钮事件监听
     */
    dialogPhone: function(e) {
        var that = this
        var encryptedData = e.detail.encryptedData
        if (e.detail.encryptedData) {
            return commons.phoneLogin(e)
                .then(res => {
                    // console.log(res)
                    if (res.data.status == 'login' || res.data.status == 'incomplete') {
                        commons.putStorage('identityToken', res.data.identityToken)
                        commons.putStorage('loginInfoKey', res.data)
                        util.hideDialog(that)
                        that.setData({
                            toast: '登录成功'
                        })
                        that.showToast()
                    }
                })
        }
    },
    hideDialog() {
        var that = this;
        let dialogComponent = this.selectComponent('.wxc-dialog')
        dialogComponent && dialogComponent.hide();
    },
    /**
     * 登录dialog取消按钮事件监听
     */
    dialogCancelLogin() {
        var that = this
        that.hideDialog()
    },
    /**
     * 发送至邮箱dialog取消按钮监听
     */
    dialogCancel() {
        var that = this
        that.hideDialog()
        that.setData({
            sentToEmail: '',
        })
    },

    addClassify: function(e) {
        var that = this
        var classify = that.data.classify
        var item = e.currentTarget.dataset.classify
        var flage = true
        for (let i in classify) {
            if (item == classify[i]) {
                flage = false
                return
            }
        }
        if (flage) {
            classify.push(item)
        }
        that.setData({
            classify: classify
        })
    },
    delClassify: function(e) {
        var that = this
        var classify = that.data.classify
        var item = e.currentTarget.dataset.classify
        var flage = true
        for (let i in classify) {
            if (item == classify[i]) {
                classify.splice(i, 1)
            }
        }
        that.setData({
            classify: classify
        })
    },
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
    showPopup() {
        let popupComponent = this.selectComponent('.J_Popup');
        popupComponent && popupComponent.toggle(true);
        qrcode = new QRCode('canvas', {
            text: this.data.detail.qrCodeText,
            image: '',
            width: 200,
            height: 200,
            colorDark: "black",
            colorLight: "white",
            correctLevel: QRCode.CorrectLevel.H,
        });
    },
    hidePopup() {
        let popupComponent = this.selectComponent('.J_Popup');
        popupComponent && popupComponent.toggle();
    },
    onPullDownRefresh(){
        var that = this
        that.getVoucherInfo(that.data.numCodeData)

    },
    //查看电子票
    lookInvoice:function(){
        var that = this
        var detail = that.data.detail
        util.buttonClicked(that, 'buttonClicked')
     
      wx.navigateTo({
        url: '/pages/lookInvoice/lookInvoice?code=' + detail.eInvoiceCode + '&num=' + detail.eInvoiceNumber + '&random=' + detail.randomNumber + '&issue=' + detail.issueDate + '&invoiceType=' + that.data.invoiceType + '&invoiceState=' + detail.status,
      })
        
    }
})