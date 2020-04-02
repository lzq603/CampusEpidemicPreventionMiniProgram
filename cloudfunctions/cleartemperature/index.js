// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
/**
 * 每天定时清空昨天的体温数据
 */
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const usersCollection = db.collection('users')
  await usersCollection.where({
    _id: _.neq(null)
  }).update({
    data:{
      userInfo: {
        temperatures: {
          am: null,
          pm: null
        },
        members:[]
      }
    }
  })
}