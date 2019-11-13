// 云函数入口文件
const cloud = require('wx-server-sdk')
const tencentcloud = require('tencentcloud-sdk-nodejs')  

const OcrClient = tencentcloud.ocr.v20181119.Client
const models = tencentcloud.ocr.v20181119.Models

const Credential = tencentcloud.common.Credential
const ClientProfile = tencentcloud.common.ClientProfile
const HttpProfile = tencentcloud.common.HttpProfile

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let cred = new Credential("AKIDrWx96qPsJXagYAStxqTGp8ByWqtiCR0m","jqrqcrqbdHfnfOAqNn10jDRTFm6B0Zx8")

  let httpProfile = new HttpProfile
  httpProfile.reqMethod = "POST"
  httpProfile.reqTimeout = 3000
  httpProfile.endPoint = "ocr.tencentcloudapi.com"

  let clientProfile = new ClientProfile()
  clientProfile.signMethod = "HmacSHA256"
  clientProfile.httpProfile = httpProfile

  let client = new OcrClient(cred,"ap-beijing",clientProfile)

  let req = new models.EnglishOCRRequest()
  req.ImageBase64 = event.ImageBase64

  var res
  client.EnglishOCR(req,function(err,response){
    if(err){
      console.log(err)
      return 0;
    }
    res = response
  })
  // return {
  //   //event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  //   response: res
  // }
  return new Promise((resolve,reject) => {
    setTimeout(() => {
      resolve(res)
    },3000)
  })
}