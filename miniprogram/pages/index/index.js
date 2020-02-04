// miniprogram/pages/index/index.js
var plugin = requirePlugin("WechatSI")
const db = wx.cloud.database(); //初始化数据库
//var mine = require("../mine/mine.js")
let manager =  plugin.getRecordRecognitionManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    currentPage:0,
    scrollTop:0,
    selectedMajor:"法学",
    current: 'index',
    isList:{
      index:true,
      search:false,
      community:false,
      mine:false
    },
    //进度条
    percent: 0,
    status: 'normal',

    current1: 'tab1',   //tab

    word_learned: 0,   //已学单词数
    word_unlearn: 0,   //未学单词数
    total_words: 0,   //该专业所有单词数
  },
  //上边的tab时间
  handleChange1({ detail }) {
    this.setData({
      current: detail.key
    });
    if (detail.key == "tab1") {
      this.onLoad()
    }
    else {
      wx.navigateTo({
        url: '../calendar/calendar',
      })
    }
  },
  
  initRecord:function(){
    manager.onRecognize = function (res) {
      console.log("current result", res.result)
    }
    manager.onStop = function (res) {
      console.log("record file path", res.tempFilePath)
      console.log("result", res.result)
    }
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.onError = function (res) {
      console.error("error msg", res.msg)
    }
  },
  handleSelect: function () {
    console.log("hehe")
    wx.navigateTo({
      url: '../selectMajor/selectMajor',
    })
  },
  /**
   * 点击事件
   */
  handleClickFromImage: function () {
    /**
     * 获取图片，完成查词操作
     */
    wx.chooseImage({
      success: res=> {
        let ImageBase64 = wx.getFileSystemManager().readFileSync(res.tempFilePaths[0],"base64")
        /**
         * 调用云函数
         */
        wx.cloud.callFunction({
          name:'wordapi',
          data:{
            ImageBase64:ImageBase64
          },
          success:res=>{
            console.log(res)
          }

        })
      },
    })
  },
  startClick:function(){
    manager.start()
  },
  stopClick:function(){
    manager.stop()
  },
  /**
   * 切换tab事件
   */
  handleChange ({ detail }){
    let that = this
    
    var key = detail.key
    let isList = that.data.isList
    for(var p in isList){
      isList[p] = false
    }
    isList[key] = true
    this.setData({
      current:detail.key,
      isList
    })
  },
  clickStudy:function(event){
    wx.navigateTo({
      url: '../reciteWord/reciteWord?major=' + event.target.dataset.major,
    });
    console.log(event.target.dataset.major)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                logged:true
              })
              this.getOpenidExt()
              
            }
          })
        }
      }
    })

    this.initRecord()
    this.handleMajor()
    
    //获取进度信息
    db.collection('studyProcess').where({
      _openid: this.data.openid,
      major: this.data.selectedMajor
    }).get().then(res => {
      console.log(this.data.selectedMajor)
      this.setData({
        word_learned: res.data[0].word_learned,
        word_unlearn: res.data[0].word_unlearn,
        total_words: res.data[0].total_words,
        percent: (res.data[0].word_learned / res.data[0].total_words * 100).toFixed(2)
      });
      
    }).catch(err => {
      console.log(err)
    })
  },
  onGetOpenid:function(){
    //mine.login()
  },
  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      const db = wx.cloud.database()
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      this.getOpenidExt()
    }
  },
  onExit:function(){
    if(this.data.logged && this.data.userInfo){
      this.setData({
        userInfo:null,
        avatarUrl: './user-unlogin.png',
        logged:false
      })
    }
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
    this.handleMajor()
    
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
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.onLoad()
    //模拟加载

    setTimeout(function () {

      // complete

      wx.hideNavigationBarLoading() //完成停止加载

      wx.stopPullDownRefresh() //停止下拉刷新

    }, 1500);
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
  onPageScroll(event) {
    this.setData({
      scrollTop: event.scrollTop
    })
  },
  /**
   * 获取用户openid+检查用户信息是否入库
   */
  getOpenidExt: function () {
    let that = this
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        that.addUserInfo(res.result.openid,that.data.userInfo)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  /**
   * 检查用户信息是否入库
   */
  addUserInfo: function (_openid, userInfo) {
    let that = this
    const db = wx.cloud.database()
    db.collection('users')
      .where({
        _openid: _openid
      })
      .get().then(res => {
        if (res.data.length == 0) {
          db.collection('users').add({
            data: {
              userInfo: userInfo,
              selectedMajor: null
            }
          })
        }
        else {
          // wx.setStorage({
          //   selectedMajor: res.data[0].selectedMajor
          // })
          // that.setData({
          //   selectedMajor: res.data[0].selectedMajor
          // })
        }
      })
  },
  /**
   * 利用缓存的专业信息，修改显示内容
   */
  handleMajor:function(){
    let that = this
    try {
      const db = wx.cloud.database()
      var value = wx.getStorageSync('selectedMajor')
      //console.log(value)
      //console.log(that.data.selectedMajor)
      if (value) {
        // Do something with return value
        if(value != that.data.selectedMajor){
          that.setData({
            selectedMajor:value
          })
          db.collection('community_infos')
            .where({
              major:value, // 填入当前用户 openid
            })
            .skip(that.data.currentPage * 10) // 跳过结果集中的前 10 条，从第 11 条开始返回
            .limit(10) // 限制返回数量为 10 条
            .get()
            .then(res => {
              //console.log(res.data)
              that.setData({
                communityInfos:res.data
              })
            })
            .catch(err => {
              console.error(err)
            })
        }
      }
    } catch (e) {
      // Do something when catch error
      console.log(e)
    }
  }
})