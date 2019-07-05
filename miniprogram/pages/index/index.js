Page({

  data: {

  },

  onLoad: function (options) {
 
  },

  // 获取wifi名称失败处理函数
  getWifiNameFail: function(num1){
    wx.stopPullDownRefresh()
    switch(num1){
      case 12005:
        wx.showToast({
          title: 'wifi未打开',
          icon: 'none',
          duration: 2000
        });
        break;
      case 12006:
        wx.showToast({
          title: 'GPS未打开,请先打开GPS',
          icon: 'none',
          duration: 2000
        });
        break;
      default:
        wx.showToast({
          title: '未连接404wifi',
          icon: 'none',
          duration: 2000
        });
    }
  },

  // 获取wifi名称成功处理函数
  getWifiNameSuccess: function(name1){
    if (name1 == "xgb404"){
      console.log("wifi正确，允许签到")
      wx.redirectTo({
        url: '../signIn/signIn'
      })
    }
    else{
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '未连接404wifi',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 点击按钮，判断是否连接正确的wifi
  signIn: function(){
    wx.startPullDownRefresh()
    // 初始化wifi模块
    wx.startWifi({
      success(res) {
        console.log("0")
        console.log(res.errMsg)
      },
      fail: function (res) {
        console.log(res)
        console.log("startWifi打开失败")
      }
    })
    var that = this;
    // 获取wifi名称
    wx.getConnectedWifi({
      // 获取wifi名称成功
      success: function (res) {
        console.log("1")
        console.log(res.wifi)
        that.getWifiNameSuccess(res.wifi.SSID)
      },
      // 获取wifi名称失败
      fail: function (res) {
        console.log("2")
        console.log(res)
        that.getWifiNameFail(res.errCode)
      }
    })
  }
})