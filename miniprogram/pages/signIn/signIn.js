Page({

  data: {
    openid: "",
    word: "点击签到",
    nowTime: null,
    nowDay: "星期日",
    dayOfWeek: "",
    nowClass: "",
    timePeriod: "",
    timePeriodArray:["A","B","C","D","E"],
    nowDayArray: ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    isCanSignIn: false,
    isBindInfo: true,
    isSignIn: true,
    deptItems: [
      '请选择部门', '研发部', '美工部', '网络部'
    ],
    deptIndex: 0,
    dept: '请选择部门',
    inputMessage: '请输入姓名',
    userName: "",
    date: 0,
    time: 0,
    count: 1,
    late: 0,//0代表没迟到，1代表迟到
    signOut:1//0代表没签退，1代表签退
  },

  onLoad: function(options) {
    this.onGetOpenid();
  },

  onShow: function() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 2000)
    this.setTime()
    this.onQueryIsSign()
    this.judgeTime()
  },

  // 点击签到按钮
  butDown: function() {
    var that = this;
    if (this.data.isBindInfo == false) {
      wx.showToast({
        title: '请先绑定以上信息',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if(this.data.signOut==1) {
    wx.showModal({
      title: '提示',
      content: '请确定您的签到时间段:\r\n' + that.data.nowDay + that.data.nowClass,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.startPullDownRefresh()
          that.onAdd();
          that.setData({
            isCanSignIn: false,
            word: "点击签退"
          }) 
        } else if (res.cancel) {
          console.log('用户点击取消')
          return;
        }
      }
    })
    }
    if(this.data.signOut==0) {
      wx.showModal({
        title: '提示',
        content: '请确定您的签退时间:\r\n' + that.data.nowDay + that.data.time,
        success(res){
          if(res.confirm){
            console.log('用户点击确定');
            wx.startPullDownRefresh()
            that.onUpdate();
            that.setData({
              isCanSignIn:false,
              word:"点击签到"
            })
          }else if(res.cancel){
            console.log('用户点击取消')
            return;
          }
        }
      })
    }
  },

  // 改变部门
  deptChange: function(e) {
    this.setData({
      deptIndex: e.detail.value
    })
    this.setData({
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
    if (this.data.dept == "请选择部门" || this.data.userName == "") {
      wx.showToast({
        title: '请先选择部门、输入姓名',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    this.onAddUserInfo();
  },

  // 获取用户的Openid
  onGetOpenid: function() {
    var that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        this.setData({
          openid: res.result.openid
        })
        that.onQuery();
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
    var date = year * 10000 + month * 100 + date * 1;//date必须乘1，直接相加会变成字符串拼接
    var time = hour + ':' + minute + ':' + second;
    this.setData({
      date: date,
      time: time
    })
  },

  // 判断当前签到的星期与第几节课
  judgeTime: function() {
    var that=this
    var hour = this.data.nowTime.getHours()
    var minute = this.data.nowTime.getMinutes()
    switch (parseInt(hour)) {
      case 8:
        this.setData({
          nowClass: "8:00-9:40",
          isCanSignIn: that.data.signOut == 1 ? true : false,
          timePeriod: "A"
        })
        if(minute > 10) this.setData({
          late: 1//0代表没迟到，1代表迟到
        });
        break;
      case 9:
        this.setData({timePeriod:"A"})
        if (minute < 30) {
          this.setData({
            nowClass: "8:00-9:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            late: 1
          })
        } else {
            that.setData({
              isSignIn:false,
              nowClass: "未到签到时间",
              isCanSignIn:that.data.signOut==0? true : false
            })
          };
        break;
      case 10:
        this.setData({
          nowClass: "10:00-11:40",
          isCanSignIn: that.data.signOut == 1 ? true : false,
          timePeriod: "B"
        })
        if (minute > 10) this.setData({
          late: 1
        });
        break;
      case 11:
        this.setData({ timePeriod: "B" })
        if (minute < 30) {
          this.setData({
            nowClass: "10:00-11:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            late: 1
          })
        } else {
          that.setData({
            isSignIn:false,
            nowClass: "未到签到时间",
            isCanSignIn: that.data.signOut == 0 ? true : false
          })
        };
        break;
      case 14:
        this.setData({
          nowClass: "14:00-15:40",
          isCanSignIn: that.data.signOut == 1 ? true : false,
          timePeriod: "C"
        })
        if (minute > 10) this.setData({
          late: 1
        });
        break;
      case 15:
        this.setData({ timePeriod: "C" })
        if (minute < 30) {
          this.setData({
            nowClass: "14:00-15:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            late: 1
          })
        } else {
          that.setData({
            isSignIn:false,
            nowClass: "未到签到时间",
            isCanSignIn: that.data.signOut == 0 ? true : false
          })
        };
        break;
      case 16:
        this.setData({
          nowClass: "16:00-17:40",
          isCanSignIn: that.data.signOut == 1 ? true : false,
          timePeriod: "D"
        })
        if (minute > 10) this.setData({
          late: 1
        });
        break;
      case 17:
        this.setData({ timePeriod: "D" })
        if (minute < 30) {
          this.setData({
            nowClass: "16:00-17:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            late: 1
          })
        } else {
          that.setData({
            isSignIn:false,
            nowClass: "未到签到时间",
            isCanSignIn: that.data.signOut == 0 ? true : false
          })
        };
        break;
      case 19:
        this.setData({
          nowClass: "19:00-20:40",
          isCanSignIn: that.data.signOut == 1 ? true : false,
          timePeriod: "E"
        })
        if (minute > 10) this.setData({
          late: 1
        });
        break;
      case 20:
        this.setData({ timePeriod: "E" })
        if (minute < 30) {
          this.setData({
            nowClass: "19:00-20:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            late: 1
          })
        } else {
          that.setData({
            isSignIn:false,
            nowClass: "未到签到时间",
            isCanSignIn: that.data.signOut == 0 ? true : false
          })
        };
        break;
      default:
        this.setData({
          isSignIn:false,
          nowClass: "未到签到时间",
          isCanSignIn: false
        });
    }

    var dayOfWeek = this.data.nowTime.getDay();
    if (dayOfWeek == 0) {
      dayOfWeek = 7;
    }
    this.setData({
      nowDay: this.data.nowDayArray[this.data.nowTime.getDay()],
      dayOfWeek: dayOfWeek
    })

    // if(this.data.isSignIn == true)
    // {
    //   this.setData({ isCanSignIn: false})
    // }

    if (this.data.dept == "请选择部门" || this.data.userName == ""){
      this.setData({ isCanSignIn: false });
    }else{
      setTimeout(function () { wx.hideLoading() }, 1000)
    }

    
    

  },

  // 添加签到数据并更新签到次数到数据库
  onAdd: function() {
    var that = this;
    const db = wx.cloud.database()
    db.collection('scheduleList').add({
      data: {
        dayOfWeek: that.data.dayOfWeek,
        timePeriod: that.data.timePeriod,
        docName: that.data.userName,
        date: that.data.date,
        dept: that.data.dept,
        late: that.data.late,
        signOut: 0
      },
      success: res => {
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '签到成功',
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
    db.collection('scheduleSum').where({
      _openid: that.data.openid
    }).get({
      success(res) {
        
        if(res.data.length!=0){
        console.log(res.data)
        that.setData({
          count:res.data[0].count
        })
        
          db.collection('scheduleSum').doc(res.data._id).update({
          data: {
            count:that.data.count+1
          },
          success(res) {
            console.log('[数据库] [更新记录] 成功, 记录 _id:',res._id)
          },
          fail(err) {
            console.error('[数据库] [更新记录] 失败:',err)
          }
        })
        } else {
          console.log('建立新的对象文件');
          db.collection('scheduleSum').add({
            data: {
              member: that.data.userName,
              count: that.data.count
            },
            success(res) {
              console.log('[数据库] [新增记录] 成功, 记录 _id:',res._id)
            },
            fail(err) {
              console.error('[数据库] [新增记录] 失败:',err)
            }
          })
        }
      },
    })
  },

  //更新签到数据并更新签到次数到数据库
  onUpdate: function () {
    var that = this;
    const db = wx.cloud.database()
    db.collection('scheduleList').where({
      _openid: that.data.openid,
      date: that.data.date,
      signOut: 0
    }).get({
      success(res) {
        if (res.data.length != 0)
          console.log(res.data)
        db.collection('scheduleList').doc(res.data[0]._id).update({
          data: {
            signOut: 1
          },
          success(res) {
            wx.stopPullDownRefresh()
            that.setData({
              signOut: 1
            })
            wx.showToast({
              title: '签退成功',
            })
            console.log('[数据库][更新记录]成功:', res.data)
            that.judgeTime()
          }
        })

        var index_1 = that.data.timePeriodArray.indexOf(res.data[0].timePeriod)
        var index_2 = that.data.timePeriodArray.indexOf(that.data.timePeriod)
        if (index_1 != index_2) {
          for (var i = (index_1 + 1); i <= index_2; i++) {
            db.collection('scheduleList').add({
              data: {
                dayOfWeek: that.data.dayOfWeek,
                timePeriod: that.data.timePeriodArray[i],
                docName: that.data.userName,
                date: that.data.date,
                dept: that.data.dept,
                late: 0,
                signOut: 1
              },
              success(res) {
                console.log('[数据库] [新增记录] 成功:', res.data)
              }
            })
          }
          db.collection('scheduleSum').where({
            _openid: that.data.openid
          }).get({
            success(res) {
                console.log(res.data)
                that.setData({
                  count: res.data[0].count
                })
                db.collection('scheduleSum').doc(res.data._id).update({
                  data: {
                    count: that.data.count + index_2 - index_1
                  },
                  success(res) {
                    console.log('[数据库] [更新记录] 成功, 记录 _id:', res._id)
                  },
                  fail(err) {
                    console.error('[数据库] [更新记录] 失败:', err)
                  }
                })
            },
          })
        }
      }
    })
  },

  // 添加新用户数据到数据库
  onAddUserInfo: function() {
    var that = this;
    const db = wx.cloud.database()
    db.collection('404UserInfo').add({
      data: {
        userName: this.data.userName,
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

  // 查询函数，查询用户是否绑定信息
  onQuery: function() {
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('404UserInfo').where({
        _openid: that.data.openid
      })
      .get({
        success: function(res) {
          if (res.data == "") {
            that.setData({
              isBindInfo: false
            })
            return;
          }
          that.setData({
            isBindInfo: true,
            userName: res.data[0].userName,
            dept: res.data[0].dept
          })
          that.onQueryIsSign();
        },
      fail: function(res){
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

  // 查询函数，查询今天用户是否存在未签退的签到
  onQueryIsSign: function() {
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('scheduleList').where({
        _openid: that.data.openid,
        date: that.data.date,
        signOut: 0
      })
      .get({
        success: function(res) {
          if (res.data == "") {
            that.setData({
              isCanSignIn: true,
              word:"点击签到"
            })
            that.judgeTime();
            return;
          } else {
            console.log(res.data);
            that.setData({
              signOut:0,
              word: "点击签退",
            })
            that.judgeTime()
          };
        },
      fail: function(res){
        console.log(res.data)
        wx.hideLoading();
        wx.showToast({
          title: '当前网络不佳,请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
      })
  }
})