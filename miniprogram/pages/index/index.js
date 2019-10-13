var app=getApp();
Page({

  data: {
    openid:'',
    center:'',
    windowHeight: 0,
    windowWidth: 0,
    statusBarHeight: 0,
    titleBarHeight: 0,
    nowTime:null,
    dayOfWeek:0,
    date:0
  },

  onLoad: function (options) {
    this.onGetOpenid()
  },

  onShow:function(){
    this.getWindowHeight()
    this.setTime()
  },

  /** 
   * 获取用户设备屏幕高度
   */
  getWindowHeight: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        var statusBarHeight = res.statusBarHeight;
        var windowWidth = res.windowWidth;
        var titleBarHeight;
        // 确定titleBar高度（区分安卓和苹果
        if (wx.getSystemInfoSync().system.indexOf('iOS') > -1) {
          titleBarHeight = 44
        } else {
          titleBarHeight = 48
        }
        var windowHeight = res.windowHeight - statusBarHeight - titleBarHeight
        console.log('windowHeight:',windowHeight,'windowWidth:',windowWidth)
        app.globalData.windowHeight=windowHeight
        app.globalData.windowWidth=windowWidth
        that.setData({
          statusBarHeight: statusBarHeight,
          titleBarHeight: titleBarHeight,
          windowHeight: windowHeight,
          windowWidth: windowWidth
        })
      },
    })
  },

  // 获取用户的Openid
  onGetOpenid: function () {
    var that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid=res.result.openid
        this.setData({
          openid: res.result.openid
        })
        that.onQuery()
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.hideLoading();
        wx.showToast({
          title: '当前网络不佳,请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    })
  },

  // 设置时间
  setTime: function () {
    var nowTime = new Date()
    this.setData({
      nowTime: nowTime
    })
    var year = nowTime.getFullYear();
    var month = (nowTime.getMonth() + 1 < 10 ? '0' + (nowTime.getMonth() + 1) : nowTime.getMonth() + 1);
    var date = nowTime.getDate() < 10 ? '0' + nowTime.getDate() : nowTime.getDate();
    var hour = nowTime.getHours() < 10 ? '0' + nowTime.getHours() : nowTime.getHours();
    var minute = nowTime.getMinutes() < 10 ? '0' + nowTime.getMinutes() : nowTime.getMinutes();
    var second = nowTime.getSeconds() < 10 ? '0' + nowTime.getSeconds() : nowTime.getSeconds();
    var date = year * 10000 + month * 100 + date * 1;//date必须乘1，直接相加会变成字符串拼接
    var ymdate = year * 10000 + month * 100 ;
    var time = hour + ':' + minute + ':' + second;

    var dayOfWeek = nowTime.getDay();
    if (dayOfWeek == 0) {
      dayOfWeek = 7;
    }
    this.setData({
      dayOfWeek: dayOfWeek,
      date:date
    })
  },

  //查询数据库中用户信息并保存为全局变量
  onQuery: function () {
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('404UserInfo').where({
      _openid: that.data.openid
    })
      .get({
        success: function (res) {
          app.globalData.center = res.data[0].center,
          console.log(app.globalData.center)
          that.judge()
        },
        fail: function (res) {
          console.log(res.data)
          wx.hideLoading();
          wx.showToast({
            title: '当前网络不佳,请稍后重试',
            icon: 'none',
            duration: 2000
          });
        }
      })

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
  signIn: function(event){
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
  },

  signIn2:function(){
    wx.redirectTo({
      url: '../signIn/signIn'
    }) 
  },

  manageIn:function(){
    wx.navigateTo({
      url: '../manageIn/manageIn',
    })
  },

  //进入报班界面
  enrollIn:function(){
    var hour = this.data.nowTime.getHours()
    if (this.data.dayOfWeek == 7 && parseInt(hour) < 23 && parseInt(hour) >= 8){
      wx.navigateTo({
        url: '../enroll/enroll',
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '当前时间不可报班\r\n报班时间：周日8:00-周日23:00',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
          }
        }
      })
    }
  },


  //判断这个月内之前是否有旷班情况
  judge:function(){
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection(app.globalData.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').where({
      _openid: that.data.openid,
      signIn: 0
    }) .get({
        success: function (res) {
          if(res.data.length!=0){
            console.log(res.data)
            for(var i=0;i<res.data.length;i++){
              if(res.data[i].date<that.data.date){
                db.collection(app.globalData.center == '信息技术中心' ? 'scheduleSum' : 'scheduleSum2').where({
                  _openid: that.data.openid
                }).get({
                  success: function (res) {
                    console.log(res.data)
                    db.collection(app.globalData.center == '信息技术中心' ? 'scheduleSum' : 'scheduleSum2').doc(res.data[0]._id).update({
                      data: {
                        absent: 1
                      },
                      success: function (res) {
                        wx.stopPullDownRefresh()
                        console.log('[数据库] [更新记录] 成功')
        
                      }
                    })
                  }
                })
              }
            }
          }
        },
        fail: function (res) {
          console.log(res.data)
          wx.hideLoading();
        }
      })
  }
})