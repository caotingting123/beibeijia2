// miniprogram/pages/selectMajor/selectMajor.js
const { $Message } = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    visible1: false,
    majorArray:null,
    actions1: [
      {
        name: '确定',
        color: '#ed3f14'
      }
    ]
  },

  handleOpen1(e) {
    var id = e.currentTarget.id
    this.setData({
      visible1: true,
      major_id:id
    });
  },

  handleCancel1() {
    this.setData({
      visible1: false
    });
  },

  handleClickItem1() {
    let that = this
    const action = [...this.data.actions1];
    wx.setStorage({
      key: 'selectedMajor',
      data: that.data.major_id,
    })
    this.setData({
      visible1:false
    })
    wx.navigateBack({
      delta:1
    })
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    const db = wx.cloud.database()
    db.collection('major')
    .get({
      success(res){
        that.setData({
          majorArray:res.data
        })        
      }
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