var global = getApp().globalData;
//字符串时间格式化函数(数组参数)
function stringtoDateArray (result) {
    var year = result.substring(0, 4) + '-'
    var month = result.substring(4, 6) + '-'
    var day = result.substring(6, 8)
    var date = year + month + day
    return date
}
module.exports.stringtoDateArray = stringtoDateArray
//字符串时间格式化函数(string参数)
function stringtoDate(result) {
      var year = result.issueDate.substring(0, 4) + '-'
      var month = result.issueDate.substring(4, 6) + '-'
      var day = result.issueDate.substring(6, 8)
      var date = year + month + day
      result.issueDate = date
  return result
}
module.exports.stringtoDate = stringtoDate

//时间格式还原为字符串(数组参数)
function datetoStringArray(result) {
  for(let i in result){
    var array = result[i].issueDate.split('-')
    console.log(array)
    var value=''
    for(let j in array){
      value+=array[j]
    }
    result[i].issueDate=value
  }
  return result
}
module.exports.datetoStringArray = datetoStringArray
//时间格式还原为字符串(string参数)
function datetoString(result) {
    var array = result.issueDate.split('-')
    console.log(array)
    var value = ''
    for (let j in array) {
      value += array[j]
    }
    result.issueDate = value
  return result
}
module.exports.datetoString = datetoString

//钱的格式转换
function formatNum(str) {
  var newStr = "";
  var count = 0;

  if (str.indexOf(".") == -1) {
    for (var i = str.length - 1; i >= 0; i--) {
      if (count % 3 == 0 && count != 0) {
        newStr = str.charAt(i) + "," + newStr;
      } else {
        newStr = str.charAt(i) + newStr;
      }
      count++;
    }
    str = newStr + ".00"; // 自动补小数点后两位
    return str;
  } else {
    for (var i = str.indexOf(".") - 1; i >= 0; i--) {
      if (count % 3 == 0 && count != 0) {
        newStr = str.charAt(i) + "," + newStr;
      } else {
        newStr = str.charAt(i) + newStr; // 逐个字符相接起来
      }
      count++;
    }
    str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
    return str;
  }
}
  module.exports.formatNum = formatNum


function noticeListDate(result){
  console.log(result)
  for (let i in result) {
    var year = result[i].msgTime.substring(0, 4) + '-'
    var month = result[i].msgTime.substring(4, 6) + '-'
    var day = result[i].msgTime.substring(6, 8)
    var time = result[i].msgTime.substring(9, 17)
    var date = year + month + day + ' ' + time
    result[i].msgTime = date
  }
  console.log(result)
  return result
}
module.exports.noticeListDate = noticeListDate
/**
 * 获取验证码倒计时
 */
           

function showToast(that) {
  that.setData({
    $toast: {
      show: true
    }
  })
  setTimeout(() => {
    that.setData({
      $toast: {
        show: false
      }
    })
  }, 2000)
}

module.exports.showToast = showToast

function showToastByTime(that,time) {
  that.setData({
    $toast: {
      show: true
    }
  })
  setTimeout(() => {
    that.setData({
      $toast: {
        show: false
      }
    })
  }, time)
}

module.exports.showToastByTime = showToastByTime
function isZP(a) {
  var iszp = false;
  var c = "99";
  if (a.length == 12) {
    var b1 = a.substring(0, 1);
    var b = a.substring(7, 8);
    if (!b1 == "0" && b == "2") {
      iszp = true;
    }
    if (c == "99" && b == "2") {
      iszp = true;
    }
  } else {
    var b = a.substring(7, 8);
    if (b == "1" || b == "5") {
      iszp = true;
    } else if (b == "7" || b == "2") {
      iszp = true;
    }
  }
  return iszp;
}
module.exports.isZP = isZP

function bsRequest(method,url, data, callBacks){
  if (!callBacks.fail){
    callBacks.fail = function fail() { }
  }
  if (!callBacks.complete){
    callBacks.complete = function complete(){}
  }
  wx.request({
    url: url,
    method:method,
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data:data,
    success:function(res){
      callBacks.success(res)
    },
    fail:function(res){
      callBacks.fail(res)
    },
    complete:function(res){
      callBacks.complete(res)
    }
  })
}
module.exports.bsRequest = bsRequest

function showDialog(that) {
  let dialogComponent = that.selectComponent('.wxc-dialog')
  dialogComponent && dialogComponent.show();
}
module.exports.showDialog = showDialog

function hideDialog(that) {
  let dialogComponent = that.selectComponent('.wxc-dialog')
  dialogComponent && dialogComponent.hide();
}
module.exports.hideDialog = hideDialog

function buttonClicked(that, buttonClicked) {
  that.setData({
    [buttonClicked]: false
  })
  setTimeout(function () {
    that.setData({
      [buttonClicked]: true
    })
  }, 1000)

}
module.exports.buttonClicked = buttonClicked

