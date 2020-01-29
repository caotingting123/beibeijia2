// pages/reciteWord/reciteWord.js
const db = wx.cloud.database(); //初始化数据库
var app = getApp();
let touchDotX = 0; //X按下时坐标
let touchDotY = 0; //y按下时坐标
let card_color = new Array("#e6dbd1", "#ece4dc", "#f2ede8", "#f2ede8", "#ffffff") 
Page({

  /**
   * 页面的初始数据
   */
  
  data: {
    MainorBack:true,
    
    couci:"",       //错词
    wordslist:{},   //单词列表
    i:0,        //第几个单词
    major:"",   //专业
    openid:"",
    word_learned:0,   //已学单词数
    word_unlearn:0,   //未学单词数
    studyNumber:0,   //本次学习单词数
    total_words:0,   //该专业所有单词数
  },
  rotateFn: function () {
    
    this.animation_main = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear'
    })
    this.animation_back = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear'
    })
    // 点击正面

    if (this.data.MainorBack) {
      this.animation_main.rotateY(180).step()
      this.animation_back.rotateY(0).step()
      this.setData({
        animationData: this.animation_main.export(),
        MainorBack: false
      })
    }
    else { // 点击背面
      
      this.animation_main.rotateY(0).step()
      this.animation_back.rotateY(-180).step()
      this.setData({
        animationData: this.animation_main.export(),
        MainorBack: true
      })
      
    }
    
  },
  _UnKnow:function(event){
    //console.log(this.data.wordslist[this.data.i].word)
    this.setData({
      studyNumber: this.data.studyNumber + 1
    })
    
    db.collection('cuoci').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        word: this.data.wordslist[this.data.i].word,
        mean: this.data.wordslist[this.data.i].mean,
        date: new Date(),
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        //console.log(res)
        wx.showToast({
          title: '已添加到错词本',
        })
      },
      fail:console.error
    })
  },
  _Know:function(){
    this.setData({
      studyNumber: this.data.studyNumber + 1,
      i: this.data.i + 1,
    })
    if (this.data.i >= this.data.wordslist.length) {
      this.isEnd()
    }
  },
  nextWord:function(){
    this.rotateFn()
    this.setData({
      studyNumber: this.data.studyNumber + 1,
      i: this.data.i+1,
    })
    if (this.data.i >= this.data.wordslist.length){
      this.isEnd()
    }//end if
  },
  getOpenid:function(){
    
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      this.setData({
        openid:res.result.openid
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  isEnd:function(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '真棒，该专业单词学完啦！',
      confirmText: '从头再来',
      cancelText: '不了谢谢',
      success(res) {
        if (res.confirm) {
          that.setData({
            i: 0,
          });
          //修改进度
          wx.cloud.callFunction({
            name: 'process',
            data: {
              major: that.data.major,
              totalNumber:124,
              studyNumber: -that.data.total_words
            }
          }).then(res2 => {
            wx.showToast({
              title: '学习进度已修改',
            })
          }).catch(err => {
            console.log(err)
          })
          //end修改进度
        } else if (res.cancel) {
          that.setData({
            i: that.data.i - 1,
          })
        }
      },
      fail: console.error
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options)
    
    this.setData({
      major:options.major
    });
    db.collection('studyProcess').where({
      _openid: this.data.openid,
      major: options.major
    }).get().then(res=>{
      this.setData({
        word_learned: res.data[0].word_learned,
        word_unlearn: res.data[0].word_unlearn, 
        total_words: res.data[0].total_words
      });
      this.setData({
        i: this.data.word_learned 
      });
      }).catch(err => {
        console.log(err)
      })
    
    db.collection('computer_dictionary').get().then(res => {
      // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
      this.setData({
        wordslist: res.data
      });
      if (this.data.word_learned >= this.data.wordslist.length){
        this.isEnd()
      }
    }).catch(err=>{
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
    console.log("页面隐藏")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("页面卸载")
    if (this.data.studyNumber + this.data.word_learned > this.data.total_words){
      this.setData({
        studyNumber: this.data.total_words - this.data.word_learned
      })
    }
    wx.cloud.callFunction({
      name:'process',
      data:{
        major:this.data.major,
        totalNumber: 124,
        studyNumber:this.data.studyNumber
      }
    }).then(res=>{
      wx.showToast({
        title: '学习进度已保存',
      })
    }).catch(err=>{
      console.log(err)
    })
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