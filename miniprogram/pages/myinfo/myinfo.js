// pages/mycontact/mycontact.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [
      '学生',
      '辅导员',
      '教师',
      '副院长'
    ],
    department:'',
    major:'',
    class_index:[0, 0, 0],
    type_index: 0,
    department_index:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    let { no, name, class_, phone, type, department } = app.globalData.userInfo
    this.setData({
      myinfo: { no, name, class_, phone, type, department }
    })
    if(!this.data.myinfo.type){
      this.setData({'myinfo.type':'学生'})
    }
    const db = wx.cloud.database()
    let class_doc = db.collection('classes').doc('class_set')
    class_doc.get().then(res=>{
      console.log(res)
      that.setData({classes: res.data})
      that.setData({department: res.data.department[0]})
      that.setData({major: res.data.major[that.data.department][0]})


      if (app.globalData.userInfo.type === '学生') {
        for (let i in that.data.classes.department) {
          let department = that.data.classes.department[i]
          for (let j in that.data.classes.major[department]) {
            let major = that.data.classes.major[department][j]
            for (let k in that.data.classes.class_[major]) {
              let class_ = that.data.classes.class_[major][k]
              if (class_ === app.globalData.userInfo.class_) {
                that.setData({
                  class_index: [i, j, k],
                  department, major
                })
                break
              }
            }
          }
        }
      }
      else {
        that.setData({
          department_index: 
          app.globalData.userInfo.department ? that.data.classes.department.indexOf(app.globalData.userInfo.department) : 0
        })
      }
      that.setData({
        type_index: 
        app.globalData.userInfo.type ? that.data.types.indexOf(app.globalData.userInfo.type) : 0
      })
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
    let myinfo = res.detail.value
    console.log(myinfo)
    let that = this
    if(myinfo.no.trim() =='' ||
      myinfo.name.trim() == '' ||
      myinfo.type.trim() == '' ||
      (!myinfo.class_ && !myinfo.department) ||
      myinfo.phone.trim() == ''){
      wx.showToast({
        title: '输入完整信息',
        image:'/images/close.png'
      })
      return;
    }
    app.globalData.userInfo.no = myinfo.no
    app.globalData.userInfo.name = myinfo.name
    app.globalData.userInfo.phone = myinfo.phone
    app.globalData.userInfo.type = myinfo.type
    if(myinfo.type == '学生') {
      app.globalData.userInfo.class_ = myinfo.class_
      app.globalData.userInfo.department = this.data.classes.department[this.data.class_index[0]]
      delete app.globalData.userInfo['manage_classes']
    }else {
      app.globalData.userInfo.department = myinfo.department
      app.globalData.userInfo.manage_classes = (app.globalData.userInfo.manage_classes?app.globalData.userInfo.manage_classes:[])
      delete app.globalData.userInfo['class_']
    }
    app.globalData.userInfo.last_checkin_at = (app.globalData.userInfo.last_checkin_at ? app.globalData.userInfo.last_checkin_at:null)
    app.globalData.userInfo.temperatures = (app.globalData.userInfo.temperatures ? app.globalData.userInfo.temperatures :{
      am:null,
      pm:null
    })
    this.updateUserInfo(app.globalData.userInfo, app.globalData.userInfo.id)
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
  },
  // 修改某一列
  bindMultiPickerColumnChange:function(e){
    // console.log(e)
    let that = this
    if(e.detail.column == 0){ //修改学院
      this.setData({department:that.data.classes.department[e.detail.value]})
      this.setData({ major: that.data.classes.major[that.data.department][0] })
      this.setData({ class_index:[e.detail.value, 0, 0] })
    }else if(e.detail.column == 1){  //修改专业
      this.setData({ major: that.data.classes.major[that.data.department][e.detail.value] })
      var index_arr = this.data.class_index
      this.setData({ class_index: [index_arr[0], e.detail.value, 0] })
    }
  },
  // 修改班级
  changeClass: function(e){
    let that = this
    // console.log(e)
    if (this.data.myinfo.type == '学生') {
      this.setData({ class_index: e.detail.value})
      this.setData({'myinfo.class_':that.data.classes.class_[that.data.major][that.data.class_index[2]]})
    }else{
      this.setData({ department_index: e.detail.value})
      this.setData({'myinfo.department':that.data.classes.department[that.data.department_index]})
    }
  },
  // 改变类别
  changeType: function(e){
    this.setData({
      'myinfo.type': this.data.types[e.detail.value]
    })
  }
})