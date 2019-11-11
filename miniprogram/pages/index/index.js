// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 'index',
    isList:{
      index:true,
      search:false,
      community:false,
      mine:false
    }
  },
  /**
   * 点击事件
   */
  handleClick: function () {
    /**
     * 获取图片，完成查词操作
     */
    wx.chooseImage({
      success: res=> {
        let ImageBase64 = wx.getFileSystemManager().readFileSync(res.tempFilePaths[0],"base64")
        console.log(ImageBase64)
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