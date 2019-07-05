// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('counters').doc('XKc6ylsqTi00tqyM').update({
      data:{
        count:1
      }
    })
    } catch (e) {
    console.error(e)
  }
}