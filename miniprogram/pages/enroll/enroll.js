var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    center: '',
    dept: '',
    userName: '',
    windowHeight: 440,
    windowWidth: 320,
    isXinxi: true,
    isBindInfo: true,
    centerItems: [
      '请选择中心', '信息技术中心', '易班推广发展中心'
    ],
    centerIndex: 0,
    deptItems: [
      '请选择部门', '研发部', '美工部', '网络部', '行政部', '运营部', '宣传部', '活动部'
    ],
    deptIndex: 0,
    inputMessage: '请输入姓名',
    timePeriodArray1: ['请选择时段', '8:00-9:40', '10:00-11:40', '14:00-15:40', '16:00-17:40', '19:00-20:40'],
    timePeriodArray2: ['请选择时段', '8:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:30-21:00'],
    timePeriodCode: ['A', 'B', 'C', 'D', 'E'],
    timePeriodIndex: 0,
    timePeriod: '',
    dayOfWeekArray: ['请选择星期', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
    dayOfWeekIndex: 0,
    dayOfWeekName: '',
    dayOfWeek: 0,
    bigMonthArray: [1, 3, 5, 7, 8, 10, 12],
    smallMonthArray: [4, 6, 9, 11],
    nowTime: null,
    year: '',
    month: '',
    nowdate: '',
    date: 0,
    nowDayOfWeek: 0,
    leapyear: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      center: app.globalData.center,
      openid: app.globalData.openid,
      windowHeight: app.globalData.windowHeight,
      windowWidth: app.globalData.windowWidth
    })
    this.onJudgeTimePeriod()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setTime()
    this.onQuery()
  },

  // 选定中心
  centerChange: function(e) {
    this.setData({
      centerIndex: e.detail.value,
      center: this.data.centerItems[e.detail.value]
    })
  },

  // 选定部门
  deptChange: function(e) {
    this.setData({
      deptIndex: e.detail.value,
      dept: this.data.deptItems[e.detail.value]
    })
  },

  // 输入姓名
  userNameInput: function(e) {
    this.setData({
      userName: e.detail.value
    })
  },

  // 点击用户信息绑定按钮
  bindUserInfo: function() {
    if (this.data.center == "请选择中心" || this.data.dept == "请选择部门" || this.data.userName == "") {
      wx.showToast({
        title: '请先选择中心、部门并输入姓名',
        icon: 'none',
        duration: 2000
      });
      return;
    } else {
      wx.showToast({
        title: '绑定成功',
      })
    }
    this.onAddUserInfo();
  },

  // 添加新用户数据到数据库
  onAddUserInfo: function () {
    var that = this;
    const db = wx.cloud.database()
    db.collection('404UserInfo').add({
      data: {
        userName: this.data.userName,
        center: this.data.center,
        dept: this.data.dept
      },
      success: res => {
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '绑定成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        // 绑定信息成功后，是否绑定信息设置为true
        that.setData({
          isBindInfo: true
        })
      },
      fail: err => {
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '当前网络不佳,请稍后重试',
          icon: 'none',
          duration: 2000
        });
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  // 设置时间
  setTime: function() {
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
    var time = hour + ':' + minute + ':' + second;
    var nowDayOfWeek = nowTime.getDay();
    if (nowDayOfWeek == 0) {
      nowDayOfWeek = 7;
    }
    if ((year * 1) % 4 == 0 && (year * 1) % 100 != 0 || (year * 1) % 400 == 0) {
      this.setData({
        leapyear: 1
      })
    }
    this.setData({
      year: year,
      month: month,
      nowdate: date,
      nowDayOfWeek: nowDayOfWeek
    })
  },

  //判断当前的时间段数组
  onJudgeTimePeriod: function() {
    if (this.data.center == '易班推广发展中心') {
      this.setData({
        isXinxi: false
      })
    }
  },

  //选定值班星期
  dayOfWeekChange: function(e) {
    this.setData({
      dayOfWeekIndex:e.detail.value,
      dayOfWeekName: e.detail.value == 0 ? '' : this.data.dayOfWeekArray[e.detail.value],
      dayOfWeek: e.detail.value*1
    })
  },

  //选定值班时段
  timePeriodChange: function(e) {
    this.setData({
      timePeriodIndex: e.detail.value,
      timePeriod: e.detail.value == 0 ? '' : this.data.timePeriodCode[e.detail.value - 1]
    })
  },

  //查看当前报班表
  toTable: function() {
    if (this.data.center == '信息技术中心') {
      wx.redirectTo({
        url: '../table/table',
      })
    } else {
      wx.redirectTo({
        url: '../table2/table2',
      })
    }
  },

  //判断报班日期
  onJudgeDate:function(){
    var year = this.data.year * 1;
    var month = this.data.month * 1;
    var date = this.data.dayOfWeek * 1 + 7 - this.data.nowDayOfWeek + this.data.nowdate * 1;
    // console.log(this.data.dayOfWeek)
    // console.log(this.data.nowDayOfWeek)
    // console.log(this.data.nowdate)
    console.log(date)
    if (this.data.bigMonthArray.indexOf(month) != -1) {
      if (date > 31) {
        console.log("date>31")
        date = date - 31;
        if(month == 12){
          date=(year*1+1)*10000+100+date*1;
        }else{
          date = year * 10000 + (month * 1 + 1) * 100 + date * 1;
        }
      } else {
        date = year * 10000 + month * 100 + date * 1
      }
    }
    if (this.data.smallMonthArray.indexOf(month) != -1) {
      if (date > 30) {
        console.log("date>30")
        date = date - 30;
        date = year * 10000 + (month * 1 + 1) * 100 + date * 1;
      } else {
        date = year * 10000 + month * 100 + date * 1
      }
    }
    if (month * 1 == 2) {
      if (this.data.leapyear == 1) {
        if (date > 29) {
          console.log("date>29")
          date = date - 29;
          date = year * 10000 + (month * 1 + 1) * 100 + date * 1;
        }else{
          date=year*10000+month*100+date*1
        }
      } else {
        if (date > 28) {
          console.log("date>28")
          date = date - 28;
          date = year * 10000 + (month * 1 + 1) * 100 + date * 1;
        } else {
          date = year * 10000 + month * 100 + date * 1
        }
      }
    }
    this.setData({
      date:date
    })
  },

  //点击报班
  onEnroll: function() {
    if(this.data.dayOfWeekName==''||this.data.timePeriod==''){
      wx.showModal({
        title: '提示',
        content: '请先选择值班星期和时段',
        showCancel:false
      })
      return
    }

    this.onJudgeDate()
    this.onQueryNum()
  },

  //查询所选时段是否已经有两个人报班
  onQueryNum: function() {
    var that = this;
    const db = wx.cloud.database()
    db.collection(that.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').where({
      date: that.data.date,
      timePeriod:that.data.timePeriod
    }).get({
      success(res) {
        console.log(res.data)
        if (res.data.length < 2) {
          that.onAdd()
        } else {
          wx.showModal({
            title: '提示',
            content: '当前时段已有两个人报班，请选择其他时段',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定');
                wx.startPullDownRefresh()
              }
            }
          })
        }
      }
    })
  },

  //添加报班信息到数据库
  onAdd: function() {
    var that = this;
    const db = wx.cloud.database()
    db.collection(this.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').add({
      data: {
        dayOfWeek: that.data.dayOfWeek,
        timePeriod: that.data.timePeriod,
        docName: that.data.userName,
        date: that.data.date,
        dept: that.data.dept,
        late: 0,
        signIn: 0,
        signOut: 0
      },
      success: res => {
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '报班成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '当前网络不佳,请稍后重试',
          icon: 'none',
          duration: 2000
        });
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  // 查询函数,查询用户信息
  onQuery: function() {
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('404UserInfo').where({
        _openid: this.data.openid
      })
      .get({
        success: function(res) {
          if (res.data == "") {
            that.setData({
              isBindInfo: false
            })
            return;
          } else {
            that.setData({
              isBindInfo: true,
              userName: res.data[0].userName,
              center: res.data[0].center,
              dept: res.data[0].dept
            })
            console.log(res.data)
          }
        },
        fail: function(res) {
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

})