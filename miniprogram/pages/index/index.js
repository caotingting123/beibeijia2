// miniprogram/pages/index/index.js
var plugin = requirePlugin("WechatSI")
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
      console.log(value)
      console.log(that.data.selectedMajor)
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
              console.log(res.data)
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