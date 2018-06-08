//app.js
var wechat = require('./utils/wechat.js');
var api = require('./utils/api.js');
App({
  wechat: wechat,
  API: api,
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wechat.login().then(function(res){
        if(res.code){
          wechat.getUserInfo().then(function(res){
            // console.log("获取用户信息",res);
            that.globalData.userInfo = res.userInfo
            typeof cb == "function" && cb(that.globalData.userInfo)
          });
        }else{
          console.log("登陆失败");
        }
      });
    }
  },
  onLaunch:function(){
    this.getUserInfo();
  },
  globalData:{
    userInfo:null
  }
})