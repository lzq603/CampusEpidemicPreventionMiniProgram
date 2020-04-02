// miniprogram/pages/myClasses/myClasses.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected:[],
    class_list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({myClasses:app.globalData.userInfo.manage_classes})
    const db = wx.cloud.database()
    let that = this
    db.collection('classes').doc('class_set').get().then(res=>{
      // console.log(res.data.class_)
      var classes = []
      for (let major of res.data.major[app.globalData.userInfo.department]) {
        classes = classes.concat(res.data.class_[major])
      }
      that.setData({ classes })
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
    console.log(this.data.myClasses)
    const db = wx.cloud.database()
    let that = this
    db.collection('users').doc(app.globalData.userInfo.id).update({
      data:{
        userInfo:{
          manage_classes:that.data.myClasses
        }
      },
      success(res){
        console.log(res)
        app.globalData.userInfo.manage_classes = that.data.myClasses
        wx.showToast({
          title: '保存成功！'
        })
      },
      fail(res){
        wx.showToast({
          title: '保存失败！'
        })
      }
    })
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

  whichSelected: function(){
    this.setData({selected:[]})
    var classes = this.data.class_list
    var myClasses = this.data.myClasses
    var a = this.data.selected

    for (var i = 0; i < classes.length; i++) {
      if (myClasses.indexOf(classes[i]) >= 0) {
        a[i] = 1 
      }
    }
    this.setData({selected:a})
  },

  oninput: function(e){
    
    if (e.detail.value == ""){
      this.setData({class_list:[]})
      return
    }
    var classes = this.data.classes
    var myClasses = this.data.myClasses
    var temp = []
    for (var i = 0; i < classes.length; i++) {
      if(classes[i].includes(e.detail.value))
        temp.push(classes[i])
      if (temp.length >= 15) {break}
    }
    this.setData({class_list:temp})
    this.whichSelected()
  },

  // 删除班级
  delete: function(e){

    var index = e.target.dataset.index
    var classes = this.data.myClasses
    classes.splice(index, 1)
    this.setData({myClasses:classes})
    this.whichSelected()
  },
  // 添加班级
  add: function(e){
    console.log(e)
    var classes = this.data.myClasses
    var index = classes.indexOf(e.target.dataset.class_)
    if (index >= 0) {
      classes.splice(index, 1)
      console.log(classes)
      this.setData({myClasses:classes})
    }else{
      classes.push(e.target.dataset.class_)
      this.setData({myClasses:classes})
    }
    this.whichSelected()
  }
})