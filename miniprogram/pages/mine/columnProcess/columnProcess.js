const db = wx.cloud.database()
var wxCharts = require('../../../utils/wxcharts.js');
var app = getApp();
var columnChart = null;
var chartData = {
  main: {
    title: '学习进度',
    data: [15],
    categories: ['2012']
  },
};
Page({
  data: {
    chartTitle: '学习进度',
    isMainChartDisplay: true,
   
  },
    
  onLoad: function (options) {
    db.collection('studyProcess').get().then(res => {
      // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
      var majorList = []
      var percentList = []
      var percent = 0
      for (var i = 0; i < res.data.length; i++) {
        majorList = majorList.concat(res.data[i].major)
        
        percentList = percentList.concat(res.data[i].word_learned / res.data[i].total_words * 100)
      }
     // console.log(majorList)
      chartData.main.categories = majorList
      chartData.main.data = percentList
      //console.log(chartData.main.categories)
      this.bar()
    })
    
  },
  onReady: function (e) {
    db.collection('major').get().then(res => {
      // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
      var majorList = []
      for (var i = 0; i < res.data.length; i++) {
        majorList = majorList.concat(res.data[i].name)
      }
     // console.log(majorList)
      chartData.main.categories = majorList
      //console.log(chartData.main.categories)
    })
    

    
  },
  bar:function(){
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    columnChart = new wxCharts({
      canvasId: 'columnCanvas',
      type: 'column',
      animation: true,
      categories: chartData.main.categories,
      series: [{
        name: '学习进度',
        data: chartData.main.data,
        format: function (val, name) {
          return val.toFixed(2) + '%';
        }
      }],
      yAxis: {
        format: function (val) {
          return val + '%';
        },
        title: '进度',
        min: 0
      },
      xAxis: {
        disableGrid: false,

        type: 'calibration'
      },
      extra: {
        column: {
          width: 15
        }
      },
      width: windowWidth,
      height: 200,
    });
  }
});