// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
try{
  const { userInfo, queryArray } = event
  return await db.collection('scheduleList').where({
    date:db.command.in(queryArray)
  }).get();
}catch(e){
  console.error(e)
}
}