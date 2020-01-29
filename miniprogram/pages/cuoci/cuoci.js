// pages/cuoci/cuoci.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wrongWord:[],
  },
  delCuoci:function(event){
    //console.log(event.currentTarget.dataset.cuoci)
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否将该词移出错词本？',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name:"delCuoci",
            data:{
              word: event.currentTarget.dataset.cuoci
            }
          }).then(res=>{
            that.onLoad()
            wx.showToast({
              title: '已移除',
            })
            
          })
        } else if (res.cancel) {
          
        }
      },
      fail: console.error
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => {
      db.collection('cuoci').where({
        _openid: res.result.openid
      }).get().then(res2 => {
        
        for (var i = 0; i < res2.data.length; i++ ){
          res2.data[i].date = JSON.stringify(res2.data[i].date).split("T")[0].split("\"")[1]
        }
        console.log(res2)
        this.setData({

          wrongWord: res2.data
        })
        
      })
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