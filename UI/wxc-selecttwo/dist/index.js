export default Component({
  behaviors: [],
  properties: {
    partLeft: {
      type: String,
      value: 'partLeft'
    },
    partCenter: {
      type: String,
      value: 'partCenter'
    },
    partRight: {
      type: String,
      value: 'partRight'
    },
    rightContent: {
      type: Array,
      value: []
    },
    curYear:{
      type:Number,
      value:2018
    },
    curMonth: {
      type: Number,
      value: 1
    },
    curDate:{
       type: Number,
       value: 1
    }
  },
  data: {
    fullbgShow: false,
    leftOpen: false,
    leftShow: false,
    centerOpen: false,
    rightOpen: false,
    centerShow: false,
    rightShow: false,
    isfull: false,
    shownavindex: '',
    'type': 'normal',
  },
  methods: {
    listpx: function (e) {
      this.setData({
        partRight:''
      })
      this.triggerEvent('listRight');
      // if (this.data.rightOpen) {
      //   this.setData({
      //     showPicker: false,
      //     rightStatus: 'slidup',
      //     fullbgShow: false,
      //     centerOpen: false,
      //     rightOpen: false,
      //     leftOpen: false,
      //     centerShow: true,
      //     rightShow: false,
      //     leftShow: true,
      //     isfull: false,
      //     shownavindex: 0
      //   })
      //   this.closeDatePicker()
      // } else {
      //   this.setData({
      //     rightStatus: 'slidown',
      //     showPicker: false,
      //     fullbgShow: true,
      //     centerOpen: false,
      //     rightOpen: true,
      //     leftOpen: false,
      //     centerShow: true,
      //     rightShow: false,
      //     leftShow: true,
      //     isfull: true,
      //     shownavindex: e.currentTarget.dataset.nav
      //   })
        // this.closeDatePicker()
      // }
    },
    rightSelect: function (e) {
      var e=e.currentTarget.dataset.content
      this.triggerEvent('rightSelect',e);
      this.hidebg();
    },

    hidebg: function (e) {
      this.triggerEvent('hidebg');
      this.setData({
        showPicker:false,
        fullbgShow: false,
        leftOpen: false,
        centerOpen: false,
        rightOpen: false,
        centerShow: true,
        rightShow: true,
        leftShow: true,
        isfull: false,
        shownavindex: 0
      })
      this.closeDatePicker()
    },

    getThisMonthDays(year, month) {
      return new Date(year, month, 0).getDate();
    },
    /**
     * 计算指定月份第一天星期几
     * @param {number} year 年份
     * @param {number} month  月份
     */
    getFirstDayOfWeek(year, month) {
      return new Date(Date.UTC(year, month - 1, 1)).getDay();
    },
    /**
     * 计算当前月份前后两月应占的格子
     * @param {number} year 年份
     * @param {number} month  月份
     */
    calculateEmptyGrids: function (year, month) {
      this.calculatePrevMonthGrids(year, month);
      this.calculateNextMonthGrids(year, month);
    },
    afterTapDay(currentSelect) {
      console.log('当前点击的日期', currentSelect);
    },
    /**
     * 计算上月应占的格子
     * @param {number} year 年份
     * @param {number} month  月份
     */
    calculatePrevMonthGrids(year, month) {
      const prevMonthDays = this.getThisMonthDays(year, month - 1);
      const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
      let empytGrids = [];
      if (firstDayOfWeek > 0) {
        const len = prevMonthDays - firstDayOfWeek;
        for (let i = prevMonthDays; i > len; i--) {
          empytGrids.push(i);
        }
        this.setData({
          'datepicker.empytGrids': empytGrids.reverse(),
        });
      } else {
        this.setData({
          'datepicker.empytGrids': null,
        });
      }
    },
    /**
     * 计算下月应占的格子
     * @param {number} year 年份
     * @param {number} month  月份
     */
    calculateNextMonthGrids(year, month) {
      const thisMonthDays = this.getThisMonthDays(year, month);
      const lastDayWeek = new Date(`${year}-${month}-${thisMonthDays}`).getDay();
      let lastEmptyGrids = [];
      if (+lastDayWeek !== 6) {
        const len = 7 - (lastDayWeek + 1);
        for (let i = 1; i <= len; i++) {
          lastEmptyGrids.push(i);
        }
        this.setData({
          'datepicker.lastEmptyGrids': lastEmptyGrids,
        });
      } else {
        this.setData({
          'datepicker.lastEmptyGrids': null,
        });
      }
    },
    /**
     * 设置日历面板数据
     * @param {number} year 年份
     * @param {number} month  月份
     */
    calculateDays(year, month, curDate) {
      let days = [];
      let day;
      let selectMonth;
      let selectYear;
      const thisMonthDays = this.getThisMonthDays(year, month);
      const selectedDay = this.data.datepicker.selectedDay;
      if (selectedDay && selectedDay.length) {
        day = selectedDay[0].day;
        selectMonth = selectedDay[0].month;
        selectYear = selectedDay[0].year;
      }
      for (let i = 1; i <= thisMonthDays; i++) {
        days.push({
          day: i,
          choosed: curDate ? (i === curDate) : (year === selectYear && month === selectMonth && i === day),
          year,
          month,
        });
      }
      const tmp = {
        'datepicker.days': days,
      };
      if (curDate) {
        tmp['datepicker.selectedDay'] = [{
          day: curDate,
          choosed: true,
          year,
          month,
        }];
      }
      this.setData(tmp);
    },
    /**
     * 初始化日历选择器
     * @param {number} curYear
     * @param {number} curMonth
     * @param {number} curDate
     */
    init(curYear, curMonth, curDate) {
      const self = this;
      if (!curYear || !curMonth || !curDate) {
        const date = new Date();
        curYear = date.getFullYear();
        curMonth = date.getMonth() + 1;
        curDate = date.getDate();
      }
      const weeksCh = ['日', '一', '二', '三', '四', '五', '六'];
      self.setData({
        'datepicker.curYear': curYear,
        'datepicker.curMonth': curMonth,
        'datepicker.weeksCh': weeksCh,
        'datepicker.hasEmptyGrid': false,
        'datepicker.showDatePicker': true,
        leftStatus: 'slidown',
        fullbgShow: true,
        leftOpen: true,
        rightOpen: false,
        centerOpen: false,
        centerShow: true,
        rightShow: true,
        leftShow: false,
        isfull: true,
        curYear: curYear,
        curMonth: curMonth,
        curDate: curDate,
      });
      this.calculateEmptyGrids(curYear, curMonth);
      this.calculateDays(curYear, curMonth, curDate);
    },
    /**
     * 点击输入框调起日历选择器
     * @param {object} e  事件对象
     */
    showDatepicker(e) {
      var curYear=this.data.curYear
      var curMonth = this.data.curMonth
      var curDate = this.data.curDate
      this.triggerEvent('showDatepicker');
      if (this.data.leftOpen) {
        this.setData({
          leftStatus: 'slidup',
          showPicker:false,
          fullbgShow: false,
          leftOpen: false,
          centerOpen: false,
          rightOpen: false,
          centerShow: true,
          rightShow: true,
          leftShow: false,
          isfull: false,
          shownavindex: 0
        })

      } else {
        this.setData({
          shownavindex: e.currentTarget.dataset.nav
        })
        
        this.init(curYear,curMonth,curDate)
      }

    },
    /**
     * 当输入日期时
     * @param {object} e  事件对象
     */
    onInputDate(e) {
      this.inputTimer && clearTimeout(this.inputTimer);
      this.inputTimer = setTimeout(() => {
        console.log(e);
        const v = e.detail.value;
        const _v = (v && v.split('-')) || [];
        const RegExpYear = /^\d{4}$/;
        const RegExpMonth = /^(([0]?[1-9])|([1][0-2]))$/;
        const RegExpDay = /^(([0]?[1-9])|([1-2][0-9])|(3[0-1]))$/;
        if (_v && _v.length === 3) {
          if (RegExpYear.test(_v[0]) && RegExpMonth.test(_v[1]) && RegExpDay.test(_v[2])) {
            this.init(+_v[0], +_v[1], +_v[2]);
          }
        }
      }, 500);
    },
    /**
     * 计算当前日历面板月份的前一月数据
     */
    choosePrevMonth() {
      const { curYear, curMonth } = this.data.datepicker;
      let newMonth = curMonth - 1;
      let newYear = curYear;
      if (newMonth < 1) {
        newYear = curYear - 1;
        newMonth = 12;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        'datepicker.curYear': newYear,
        'datepicker.curMonth': newMonth,
        curYear: newYear,
        curMonth: newMonth,
      });
    },
    /**
     * 计算当前日历面板月份的后一月数据
     */
    chooseNextMonth() {
      const { curYear, curMonth } = this.data.datepicker;
      let newMonth = curMonth + 1;
      let newYear = curYear;
      if (newMonth > 12) {
        newYear = curYear + 1;
        newMonth = 1;
      }
      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        'datepicker.curYear': newYear,
        'datepicker.curMonth': newMonth,
        curYear: newYear,
        curMonth: newMonth,
      });
    },
    /**
     * 切换月份
     * @param {!object} e 事件对象
     */
    handleCalendar(e) {
      const handle = e.currentTarget.dataset.handle;
      if (handle === 'prev') {
        this.choosePrevMonth();
      } else {
        this.chooseNextMonth();
      }
    },
    /**
     * 选择具体日期
     * @param {!object} e  事件对象
     */
    tapDayItem(e) {
      this.hidebg()
      this.setData({
        showPicker: false,
      })
      const idx = e.currentTarget.dataset.idx;
      var e = this.data.datepicker.days[idx]
      this.triggerEvent('tapDay', e);
      const { afterTapDay, onTapDay } = this;
      const { curYear, curMonth, days } = this.data.datepicker;
      const key = `datepicker.days[${idx}].choosed`;
      const selectedValue = `${curYear}-${curMonth}-${days[idx].day}`;
      if (this.data.type === 'timearea') {
        if (onTapDay && typeof onTapDay === 'function') {
          this.onTapDay(this.data.datepicker.days[idx], e);
          return;
        };
        this.setData({
          [key]: !days[idx].choosed,
        });
      } else if (this.data.type === 'normal' && !days[idx].choosed) {
        const prev = days.filter(item => item.choosed)[0];
        const prevKey = prev && `datepicker.days[${prev.day - 1}].choosed`;
        if (onTapDay && typeof onTapDay === 'function') {
          this.onTapDay(days[idx], e);
          return;
        };
        this.setData({
          [prevKey]: false,
          [key]: true,
          'datepicker.selectedValue': selectedValue,
          'datepicker.selectedDay': [days[idx]],
        });
      }
      if (afterTapDay && typeof afterTapDay === 'function') {
        this.afterTapDay(days[idx]);
      };
    },
    /**
     * 关闭日历选择器
     */
    closeDatePicker() {
      this.setData({
        'datepicker.showDatePicker': false,
      });
    },
    touchstart(e) {
      const t = e.touches[0];
      const startX = t.clientX;
      const startY = t.clientY;
      this.slideLock = true; // 滑动事件加锁
      this.setData({
        'gesture.startX': startX,
        'gesture.startY': startY
      });
    },
    touchmove(e) {
      if (isLeftSlide.call(this, e)) {
        this.chooseNextMonth();
      }
      if (isRightSlide.call(this, e)) {
        this.choosePrevMonth();
      }
    },
    /**
  * 左滑
  * @param {object} e 事件对象
  * @returns {boolean} 布尔值
  */
    isLeftSlide(e) {
      const { startX, startY } = this.data.gesture;
      if (this.slideLock) {
        const t = e.touches[0];
        const deltaX = t.clientX - startX;
        const deltaY = t.clientY - startY;

        if (deltaX < -20 && deltaX > -40 && deltaY < 8 && deltaY > -8) {
          this.slideLock = false;
          return true;
        } else {
          return false;
        }
      }
    },
    /**
    * 右滑
    * @param {object} e 事件对象
    * @returns {boolean} 布尔值
    */
    isRightSlide(e) {
      const { startX, startY } = this.data.gesture;
      if (this.slideLock) {
        const t = e.touches[0];
        const deltaX = t.clientX - startX;
        const deltaY = t.clientY - startY;

        if (deltaX > 20 && deltaX < 40 && deltaY < 8 && deltaY > -8) {
          this.slideLock = false;
          return true;
        } else {
          return false;
        }
      }
    },
    _getCurrentPage() {
      const pages = getCurrentPages();
      const last = pages.length - 1;
      return pages[last];
    },

    tapPickerBtn(e) {
      const type = e.currentTarget.dataset.type;
      var curYear = this.data.curYear
      var curMonth = this.data.curMonth
      if (!curYear || !curMonth) {
        const date = new Date();
        curYear = date.getFullYear();
        curMonth = date.getMonth() + 1;
      }
      const o = {
        showPicker: false,
      };
      if (type === 'confirm') {
        o.curYear = curYear;
        o.curMonth = curMonth;
        this.setData({
          'datepicker.curYear': curYear,
          'datepicker.curMonth': curMonth,
        })
        this.calculateEmptyGrids(curYear, curMonth);
        this.calculateDays(curYear, curMonth);
      }

      this.setData(o);
    },
    pickerChange(e) {
      const val = e.detail.value;
      let curYear = this.data.pickerYear[val[0]];
      let curMonth = this.data.pickerMonth[val[1]];
      console.log(curYear)
      this.setData({
        curYear:curYear,
        curMonth: curMonth,
      })
    },
    chooseYearAndMonth() {
      const curYear = this.data.curYear;
      const curMonth = this.data.curMonth;
      console.log(curYear)
      console.log(curMonth)
      let pickerYear = [];
      let pickerMonth = [];
      for (let i = 2000; i <= 2100; i++) {
        pickerYear.push(i);
      }
      for (let i = 1; i <= 12; i++) {
        pickerMonth.push(i);
      }
      const idxYear = pickerYear.indexOf(curYear);
      const idxMonth = pickerMonth.indexOf(curMonth);
      this.setData({
        pickerValue: [idxYear, idxMonth],
        pickerYear,
        pickerMonth,
        showPicker: true,
      });
    },



  },

});