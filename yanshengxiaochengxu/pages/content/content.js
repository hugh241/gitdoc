//answer.js
var util = require('../../utils/util.js')
import Promise from '../../utils/es6-promise.min'
var app = getApp()
Page({
  data: {
    id:'',
    pn: 1,
    total:0,
    fid:'',
    comment_max_show:5,
    list:[],
    comments:{}
  },
  api: app.API,
  onLoad: function (options) {
    if (JSON.stringify(options) =='{}'){
      var title = "Word天，许愿这种事落到吧友头上竟然变成这样……";
      wx.setNavigationBarTitle({ title: title })
      this.setData({
        id: "5521860466"
      });
    }else{
      var title = options.title;
      wx.setNavigationBarTitle({ title: title })
      this.setData({
        id: options.id
      });
    }
    
    this.getListData();
  },
  getListData :function(){
    wx.showLoading({
      title: '加载中...',
    })
    var that = this;
    this.getData().then(function (data) {
      wx.hideLoading();
      console.log("返回结果", data);
      console.log("PostList", data.postList);
      var d = data.data;
      var page = data.page;
      
      var list = [];
      for (var i = 0; i < d.length; i++) {
        if (d[i].badgeLv != "") {
          list.push(d[i]);
        }
      }
      that.setData({
        list: list,
        total: list.length,
        page: page
      })
      console.log(list);
      if (list.length > 0) {
        if (list[0].answers.content.forum_id == undefined){
          return;
        }
        that.setData({
          fid: list[0].answers.content.forum_id
        });
        that.totalComment().then(function (comment) {
          var commentList = comment.data.comment_list;

          var newDate = new Date();
          for (var key in commentList) {
            var comment_info = commentList[key]['comment_info'];
            for (var i = 0; i < comment_info.length; i++) {
              var nowtime = comment_info[i]['now_time'];
              newDate.setTime(nowtime * 1000);
              var nowTime = newDate.format('yyyy-MM-dd hh:mm');
              comment_info[i]['now_time'] = nowTime;
            }
            commentList[key]['comment_info'] = comment_info;
            commentList[key]['showpart'] = false;
            commentList[key]['pagesnum'] = Math.ceil(commentList[key].comment_num / commentList[key].comment_list_num);
            commentList[key]['pagesnumArr'] = new Array();
            for (var p = 0; p < commentList[key]['pagesnum']; p++) {
              commentList[key]['pagesnumArr'][p] = p + 1;
            }
            commentList[key]['currentpage'] = 1;
          }

          var userList = comment.data.user_list;
          that.setData({
            commentList: commentList,
            userList: userList
          });
          console.log(that.data.userList);
          console.log(that.data.commentList);
          console.log("结果数据", that.data.list);

          var comments = that.data.comments;
          for (var key in commentList) {
            comments[key] = {};
            comments[key]['comment_list_num'] = commentList[key]['comment_list_num'];
            comments[key]['comment_num'] = commentList[key]['comment_num'];
            comments[key]['currentpage'] = commentList[key]['currentpage'];
            comments[key]['pagesnum'] = commentList[key]['pagesnum'];
            comments[key]['pagesnumArr'] = commentList[key]['pagesnumArr'];
            comments[key]['showpart'] = commentList[key]['showpart'];
            comments[key]['comment_info'] = [];
            for (var ckey in commentList[key]['comment_info']) {
              comments[key]['comment_info'][ckey] = {};
              comments[key]['comment_info'][ckey]['contentarr'] = commentList[key]['comment_info'][ckey]['contentarr'];
              comments[key]['comment_info'][ckey]['now_time'] = commentList[key]['comment_info'][ckey]['now_time'];
              comments[key]['comment_info'][ckey]['nickname'] = userList[commentList[key]['comment_info'][ckey]['user_id']]['nickname'];
              comments[key]['comment_info'][ckey]['portrait'] = userList[commentList[key]['comment_info'][ckey]['user_id']]['portrait'];
            }
          }
          that.setData({
            comments: comments
          });
          console.log("初始化后的comments", comments);
          wx.pageScrollTo({
            scrollTop: 0
          })
        });
      }
    });
  },
  getData: function () {
    var that = this;
    var condition = "/" + that.data.id + "/" + that.data.pn;
    return new Promise((resolve, reject) => {
      that.api.get(that.api.getInvitation, condition).then(function (res) {
        resolve(res.data);
      });
    });
  },
  totalComment: function(){
    var that = this;
    var condition = "/" + that.data.id + "/" + that.data.fid + "/" + that.data.pn;
    return new Promise((resolve, reject) => {
      that.api.get(that.api.totalComment, condition).then(function (res) {
        resolve(res.data);
      });
    });
  },
  showMore: function(e){
    var id = e.target.dataset.itemid;
    var commentList = this.data.commentList;
    commentList[id]['showpart'] = true;
    this.setData({
      commentList: commentList
    });
  },
  commentPageJump: function(id){
    var commentList = this.data.commentList;
    var comment = commentList[id];
    var currentpage = comment['currentpage'];
    var that = this;
    var condition = "/" + that.data.id + "/" + id + "/" + currentpage;
    var promise = new Promise((resolve, reject) => {
      that.api.get(that.api.comment, condition).then(function (res) {
        resolve(res.data);
      });
    });
    promise.then(function(d){
      var comment_info = [];
      for (var key in d){
        comment_info[key] = {};
        comment_info[key]['contentarr'] = d[key]['contentarr'];
        comment_info[key]['now_time'] = d[key]['time'];
        comment_info[key]['nickname'] = d[key]['name'];
        comment_info[key]['portrait'] = d[key]['portrait'];
      }
      var comments = that.data.comments;
      comments[id]['comment_info'] = comment_info;
      that.setData({
        comments: comments
      });
    });
  },
  Pfirst: function(e){//首页
    var id = e.target.dataset.id;
    var commentList = this.data.commentList;
    commentList[id]['currentpage'] = 1;
    this.setData({
      commentList: commentList
    });
    this.commentPageJump(id);
  },
  Pprev: function (e) {//上一页
    var id = e.target.dataset.id;
    var commentList = this.data.commentList;
    commentList[id]['currentpage'] = commentList[id]['currentpage']*1-1;
    this.setData({
      commentList: commentList
    });
    this.commentPageJump(id);
  },
  Pjumpto: function (e) {//点击页数跳转
    var clickPage = e.target.dataset.pagenum;
    var commentList = this.data.commentList;
    var id = e.target.dataset.id;
    if (commentList[id]['currentpage'] != clickPage){
      commentList[id]['currentpage'] = clickPage;
      this.setData({
        commentList: commentList
      });
      this.commentPageJump(id);
    }
  },
  Pnext: function (e) {//下一页
    var id = e.target.dataset.id;
    var commentList = this.data.commentList;
    commentList[id]['currentpage'] = commentList[id]['currentpage'] * 1 + 1;
    this.setData({
      commentList: commentList
    });
    this.commentPageJump(id);
  },
  Plast: function (e) {//尾页
    var id = e.target.dataset.id;
    var commentList = this.data.commentList;
    commentList[id]['currentpage'] = commentList[id]['pagesnum'];
    this.setData({
      commentList: commentList
    });
    this.commentPageJump(id);
  },
  jump: function(e){
    var topage = e.target.dataset.topage;
    this.setData({
      pn:topage
    });
    this.getListData();
  }
})
