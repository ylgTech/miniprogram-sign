var app = getApp()
Page({

  data: {
    item:[],
    no:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var that=this;
    // const db=wx.cloud.database()
    // //按count值降序排序并打印结果
    // db.collection('scheduleSum').orderBy('count','desc')
    // .get({
    //   success(res){
    //     console.log('[数据库] [排序记录] 成功：',res.data)
    //     that.setData({
    //       //将返回数据数组传入data的空数组item中
    //       item:that.data.item.concat(res.data)
    //     })
    //   }
    // })
    this.onQuery();
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

 onQuery:function(){
   var that=this;
   wx.cloud.callFunction({
     name:'order',
     data:{},
     success:function(res){
       wx.hideLoading();
       console.log('[数据库] [排序记录] 成功：', res)
       that.setData({
        //将返回数据数组传入data的空数组item中
        item:that.data.item.concat(res.result.data)
       })
     },
     fail:console.error
   })
 } 

})