var app=getApp();
Page({
  data: {
    openid: "",
    butsrc: "../../images/qd.png",
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
    centerItems:[
      '请选择中心','信息技术中心','易班推广发展中心'
    ],
    centerIndex: 0,
    center: '请选择中心',
    deptItems: [
      '请选择部门', '研发部', '美工部', '网络部','行政部','运营部','宣传部','活动部'
    ],
    deptIndex: 0,
    dept: '请选择部门',
    inputMessage: '请输入姓名',
    userName: "",
    date: 0,
    time: 0,
    count: 0,//值班次数
    late: 0,//0代表没迟到，1代表迟到
    signIn:0,//0代表未签到，1代表签到
    signOut:1,//0代表没签退，1代表签退
    windowHeight: 440,
    windowWidth: 320
  },

  onLoad: function(options) {
    // this.onGetOpenid()
    this.setData({
      center:app.globalData.center,
      openid:app.globalData.openid,
      windowHeight:app.globalData.windowHeight,
      windowWidth:app.globalData.windowWidth
    })
    this.onQuery()
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
          that.onQueryIsEnroll();
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
              butsrc:'../../images/qd.png'
            })
          }else if(res.cancel){
            console.log('用户点击取消')
            return;
          }
        }
      })
    }
  },

  // 选定中心
  centerChange:function(e){
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
    }else{
      wx.showToast({
        title: '绑定成功',
      })
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

  // 判断当前签到的星期与签到时间段
  judgeTime: function() {
    var that=this;
    var hour = this.data.nowTime.getHours()
    var minute = this.data.nowTime.getMinutes()
    if (that.data.center == '信息技术中心') {
      switch (parseInt(hour)) {
        case 8:
          that.setData({
            nowClass: "8:00-9:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "A"
          })
          if (minute > 10) that.setData({
            late: 1//0代表没迟到，1代表迟到
          });
          break;
        case 9:
          that.setData({ timePeriod: "A" })
          if (minute < 30) {
            that.setData({
              nowClass: "8:00-9:40",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 10:
          that.setData({
            nowClass: "10:00-11:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "B"
          })
          if (minute > 10) that.setData({
            late: 1
          });
          break;
        case 11:
          that.setData({ timePeriod: "B" })
          if (minute < 30) {
            that.setData({
              nowClass: "10:00-11:40",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 14:
          that.setData({
            nowClass: "14:00-15:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "C"
          })
          if (minute > 10) that.setData({
            late: 1
          });
          break;
        case 15:
          that.setData({ timePeriod: "C" })
          if (minute < 30) {
            that.setData({
              nowClass: "14:00-15:40",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 16:
          that.setData({
            nowClass: "16:00-17:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "D"
          })
          if (minute > 10) that.setData({
            late: 1
          });
          break;
        case 17:
          that.setData({ timePeriod: "D" })
          if (minute < 30) {
            that.setData({
              nowClass: "16:00-17:40",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 19:
          that.setData({
            nowClass: "19:00-20:40",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "E"
          })
          if (minute > 10) that.setData({
            late: 1
          });
          break;
        case 20:
          that.setData({ timePeriod: "E" })
          if (minute < 30) {
            that.setData({
              nowClass: "19:00-20:40",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        default:
          that.setData({
            isSignIn: false,
            nowClass: "未到签到时间",
            isCanSignIn: false
          });
      }
    }else{
      switch (parseInt(hour)) {
        case 8:
          that.setData({
            nowClass: "8:00-10:00",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "A"
          })
          if (minute > 10) that.setData({
            late: 1//0代表没迟到，1代表迟到
          });
          break;
        case 9:
          that.setData({ timePeriod: "A" })
          if (minute < 50) {
            that.setData({
              nowClass: "8:00-10:00",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 10:
          that.setData({
            nowClass: "10:00-12:00",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "B"
          })
          if (minute > 10) that.setData({
            late: 1
          });
          break;
        case 11:
          that.setData({ timePeriod: "B" })
          if (minute < 50) {
            that.setData({
              nowClass: "10:00-12:00",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 14:
          that.setData({
            nowClass: "14:00-16:00",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "C"
          })
          if (minute > 10) that.setData({
            late: 1
          });
          break;
        case 15:
          that.setData({ timePeriod: "C" })
          if (minute < 50) {
            that.setData({
              nowClass: "14:00-16:00",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 16:
          that.setData({
            nowClass: "16:00-18:00",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "D"
          })
          if (minute > 10) that.setData({
            late: 1
          });
          break;
        case 17:
          that.setData({ timePeriod: "D" })
          if (minute < 50) {
            that.setData({
              nowClass: "16:00-18:00",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 18:
          if (minute >= 30 && minute <= 40) {
            that.setData({
              nowClass: "18:30-21:00",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              timePeriod: "E"
            })
          } else if (minute > 40) {
            that.setData({
              nowClass: "18:30-21:00",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              timePeriod: "E",
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        case 19:
          that.setData({
            nowClass: "18:30-21:00",
            isCanSignIn: that.data.signOut == 1 ? true : false,
            timePeriod: "E",
            late: 1
          });
          break;
        case 20:
          that.setData({ timePeriod: "E" })
          if (minute < 50) {
            that.setData({
              nowClass: "18:30-21:00",
              isCanSignIn: that.data.signOut == 1 ? true : false,
              late: 1
            })
          } else {
            that.setData({
              isSignIn: false,
              nowClass: "未到签到时间",
              isCanSignIn: that.data.signOut == 0 ? true : false
            })
          };
          break;
        default:
          that.setData({
            isSignIn: false,
            nowClass: "未到签到时间",
            isCanSignIn: false
          });
      }
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
    console.log(that.data.late)
    db.collection(this.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').add({
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
    db.collection(this.data.center == '信息技术中心' ? 'scheduleSum' : 'scheduleSum2').where({
      _openid: that.data.openid
    }).get({
      success(res) {
        if(res.data.length!=0){
        console.log(res.data)
        that.setData({
          count:res.data[0].count
        })
        } else {
          console.log('建立新的对象文件');
          db.collection(this.data.center == '信息技术中心' ? 'scheduleSum' : 'scheduleSum2').add({
            data: {
              member: that.data.userName,
              count: that.data.count,
              absent: 0
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
    db.collection(that.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').where({
      _openid: that.data.openid,
      date: that.data.date,
      signIn: 1,
      signOut: 0
    }).get({
      success(res) {
        console.log(res.data)
        var index_1 = that.data.timePeriodArray.indexOf(res.data[0].timePeriod)
        var index_2 = that.data.timePeriodArray.indexOf(that.data.timePeriod)
        console.log(res.data[0].timePeriod, that.data.timePeriod)
        console.log(index_1,index_2)
        if (index_1 != index_2) {
          for (var i = index_1; i <= index_2; i++) {
            db.collection(that.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').where({
              _openid: that.data.openid,
              date: that.data.date,
              timePeriod: that.data.timePeriodArray[i],
              signOut: 0
            }).get({
              success:function(res){
                if(res.data.length!=0){
                db.collection(that.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').doc(res.data[0]._id).update({
                  data: {
                    signIn: 1,
                    signOut: 1
                  },
                  success: function (res) {
                    wx.stopPullDownRefresh()
                    if (i == index_2) {
                      that.setData({
                        signOut: 1
                      })
                      wx.showToast({
                        title: '签退成功',
                      })
                    }
                    console.log('[数据库] [更新记录] 成功')
                  }
                })
                }
              }
            })
          }
          that.judgeTime()
        }
        db.collection(that.data.center == '信息技术中心' ? 'scheduleSum' : 'scheduleSum2').where({
          _openid: that.data.openid
        }).get({
          success(res) {
            console.log(res.data)
            that.setData({
              count: res.data[0].count
            })
            db.collection(that.data.center == '信息技术中心' ? 'scheduleSum' : 'scheduleSum2').doc(res.data[0]._id).update({
              data: {
                count: that.data.count + index_2 - index_1 + 1
              },
              success:function(res) {
                console.log('[数据库] [更新记录] 成功:',res.data)
              }
            })
          },
        })
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

  // 查询函数，查询用户是否绑定信息
  onQuery: function() {
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('404UserInfo').where({
        _openid: app.globalData.openid
      })
      .get({
        success: function(res) {
          if (res.data == "") {
            that.setData({
              isBindInfo: false
            })
            return;
          }else{that.setData({
            isBindInfo: true,
            userName: res.data[0].userName,
            center: res.data[0].center,
            dept: res.data[0].dept
          })
          console.log(that.data.center)
          }
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

  // 查询函数，查询今天用户是否存在已签到但未签退的记录
  onQueryIsSign: function() {
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    console.log(that.data.center)
    db.collection(this.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').where({
        _openid: that.data.openid,
        date: that.data.date,
        signIn: 1,
        signOut: 0
      })
      .get({
        success: function(res) {
          if (res.data == "") {
            that.setData({
              isCanSignIn: true,
              butsrc:'../../images/qd.png'
            })
            that.judgeTime();
            return;
          } else {
            console.log(res.data);
            that.setData({
              signOut:0,
              butsrc:'../../images/qt.png'
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
  },

  //查询函数，查询当前时段用户是否报班
  onQueryIsEnroll:function(){
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection(this.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').where({
      _openid: that.data.openid,
      date: that.data.date,
      signIn: 0,
      signOut: 0,
      late: 0,
      timePeriod:that.data.timePeriod
    }).get({
        success:function(res){
          if(res.data.length!=0){
            console.log(res.data)
            db.collection(that.data.center == '信息技术中心' ? 'scheduleList' : 'scheduleList2').doc(res.data[0]._id).update({
              data: {
                signIn:1,
                late:that.data.late
              },
              success:function(res){
                wx.stopPullDownRefresh()
                wx.showToast({
                  title: '签到成功',
                })
                that.setData({
                  signOut:0,
                  isCanSignIn: false,
                  butsrc:'../../images/qt.png'
                })
                console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
              }
            })
          }else{
            wx.showModal({
              title: '提示',
              content: '当前时段您未报班，无法签到',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定');
                }
              }
            })
          }
        }
      })
    db.collection(this.data.center == '信息技术中心' ? 'scheduleSum' : 'scheduleSum2').where({
      _openid: that.data.openid
    }).get({
      success(res) {
        if (res.data.length != 0) {
          console.log(res.data)
          that.setData({
            count: res.data[0].count
          })
        } else {
          console.log('建立新的对象文件');
          db.collection(this.data.center == '信息技术中心' ? 'scheduleSum' : 'scheduleSum2').add({
            data: {
              member: that.data.userName,
              count: that.data.count,
              absent: 0
            },
            success(res) {
              console.log('[数据库] [新增记录] 成功, 记录 _id:', res._id)
            },
            fail(err) {
              console.error('[数据库] [新增记录] 失败:', err)
            }
          })
        }
      },
    })
  },

  goToTable:function(){
      wx.navigateTo({
        url: this.data.center == '信息技术中心'?'../table/table':'../table2/table2',
      })
  },

  goToOrder:function(){
    wx.navigateTo({
      url: '../order/order',
    })
  }
})