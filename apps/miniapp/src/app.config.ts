export default {
  pages: [
    'pages/trip-list/index',
    'pages/trip-create/index',
    'pages/trip-detail/index',
    'pages/decision-spin/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '薄荷行程',
    navigationBarTextStyle: 'black',
  },
  // 底部导航栏两个 Tab：行程 / 我的（架构文档 2.5 节已确认，不做"发现"Tab）。
  // 图标先留空用纯文字：正式 icon 素材（3D插画风讨论已定案为平面手绘SVG，
  // 见预览稿）确定下来之后，在这里补 iconPath/selectedIconPath 指向真实 PNG 资源。
  tabBar: {
    color: '#6E7D74',
    selectedColor: '#2FA98A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/trip-list/index', text: '行程' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
};
