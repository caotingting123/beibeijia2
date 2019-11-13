// miniprogram/pages/index/index.js
var plugin = requirePlugin("WechatSI")
var mine = require("../mine/mine.js")
let manager =  plugin.getRecordRecognitionManager()

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
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    this.initRecord()
  },
  onGetOpenid:function(){
    mine.login()
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

  }
})