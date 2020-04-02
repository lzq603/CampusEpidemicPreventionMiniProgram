// pages/bind/bind.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

  },
  setMyInfo:function(res){
    console.log(res)
    const db = wx.cloud.database()
    const _ = db.command

    let that = this
    db.collection('identi').where({
      userInfo:res.detail.value
    }).get().then(result=>{
      console.log(result)
      if(result.data.length == 0){
        wx.showToast({
          title:'没有匹配的身份'
        })
      }else {
        console.log(res.detail.value)
        db.collection('users').where({
          userInfo: {
            no: res.detail.value.no
          }
        }).count().then(res=>{
          console.log(res)
          if (res.total > 0) {
            wx.showModal({
              title:'',
              content:'该号码已被其它微信号绑定',
              showCancel:false
            })
          }else{
            let myinfo = result.data[0].userInfo
            console.log(myinfo)

            app.globalData.userInfo.no = myinfo.no
            app.globalData.userInfo.name = myinfo.name
            // app.globalData.userInfo.phone = myinfo.phone
            app.globalData.userInfo.type = myinfo.type
            if(myinfo.type == '学生') {
              app.globalData.userInfo.class_ = myinfo.class_
              app.globalData.userInfo.department = myinfo.department
              delete app.globalData.userInfo['manage_classes']
            }else {
              app.globalData.userInfo.department = myinfo.department
              app.globalData.userInfo.manage_classes = myinfo.manage_classes ? myinfo.manage_classes : []
              delete app.globalData.userInfo['class_']
            }
            app.globalData.userInfo.temperatures = (app.globalData.userInfo.temperatures ? app.globalData.userInfo.temperatures :{
              am:null,
              pm:null
            })
            app.globalData.userInfo.members = []
            this.updateUserInfo(app.globalData.userInfo, app.globalData.userInfo.id)
          }
        })
      }
    })
  },

  // 更新用户信息
  updateUserInfo: function (userInfo, id) {
    console.log(userInfo)
    const db = wx.cloud.database()
    const _ = db.command

    userInfo.boundInfo = true
    db.collection('users').doc(id).update({
      // data 传入需要局部更新的数据
      data: {
        // 替换字段
        userInfo: _.set(userInfo),
        time: new Date()
      },
      success(res) {
        console.log(res)
        wx.navigateBack({})
      },
      fail(res) {
        console.log(res)
      }
    })
  }
})