// miniprogram/pages/selectMajor/selectMajor.js
const { $Message } = require('../../dist/base/index');
const db = wx.cloud.database()
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
    //查询studyProcess是否有该记录
    db.collection('studyProcess').where({
      _openid: 'owcam5DXxbjSC2hlK95LFDExXIZc', // 填入当前用户 openid\
      major: that.data.major_id
    }).count().then(res => {
      //console.log(that.data.major_id)
      //console.log(res.total)
      //如果没有该专业的进度信息，则添加
      if (res.total == 0){
        //查询所选major 的字典
        db.collection('major').where({
          name: that.data.major_id // 填入major
        }).get().then(res1 => {
          //console.log(res1.data[0].dictionary)
          //查询所选专业对应字典的单词记录数目
          db.collection(res1.data[0].dictionary).count().then(res2 => {
            //console.log(res2.total)
            //增加
            db.collection('studyProcess').add({
              // data 字段表示需新增的 JSON 数据
              data: {
                _openid: this.data.openid,
                major: that.data.major_id,
                total_words: res2.total,
                word_learned: 0,
                word_unlearn: res2.total
              }
            }).then(res3 => {
                console.log(res3)
              })
              .catch(console.error)
          })
        })
      } else {//已存在该记录，则更新
        
        //查询所选major 的字典
        db.collection('major').where({
          name: that.data.major_id // 填入major
        }).get().then(res1 => {
          console.log(res1.data[0].dictionary)
          //查询所选专业对应字典的单词记录数目
          db.collection(res1.data[0].dictionary).count().then(res2 => {
            //console.log(res2.total)
            //console.log(that.data.major_id)
            wx.cloud.callFunction({
              name: 'process',
              data: {
                major: that.data.major_id,
                studyNumber: 0,
                totalNumber: res2.total
              }
            }).then(res3 => {
              console.log(res3)
            }).catch(err => {
              console.log(err)
            })
          })
        })
        
      }
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