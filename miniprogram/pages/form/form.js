// miniprogram/pages/form/form.js
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    temperature_range: [
      Array(8).fill(0).map((_, index) => index + 35), // 体温可能范围35-42
      Array(10).fill(0).map((_, index) => `.${index}`)
    ],
    tempIndexes: [
      {
        am: [0, 0],
        pm: [0, 0]
      }
    ],
    temperatures: [
      {
        am: '',
        pm: ''
      }
    ],
    location: '',
    memberNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 设置picker当前状态为当前体温
    let tempIndexes = []
    let temperatures = []
    let members = [
      {
        temperatures: app.globalData.userInfo.temperatures
      }
    ].concat(app.globalData.userInfo.members)
    for(let i in members) {
      tempIndexes[i] = {}
      temperatures[i] = {}
      let t = members[i].temperatures
      for(let time of ['am', 'pm']) {
        if (t && t[time]) {
          temperatures[i][time] = t[time]
          let [integer_part, decimal_part] = t[time].split('.')
          tempIndexes[i][time] = [
            this.data.temperature_range[0].indexOf(parseInt(integer_part)),
            parseInt(decimal_part)
          ]
        }
        else {
          tempIndexes[i][time] = [0, 0]
          temperatures[i][time] = ''
        }
      }
    }
    let checked = app.globalData.userInfo.last_checkin_at.toDateString() === new Date().toDateString()
    this.setData({
      memberNum: members.length - 1,
      tempIndexes,
      temperatures,
      location: checked && app.globalData.userInfo.location || ''
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
  getLocation() {
    const that = this
    wx.getLocation({
      success: function(res) {
        console.log(res)
        wx.request({
          url: 'https://api.map.baidu.com/reverse_geocoding/v3',
          data: {
            ak: 'fxfkGHPAU2H1mRzeu1DeAkGECSUgknBw',
            location: `${res.latitude},${res.longitude}`,
            output: 'json'
          },
          success(res) {
            console.log(res)
            let addr = res.data.result.addressComponent
            that.setData({
              location: addr.province + addr.city + addr.district
            })
          }
        })
      },
      fail(err) {
        console.log(err)
        wx.showModal({
          title: '位置未授权',
          content: '根据填报要求，需要获取您的位置',
          showCancel: true,
          cancelText: '取消',
          confirmText: '去授权',
          success: function(res) {
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  console.log(res)
                }
              })
            }
          },
        })
      }
    })
  },
  changeTemp(e) {
    let {index, time} = e.currentTarget.dataset
    let [i, j] = e.detail.value
    this.setData({
      [`tempIndexes[${index}].${time}]`]: [i, j],
      [`temperatures[${index}].${time}`]: this.data.temperature_range[0][i] + this.data.temperature_range[1][j]
    })
  },
  changeNum(e) {
    let num = +e.detail.value + 1
    let {tempIndexes, temperatures} = this.data
    tempIndexes.splice(num)
    temperatures.splice(num)
    while(tempIndexes.length < num) {
      tempIndexes.push({
        am: [0, 0],
        pm: [0, 0]
      })
      temperatures.push({
        am: '',
        pm: ''
      })
    }
    this.setData({
      memberNum: num - 1,
      tempIndexes,
      temperatures
    })
  },
  submit() {
    const that = this

    for(let temperature of this.data.temperatures) {
      if(temperature.am && temperature.pm) {
        continue
      }
      wx.showToast({
        title: '体温未填完',
        icon: 'none'
      })
      return
    }
    if (!this.data.location) {
      wx.showToast({
        title: '未获取位置',
        icon: 'none'
      })
      return
    }

    let temperatures = this.data.temperatures[0]
    let members = this.data.temperatures.slice(1).map(it => ({
      temperatures: it
    }))
    let last_checkin_at = new Date()
    let location = this.data.location
    app.globalData.userInfo.temperatures = temperatures
    app.globalData.userInfo.members = members
    app.globalData.userInfo.last_checkin_at = last_checkin_at
    app.globalData.userInfo.lastLocation = app.globalData.userInfo.location
    app.globalData.userInfo.location = location
    console.log(app.globalData.userInfo)
    db.collection('users').doc(app.globalData.userInfo.id).update({
      data: {
        userInfo: {
          temperatures,
          members,
          last_checkin_at,
          location,
          lastLocation: app.globalData.userInfo.lastLocation
        }
      }
    }).then(res => {
      
      var cla = app.globalData.userInfo.class_
      if (cla) {
        wx.cloud.callFunction({
          name: 'isFinish',
          data: {
            class_: app.globalData.userInfo.class_
          },
          success(res) {
            console.log(res)
          }
        })
      }

      wx.navigateBack({
        success() {
          wx.showToast({
            title: '填报成功',
          })
        }
      })
    })
  }
})