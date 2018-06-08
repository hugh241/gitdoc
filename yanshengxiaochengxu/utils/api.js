'use strict';
import Promise from './es6-promise.min'

var LocalPhpUrl = "http://192.168.100.241/";
var HOTLIST = LocalPhpUrl+"getHotList";
var getInvitation = LocalPhpUrl+"getInvitation";
var totalComment = LocalPhpUrl + "totalComment";
var comment = LocalPhpUrl + "comment";
module.exports = {
  LocalPhpUrl: LocalPhpUrl,
  HOTLIST: HOTLIST,
  getInvitation: getInvitation,
  totalComment: totalComment,
  comment: comment,
  get(url,str) {
    return new Promise((resolve, reject) => {
      console.log(url + str)
      url += str;
      wx.request({
        url: url,
        method: 'GET',
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res)
        }
      })
    })
  },

  post(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: Object.assign({}, data),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8;'
        },
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res)
        }
      })
    })
  },

  put(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: Object.assign({}, data),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8;'
        },
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res)
        }
      })
    })
  },

  delete(url) {
    return new Promise((resolve, reject) => {
      console.log(url)
      wx.request({
        url: url,
        method: 'DELETE',
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res)
        }
      })
    })
  },

  json2Form(json) {
    var str = []
    for (var p in json) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]))
    }
    return str.join("&")
  }
};

Date.prototype.format = function (format) {
  var date = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S+": this.getMilliseconds()
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in date) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1
        ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
    }
  }
  return format;
}