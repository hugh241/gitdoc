//index.js
var util = require('../../utils/util.js')
import Promise from '../../utils/es6-promise.min'
var app = getApp()
Page({
  data: {
    list: [],
    list_length: 0,
    limit:20,
    offset:0,
    total:0,
    isMore:true,
    imgs: [],
    imgheights: [],
    swiperheights: [],
    currentNavtab: [],//当前第几个swiper
    showImgList:[],//是否显示图片切换列表
    transformArr:[],//图片选择角度
    translateY: [],
    swiperwidth:0
  },
  api:app.API,
  //事件处理函数
  _jump2Content: function(e) {
    wx.navigateTo({
      url: '../content/content?title='+e.target.dataset.title+'&id='+e.target.dataset.id
    })
  },
  showImgs: function(e){
    var i = e.target.dataset.row;
    var j = e.target.dataset.index;
    var showImgList = this.data.showImgList;
    showImgList[i] = true;
    var currentNavtab = this.data.currentNavtab;
    currentNavtab[i] = j;

    this.setData({
      showImgList: showImgList,
      currentNavtab: currentNavtab
    });
  },
  closeImgs: function(e){
    var i = e.target.dataset.row;
    var showImgList = this.data.showImgList;
    showImgList[i] = false;
    var currentNavtab = this.data.currentNavtab;
    currentNavtab[i] = 0;

    this.setData({
      showImgList: showImgList,
      currentNavtab: currentNavtab
    });
  },
  previewImage: function(e){
    var i = e.target.dataset.row;
    var imgs = this.data.list[i].imgs;
    var showImgs = [];
    for (var j = 0; j < imgs.length;j++){
      showImgs.push(imgs[j].original);
    }
    var that = this;
    wx.previewImage({
      current: showImgs[that.data.currentNavtab[i]], // 当前显示图片的http链接
      urls: showImgs  // 需要预览的图片http链接列表
    })
  },
  imageLoad: function (e) {
    //获取图片真实宽度    
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比    
      ratio = imgwidth / imgheight;
    //console.log(imgwidth, imgheight);  
    //计算的高度值    
    var i = e.target.dataset.row;
    var j = e.target.dataset.index;

    var imgs = this.data.imgs;
    if(!imgs[i]){
      imgs[i] = [];
    }
    imgs[i][j] = e;

    var viewWidth = 0;
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('.swiper').boundingClientRect();
    var that = this;
    query.exec(function (res) {
      //res就是 所有标签为mjltest的元素的信息 的数组
      //取宽度
      viewWidth = res[0].width;
      var viewHeight = viewWidth / ratio;
      var imgheight = viewHeight.toFixed(0);
      var imgheightarray = that.data.imgheights;
      //把每一张图片的高度记录到数组里  
      if (!(imgheightarray[i] instanceof Array)) {
        imgheightarray[i] = [];
      }
      imgheightarray[i][j] = imgheight;

      that.setData({
        imgheights: imgheightarray,
        swiperheights: imgheightarray,
        imgs: imgs,
        swiperwidth: viewWidth
      });
    })
  },
  turnleft: function(e){
    this._turn(e,90);
  },
  turnright: function (e) {
    this._turn(e, -90);
  },
  _turn: function(e,t){
    var i = e.target.dataset.row;
    var j = this.data.currentNavtab[i];
    var imgheights = this.data.imgheights;

    var transformArr = this.data.transformArr;
    if (transformArr[i] == undefined) {
      transformArr[i] = [];
    }
    if (transformArr[i][j] == undefined) {
      transformArr[i][j] = 0;
    }
    transformArr[i][j] = (transformArr[i][j] + t) % 360;

    var translateY = this.data.translateY;
    if (translateY[i] == undefined) {
      translateY[i] = [];
    }
    if (translateY[i][j] == undefined) {
      translateY[i][j] = 0;
    }

    var swiperheights = this.data.swiperheights;
    if (transformArr[i][j] % 180 == 0) {
      swiperheights[i][j] = this.data.imgheights[i][j];
      translateY[i][j] = 0;
    } else {
      swiperheights[i][j] = this.data.swiperwidth;
      translateY[i][j] = (this.data.swiperwidth - imgheights[i][j]) / 2;
    }

    this.setData({
      transformArr: transformArr,
      translateY: translateY,
      swiperheights: swiperheights
    });
  },
  onLoad: function () {
    //调用应用实例的方法获取全局数据
    this.refresh();
  },
  upper: function () {
    this.refresh();
  },
  lower: function (e) {
    this.nextLoad();
  },
  //使用本地 fake 数据实现刷新效果
  getData: function () {
    var data = [];
    var that = this;
    var condition = "/" + that.data.limit + "/" + that.data.offset;
    return new Promise((resolve, reject) => {
      that.api.get(that.api.HOTLIST, condition).then(function(res){
        console.log(res);
        resolve(res.data);
      });
    });
  },
  refresh: function () {
    wx.showNavigationBarLoading()
    wx.showToast({
      title: '正在搜索',
      icon: 'loading'
    })
    this.setData({
      offset: 0
    });
    var that = this;
    this.getData().then(function(data){
      wx.hideNavigationBarLoading(); 
      wx.stopPullDownRefresh();

      var list = data.list;
      var currentNavtab = that.data.currentNavtab;
      var showImgList = that.data.showImgList;
      for (var i = 0; i < list.length; i++) {
        currentNavtab[i] = 0;
        showImgList[i] = false;
      }
      
      that.setData({
        list: list,
        list_length: list.length,
        total:data.total,
        currentNavtab: currentNavtab,
        showImgList: showImgList,
        transformArr:[]
      });
      wx.hideLoading();
      console.log("热门动态 搜索", that.data.list);
    });
  },

  //使用本地 fake 数据实现继续加载效果
  nextLoad: function () {
    var that = this;
    console.log(that.data.total,that.data.offset + that.data.limit);
    if (that.data.total <= that.data.offset + that.data.limit){
      if (that.data.isMore){
        wx.showToast({
          title: '没有数据了',
          icon: 'success',
          duration: 2000
        })
      }
      that.data.isMore = false;
    } else {
      wx.showNavigationBarLoading()
      wx.showToast({
        title: '加载中',
        icon: 'loading'
      })
      that.setData({
        offset: that.data.offset + that.data.limit
      });
      this.getData().then(function (data) {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        var list = [].concat(that.data.list, data.list);
        var currentNavtab = that.data.currentNavtab;
        var showImgList = that.data.showImgList;
        for (var i = that.data.list_length;i < list.length;i++){
          currentNavtab[i] = 0;
          showImgList[i] = false;
        }
        that.setData({
          list: list,
          list_length: list.length,
          total: data.total,
          currentNavtab: currentNavtab,
          showImgList: showImgList
        });
        wx.hideLoading();
        console.log("热门动态 更多",that.data.list);
      });
    }
  },
  swiperChange: function (e) {     
    var currentNavtab = this.data.currentNavtab;
    currentNavtab[e.target.dataset.row] = e.detail.current;
    this.setData({
      currentNavtab: currentNavtab
    })
  }
})
