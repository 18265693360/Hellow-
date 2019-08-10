                                                                          //app.js
App({
    onLaunch: function () {
        var that = this
        // 展示本地存储能力
        // var logs = wx.getStorageSync('logs') || []
        // logs.unshift(Date.now())
        // wx.setStorageSync('logs', logs)

        var globalData = that.globalData

        const updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            // console.log(res.hasUpdate)
        })

        updateManager.onUpdateReady(function () {
            updateManager.applyUpdate()
        })

        updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
                title: '更新提示',
                content: '新版本下载失败！',
                showCancel: false
            })
        })
    },

    globalData: {
        custom:{
          agencyName: '',
          agencyCode: '',
          page: '',
          tips:''
        },
        /**
         * 页面路由
         */
        //手机号注册登录页面
        PAGE_LOGIN: '/pages/admin/login/login',
        //我的
        PAGE_MINE: '/pages/admin/mine/mine',
        //选择城市
        PAGE_CITYS: '/pages/citys/citys',

        //财票详情页
        PAGE_EINVOICEDETAIL: '/pages/eInvoiceDetail/eInvoiceDetail',
        //首页
        PAGE_HOME: '/pages/home/home',
        //自助开票入口页
        PAGE_INDEX: '/pages/index-s/index-s',
        //手工查票
        PAGE_EINVOICE: '/pages/queryPages/eInvoice/eInvoice',

        //完善个人信息
        PAGE_LOGININFO: '/pages/admin/loginInfo/loginInfo',
        //票夹
        PAGE_EINVOICEWALLET: '/pages/eInvoiceWallet/eInvoiceWallet',

        // //注册协议
        // PAGE_AGREEMENTREGISTER: '/pages/agreements/register/register',
        //票据抬头列表
        PAGE_TITLELIST: '/pages/eInvoiceTitle/titleList/titleList',
        //票据抬头详情
        PAGE_TITLEDETAIL: '/pages/eInvoiceTitle/titleDetail/titleDetail',
        //票据抬头编辑、添加页面
        PAGE_TITLEEDIT: '/pages/eInvoiceTitle/titleEdit/titleEdit',

        //自助开票明细页
        PAGE_MAKEEINVOICEDETAIL: '/pages/makeEInvoice/makeEInvoiceDetail/makeEInvoiceDetail',
        //自助开票页面
        PAGE_MAKEEINVOICEPAGE: '/pages/makeEInvoice/makeEInvoicePage/makeEInvoicePage',
        PAGE_BILLDETAIL:
            '/pages/billDetail/billDetail',



        //用户手机号
        tip:'请求超时',
        nowork:'网络不给力，请稍后重试',
        overTime:'请求超时，请重试',


        /**
         * 线上环境www.chinaebill.cn  https
         * 测试环境1.119.162.242:808/  http
         * 演示环境demo.chinaebill.cn  https
         * 本地环境192.168.61.77:8080  http
         * 接口url  'http://1.119.162.242:808/eips-wxapp-service
         */

        queryEInvocieList_url:
            'http://1.119.162.242:808/eips-wxapp-service/findVoucher/queryEInvocieList',
        querySupportCitys_url:
            'http://1.119.162.242:808/eips-wxapp-service/findVoucher/querySupportCitys',
        queryCompanysByCity_url:
            'http://1.119.162.242:808/eips-wxapp-service/findVoucher/queryCompanysByCity',
        sendEmailMsg_url:
            'http://1.119.162.242:808/eips-wxapp-service/message/sendEmailMsg',
        getVoucherInfoByQrcode_url:
            "http://1.119.162.242:808/eips-wxapp-service/voucher/getVoucherInfoByQrcode",
        getInvoiceDetail_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/getTaxReceipt',
        qrInfo_url:
            "http://1.119.162.242:808/eips-wxapp-service/voucher/qrInfo",
        loginOrRegistByToken_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/loginOrRegistByToken',
        loginOrRegistByPhone_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/loginOrRegistByPhone',
        loginOrRegist_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/loginOrRegistByMiniProgram',
        logout_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/logout',
        modifyUserInfo_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/modifyUserInfo',
        queryVerifyImg_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/queryVerifyImg',
        verifyImg_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/verifyImg',
        sendNewPhoneMsg_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/sendNewPhoneMsg',
        doArchiveFromEips_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/doArchiveFromEips',
        doArchiveFromAgency_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/doArchiveFromAgency',
        getVoucherPage_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/getVoucherPageNew',      
        getVoucherInfo_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/getVoucherInfo',
        getVoucherInfoSelf_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/getVoucherInfoArchive',
        getInvoiceInfo_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/getInvoiceInfo',
        doArchiveFromAgencyBatch_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/doArchiveFromAgencyBatch',
        subscribeMsg_url:
            'http://1.119.162.242:808/eips-wxapp-service/message/subscribeMsg',
        queryAndConsumeMsg_url:
            'http://1.119.162.242:808/eips-wxapp-service/message/queryAndConsumeMsg',
        queryVoucherListByMsg_url:
            'http://1.119.162.242:808/eips-wxapp-service/message/queryVoucherListByMsg',
     
        archiveInTotal_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/archiveInTotal',
        invoiceTitleAdd_url:
            'http://1.119.162.242:808/eips-wxapp-service/invoiceTitle/add',
        invoiceTitleModify_url:
            'http://1.119.162.242:808/eips-wxapp-service/invoiceTitle/modify',
        invoiceTitleQueryList_url:
            'http://1.119.162.242:808/eips-wxapp-service/invoiceTitle/queryList',
        invoiceTitleDel_url:
            'http://1.119.162.242:808/eips-wxapp-service/invoiceTitle/del',
        querySaleItems_url:
            'http://1.119.162.242:808/eips-wxapp-service/issueVoucherSelfHelp/querySaleItems',
        issueVoucher_url:
            'http://1.119.162.242:808/eips-wxapp-service/issueVoucherSelfHelp/issueVoucher',
        bindID_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/bindingNameIdcard',
        lookUserInfo_url:
            'http://1.119.162.242:808/eips-wxapp-service/user/getUserInfo',
        invoiceHistory_url:
            'http://1.119.162.242:808/eips-wxapp-service/issueVoucherSelfHelp/issueVoucherHistoryList',
        invoiceHistoryDetails_url:
            'http://1.119.162.242:808/eips-wxapp-service/issueVoucherSelfHelp/issueVoucherHistorySingle',
        sendPhoneMsg_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/doArchiveFromShare',
        ocr_url:
            'http://1.119.162.242:808/eips-wxapp-service/idCard/ocr',
        invoiceTotalToday_url:
            'http://1.119.162.242:808/eips-wxapp-service/voucher/getInvoiceTotalToday',
        queryCompanysByAgencyId_url:
            'http://1.119.162.242:808/eips-wxapp-service/findVoucher/queryCompanysByAgencyId',
//得到二维码 连接
        getQRCodeString_url:
            'http://1.119.162.242:808/eips-wxapp-service/findVoucher/queryEInvocieList',

        getQRCodeStringTwo_url: 'http://1.119.162.242:808/eips-wxapp-service/getQrcode',
        isCollect_url:'http://1.119.162.242:808/eips-wxapp-service/voucher/isArchiveVoucher',
        collectInvoice_url:'http://1.119.162.242:808/eips-wxapp-service/voucher/doArchiveByCheck',
        getPaymentQRCode_url:'http://1.119.162.242:808/eips-wxapp-service/advance/getAdvanceQRCode',
        paymentList_url:'http://1.119.162.242:808/eips-wxapp-service/advance/prepaidListQuery',
        paymentProof_url:'http://1.119.162.242:808/eips-wxapp-service/advance/showAdvancePayment',
        paymentSendToOther_url:'http://1.119.162.242:808/eips-wxapp-service/advance/sendToOtherPerson',
        paymentSendToOtherAll_url:'http://1.119.162.242:808/eips-wxapp-service/MergeSend/MergeSend',
        paymentGetCode_url:'http://1.119.162.242:808/eips-wxapp-service/smsverification/queryUserInfoByPhone',
        lookInvoice_url:'http://1.119.162.242:808/eips-wxapp-service/voucher/displayInvoicePng',
 
lookPayment_url: 'http://1.119.162.242:808/eips-wxapp-service/advance/displayAdvancePNG',
      lookBill_url: 'http://1.119.162.242:808/eips-wxapp-service/voucher/displayFaxInvoicePng',
      againPaymentList:'http://1.119.162.242:808/eips-wxapp-service/voucher/registArchiveByToken',
      sendRecord_url:'http://1.119.162.242:808/eips-wxapp-service/shareRecord/queryList',
      lookRedInvoice_url:'http://1.119.162.242:808/eips-wxapp-service/displayInvoice/financeInvoicePng',
      custom_bindCustomCompany_url:'http://1.119.162.242:808/eips-wxapp-service/customization/bindingAgency',
custom_invoiceList_url: 'http://1.119.162.242:808/eips-wxapp-service/voucher/queryEInvocieList',
custom_collectInvoice_ul: 'http://1.119.162.242:808/eips-wxapp-service/voucher/doArchiveBySelf',
custom_collectNInvoice_url: 'http://1.119.162.242:808/eips-wxapp-service/voucher/doArchiveInvoicesBySelf',
custom_invoiceDetails_url: 'http://1.119.162.242:808/eips-wxapp-service/voucher/queryInvoiceInfo',
      custom_imageLogo_url:'http://1.119.162.242:808/eips-wxapp-service/customization/queryCompanyInfo',
      custom_relationCompany_url:'http://1.119.162.242:808/eips-wxapp-service/customization/queryAllCompany',
      custom_relationAllCompany_url:'http://1.119.162.242:808/eips-wxapp-service/customization/queryCustomizationCompanys'
    }

})