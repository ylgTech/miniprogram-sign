var app = getApp()
Page({

  data: {
    item:[],
    no:0,
    windowHeight:440,
    windowWidth:320
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    this.setData({
      windowHeight:app.globalData.windowHeight,
      windowWidth:app.globalData.windowWidth
    })
    if (app.globalData.center=='信息技术中心'){
      that.onQuery()
    }
    if (app.globalData.center=='易班推广发展中心'){
      that.onQuery2()
    }
    console.log(that.data.item)
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  
 onQuery:function(){
   var that=this;
   wx.cloud.callFunction({
     name:'orderXinxi',
     data:{},
     success:function(res){
       wx.hideLoading();
       console.log('[数据库] [排序记录] 成功：', res)
       //将返回数据数组传入data的空数组tempitem中
       var tempitem=that.data.item.concat(res.result.data)
       for(var i=0;i<tempitem.length;i++){
         if(tempitem[i].absent==1){
           tempitem.splice(i,1)
           i=i-1
         }
       }
       that.setData({
        item:tempitem
       })
     },
     fail:console.error
   })
 } ,

  onQuery2: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'orderYiban',
      data: {},
      success: function (res) {
        wx.hideLoading();
        console.log('[数据库] [排序记录] 成功：', res)
        //将返回数据数组传入data的空数组tempitem中
        var tempitem = that.data.item.concat(res.result.data)
        for (var i = 0; i < tempitem.length; i++) {
          if (tempitem[i].absent == 1) {
            tempitem.splice(i, 1)
            i = i - 1
          }
        }
        that.setData({
          item: tempitem
        })
      },
      fail: console.error
    })
  } 

})