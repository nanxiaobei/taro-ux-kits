Component({
  data: {
    path: '',
    list: [
      {
        text: '消息',
        path: '/pages/Message',
        icon: '/static/message.svg',
      },
      {
        text: '我',
        path: '/pages/Me',
        icon: '/static/me.svg',
      },
    ],
  },

  methods: {
    onTabClick(event) {
      console.log(event.currentTarget.dataset.path);
    },
  },
});
