// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

/**
 * 判断班的辅导员所管理的班级是否全部完成打卡
 * 参数：
 *  class_：班级名称
 * 返回：
 *  bool型
 */
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  var flag = false
  // 根据班级找到辅导员
  var counsellorId = null
  var resCoun = null
  await db.collection('users').where({
    userInfo:{
      manage_classes: _.elemMatch(_.eq(event.class_))
    }
  }).field({
    userInfo:true
  }).get().then(res=>{
    // console.log(res)
    resCoun = res
    counsellorId = res.data[0]._id
  })

  // 判断班里学生是否都已注册
  let identiNum = await db.collection('identi').where({
    userInfo: {
      class_: _.in(resCoun.data[0].userInfo.manage_classes)
    }
  }).field({
    userInfo: true
  }).count()
  let usersNum = await db.collection('users').where({
    userInfo: {
      class_: _.in(resCoun.data[0].userInfo.manage_classes)
    }
  }).field({
    userInfo: true
  }).count()
  if(identiNum!=usersNum) {
    return
  }

  // 统计这些班级学生人数和已完成打卡的人数
  await db.collection('users').where({
    userInfo: {
      class_: _.in(resCoun.data[0].userInfo.manage_classes)
    }
  }).field({
    userInfo: true
  }).get().then(res => {
    console.log(res)
    for (var i = 0; i < res.data.length; i++) {
      if (res.data[i].userInfo.temperatures.am == null || res.data[i].userInfo.temperatures.pm == null)
        return
    }
    flag = true
  })
  // 调用发送通知函数
  if(flag){
    return await cloud.callFunction({
      name: "remind",
      data: {
        type: "finish",
        id: counsellorId
      }
    })
  }else{
    return false
  }
}