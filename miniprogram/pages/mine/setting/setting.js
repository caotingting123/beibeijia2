// miniprogram/pages/mine/setting/setting.js
const db = wx.cloud.database(); //初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newIndex:0,
    newArray:[5,10,15,20,25,30,35,40,45,50],
    oldIndex: 0,
    oldArray: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
  },
  newPickerChange:function(e){
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      newIndex: e.detail.value
    })
    wx.showLoading({
      title: '正在保存',
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'updataUsers',
      // 传递给云函数的event参数
      data: {
        newWordIndex: e.detail.value,
        oldWordIndex: this.data.oldIndex,
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '设置已保存',
      })
    }).catch(err => {
      // handle error
    })
  },
  oldPickerChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      oldIndex: e.detail.value
    })
    wx.showLoading({
      title: '正在保存',
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'updataUsers',
      // 传递给云函数的event参数
      data: {
        newWordIndex: this.data.newIndex,
        oldWordIndex: e.detail.value,
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '设置已保存',
      })
    }).catch(err => {
      // handle error
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取进度信息this.data.openid
    db.collection('users').get().then(res => {
      this.setData({
        newIndex: res.data[0].newWordIndex,
        oldIndex: res.data[0].oldWordIndex
      });
    }).catch(err => {
      console.log(err)
    })
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