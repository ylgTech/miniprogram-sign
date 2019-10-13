//app.js
App({
  globalData:{
    openid:'',
    center:'',
    windowHeight: 0,
    windowWidth:0
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
		//env: 'release',
      })
    }
    this.globalData = {}
  }
})
