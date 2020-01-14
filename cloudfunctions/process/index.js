// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    
    return await db.collection('studyProcess').where({
      _openid: wxContext.OPENID,
      major: event.major
    })
      .update({
        data: {
          word_learned: _.inc(event.studyNumber),
          word_unlearn: _.inc(-event.studyNumber)
        },
      })
  } catch (e) {
    console.error(e)
  }

  
}


