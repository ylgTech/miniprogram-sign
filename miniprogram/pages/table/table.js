
var app = getApp()
var weeksArray = [];
var queryArray = [];
var lastNextNum = 0;

Page({

  data: {
    sch_listData: [],
    dateArray: [],
  },

  // 查询函数
  onQuery: function() {
    // var that = this;
    // const db = wx.cloud.database()
    // const _ = db.command
    // db.collection('scheduleList').where({
    //     date: _.in(queryArray)
    //   })
    //   .get({
    //     success: function(res) {
    //       wx.hideLoading();
    //       console.log(res.data)
    //       var sch_listData = dealData(res.data);
    //       that.setData({
    //         sch_listData: sch_listData
    //       })
    //     }
    //   })
    var that=this;
    wx.cloud.callFunction({
      name:'query',
      data:{
        queryArray: queryArray
      },
      complete:function(res){
        wx.hideLoading();
        console.log(res)
        var sch_listData=dealData(res.result.data);
        that.setData({
          sch_listData:sch_listData
        })
      }
    })
  },

  onLoad: function(options) {
    lastNextNum = 0;


    var daysArray = getSevenDays();
    this.onQuery();


    this.setData({
      dateArray: daysArray
    });
  },

  onShow: function() {
    lastNextNum = 0;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 2000)
  },


  clickDoctor: function(e) {
    var $dict = e.currentTarget.dataset;
    console.log(e)

    var tag = $dict.dayofweek; //周几
    var appdate = '';
    for (var k = 0; k < weeksArray.length; k++) {
      if (weeksArray[k].weekNum == tag - 1) {
        appdate = weeksArray[k].date_text;
      }
    }
    var dd = new Date();
    appdate = dd.getFullYear() + '/' + appdate;


    var str = '';
    var timeStr = $dict.timeperiod;
    if (timeStr == "A") {
      timeStr = '8:00-9:40';
    } else if (timeStr == "B") {
      timeStr = '10:00-11:40';
    } else if (timeStr == "C") {
      timeStr = '14:00-15:40';
    } else if (timeStr == "D") {
      timeStr = '16:00-17:40';
    } else if (timeStr == "E") {
      timeStr = '19:00-20:40';
    }


    str = appdate + ' ' + timeStr + ' ' + $dict.dept + ' ' + $dict.docname;
    wx.showModal({
      title: '提示',
      content: str,
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },

  //点击‘上一周’按钮
  lastWeek: function() {
    lastNextNum--;
    var daysArray = getSevenDays();
    this.onQuery();
    // var sch_listData = dealData(scheduleList);


    this.setData({
      dateArray: daysArray,
      // sch_listData: sch_listData,
    });

  },

  //点击‘下一周’按钮
  nextWeek: function() {
    lastNextNum++;
    var daysArray = getSevenDays();
    this.onQuery();
    // var sch_listData = dealData(scheduleList);


    this.setData({
      dateArray: daysArray,
      // sch_listData: sch_listData,
    });
  }

})




var getSevenDays = function() {
  var daysArray = [];
  var dayDict = {};
  var weekStr = '';
  var weekNum = '';
  var that = this;

  console.log(new Date().getDay());
  if (new Date().getDay() == 0){
    var k = -6;
  }else{
    var k = 1 - new Date().getDay();
  }
  

  queryArray = [];
  for (var i = k; i < k + 7; i++) {
    var date = new Date(); //当前日期
    var newDate = new Date();
    newDate.setDate(date.getDate() + i + 7 * lastNextNum);

    var y = newDate.getFullYear();

    var m = (newDate.getMonth() + 1) < 10 ? "0" + (newDate.getMonth() + 1) : (newDate.getMonth() + 1);
    var d = newDate.getDate() < 10 ? "0" + newDate.getDate() : newDate.getDate();
    var date = y * 10000 + m * 100 + d * 1;//d必须乘1，直接相加会变成字符串拼接
    queryArray = queryArray.concat(date)
    console.log(queryArray)

    var time = newDate.getFullYear() + "-" + m + "-" + d;
    var dayStr = m + "/" + d;

    if (getWeekByDay(time) == '周一') {
      weekNum = 0;
    } else if (getWeekByDay(time) == '周二') {
      weekNum = 1;
    } else if (getWeekByDay(time) == '周三') {
      weekNum = 2;
    } else if (getWeekByDay(time) == '周四') {
      weekNum = 3;
    } else if (getWeekByDay(time) == '周五') {
      weekNum = 4;
    } else if (getWeekByDay(time) == '周六') {
      weekNum = 5;
    } else if (getWeekByDay(time) == '周日') {
      weekNum = 6;
    }
    dayDict = {
      "date_text": dayStr,
      "weekName": getWeekByDay(time),
      "weekNum": weekNum
    };

    console.log("date_text:" + dayStr + "weekName:" + getWeekByDay(time) + "weekNum:" + weekNum)
    daysArray.push(dayDict);
  }

  weeksArray = daysArray;
  return daysArray;
}

var getWeekByDay = function(dayValue) {
  var day = new Date(Date.parse(dayValue.replace(/-/g, '/'))); //将日期值格式化  
  var today = new Array("周日", "周一", "周二", "周三", "周四", "周五", "周六"); //创建星期数组  
  return today[day.getDay()]; //返一个星期中的某一天，其中0为星期日  
}


var dealData = function(scheduleInfoList) {
  var tag = weeksArray[0].weekNum;
  console.log('tag:' + tag);
  var ar = [1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7];
  var A_Mon_text_ar = [];
  var A_Tues_text_ar = [];
  var A_Wed_text_ar = [];
  var A_Thur_text_ar = [];
  var A_Fri_text_ar = [];
  var A_Sat_text_ar = [];
  var A_Sun_text_ar = [];
  var B_Mon_text_ar = [];
  var B_Tues_text_ar = [];
  var B_Wed_text_ar = [];
  var B_Thur_text_ar = [];
  var B_Fri_text_ar = [];
  var B_Sat_text_ar = [];
  var B_Sun_text_ar = [];
  var C_Mon_text_ar = [];
  var C_Tues_text_ar = [];
  var C_Wed_text_ar = [];
  var C_Thur_text_ar = [];
  var C_Fri_text_ar = [];
  var C_Sat_text_ar = [];
  var C_Sun_text_ar = [];
  var D_Mon_text_ar = [];
  var D_Tues_text_ar = [];
  var D_Wed_text_ar = [];
  var D_Thur_text_ar = [];
  var D_Fri_text_ar = [];
  var D_Sat_text_ar = [];
  var D_Sun_text_ar = [];
  var E_Mon_text_ar = [];
  var E_Tues_text_ar = [];
  var E_Wed_text_ar = [];
  var E_Thur_text_ar = [];
  var E_Fri_text_ar = [];
  var E_Sat_text_ar = [];
  var E_Sun_text_ar = [];

  for (var i = 0; i < scheduleInfoList.length; i++) {
    // console.log(scheduleInfoList[i].scheduleId + "222222");
    if (scheduleInfoList[i].timePeriod == 'A') {
      if (scheduleInfoList[i].dayOfWeek == ar[tag]) {
        A_Mon_text_ar = A_Mon_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 1]) {
        A_Tues_text_ar = A_Tues_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 2]) {
        A_Wed_text_ar = A_Wed_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 3]) {
        A_Thur_text_ar = A_Thur_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 4]) {
        A_Fri_text_ar = A_Fri_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 5]) {
        A_Sat_text_ar = A_Sat_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 6]) {
        A_Sun_text_ar = A_Sun_text_ar.concat(scheduleInfoList[i]);
      }
    } else if (scheduleInfoList[i].timePeriod == 'B') {
      if (scheduleInfoList[i].dayOfWeek == ar[tag]) {
        B_Mon_text_ar = B_Mon_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 1]) {
        B_Tues_text_ar = B_Tues_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 2]) {
        B_Wed_text_ar = B_Wed_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 3]) {
        B_Thur_text_ar = B_Thur_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 4]) {
        B_Fri_text_ar = B_Fri_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 5]) {
        B_Sat_text_ar = B_Sat_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 6]) {
        B_Sun_text_ar = B_Sun_text_ar.concat(scheduleInfoList[i]);
      }
    } else if (scheduleInfoList[i].timePeriod == 'C') {
      if (scheduleInfoList[i].dayOfWeek == ar[tag]) {
        C_Mon_text_ar = C_Mon_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 1]) {
        C_Tues_text_ar = C_Tues_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 2]) {
        C_Wed_text_ar = C_Wed_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 3]) {
        C_Thur_text_ar = C_Thur_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 4]) {
        C_Fri_text_ar = C_Fri_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 5]) {
        C_Sat_text_ar = C_Sat_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 6]) {
        C_Sun_text_ar = C_Sun_text_ar.concat(scheduleInfoList[i]);
      }
    } else if (scheduleInfoList[i].timePeriod == 'D') {
      if (scheduleInfoList[i].dayOfWeek == ar[tag]) {
        D_Mon_text_ar = D_Mon_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 1]) {
        D_Tues_text_ar = D_Tues_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 2]) {
        D_Wed_text_ar = D_Wed_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 3]) {
        D_Thur_text_ar = D_Thur_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 4]) {
        D_Fri_text_ar = D_Fri_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 5]) {
        D_Sat_text_ar = D_Sat_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 6]) {
        D_Sun_text_ar = D_Sun_text_ar.concat(scheduleInfoList[i]);
      }
    } else if (scheduleInfoList[i].timePeriod == 'E') {
      if (scheduleInfoList[i].dayOfWeek == ar[tag]) {
        E_Mon_text_ar = E_Mon_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 1]) {
        E_Tues_text_ar = E_Tues_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 2]) {
        E_Wed_text_ar = E_Wed_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 3]) {
        E_Thur_text_ar = E_Thur_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 4]) {
        E_Fri_text_ar = E_Fri_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 5]) {
        E_Sat_text_ar = E_Sat_text_ar.concat(scheduleInfoList[i]);
      } else if (scheduleInfoList[i].dayOfWeek == ar[tag + 6]) {
        E_Sun_text_ar = E_Sun_text_ar.concat(scheduleInfoList[i]);
      }
    }
  }

  var sch_listData = [{
      "time_title": "8:00-9:40",
      "Mon_text": A_Mon_text_ar,
      "Tues_text": A_Tues_text_ar,
      "Wed_text": A_Wed_text_ar,
      "Thur_text": A_Thur_text_ar,
      "Fri_text": A_Fri_text_ar,
      "Sat_text": A_Sat_text_ar,
      "Sun_text": A_Sun_text_ar
    },
    {
      "time_title": "10:00-11:40",
      "Mon_text": B_Mon_text_ar,
      "Tues_text": B_Tues_text_ar,
      "Wed_text": B_Wed_text_ar,
      "Thur_text": B_Thur_text_ar,
      "Fri_text": B_Fri_text_ar,
      "Sat_text": B_Sat_text_ar,
      "Sun_text": B_Sun_text_ar
    },
    {
      "time_title": "14:00-15:40",
      "Mon_text": C_Mon_text_ar,
      "Tues_text": C_Tues_text_ar,
      "Wed_text": C_Wed_text_ar,
      "Thur_text": C_Thur_text_ar,
      "Fri_text": C_Fri_text_ar,
      "Sat_text": C_Sat_text_ar,
      "Sun_text": C_Sun_text_ar
    },
    {
      "time_title": "16:00-17:40",
      "Mon_text": D_Mon_text_ar,
      "Tues_text": D_Tues_text_ar,
      "Wed_text": D_Wed_text_ar,
      "Thur_text": D_Thur_text_ar,
      "Fri_text": D_Fri_text_ar,
      "Sat_text": D_Sat_text_ar,
      "Sun_text": D_Sun_text_ar
    },
    {
      "time_title": "19:00-20:40",
      "Mon_text": E_Mon_text_ar,
      "Tues_text": E_Tues_text_ar,
      "Wed_text": E_Wed_text_ar,
      "Thur_text": E_Thur_text_ar,
      "Fri_text": E_Fri_text_ar,
      "Sat_text": E_Sat_text_ar,
      "Sun_text": E_Sun_text_ar
    }
  ]

  return sch_listData;
}