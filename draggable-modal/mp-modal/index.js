Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    mpClass: {
      type: String,
      value: '',
    },
    stopClose: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    onClose() {
      wx.hideKeyboard();
      this.triggerEvent('close');
    },
  },
});
