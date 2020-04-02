// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const MAX_LIMIT = 1000
exports.main = async (event, context) => {

  const { class_, department } = event

  let userInfo = {}
  if (class_) {
    userInfo.class_ = class_
  }
  if (department) {
    console.log(department)
    userInfo.department = department
    userInfo.type = _.neq('学生')
  }
  console.log(userInfo)
  let query = db.collection('users').where({ userInfo })
  // 先取出集合记录总数
  const countResult = await query.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = query.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return total ? (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  }) : { data: [] }
}