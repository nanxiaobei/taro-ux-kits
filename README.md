# taro-ux-kits

使用 Taro 开发 [**FUTAKE**](https://sotake.com/f) 小程序时，7 个与用户体验有关的优化。

[**👉 点击体验 FUTAKE 🌁**](https://sotake.com/f)

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ba74498efbd4876986d0f7da1baaf3a~tplv-k3u1fbpfcp-watermark.image" alt="" />

## 1. Dark Mode

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c936b58c878d46a9bcda8a51bdf3cd41~tplv-k3u1fbpfcp-watermark.image" width="480" alt="" />

参考 [官方 Dark Mode 适配指南](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/darkmode.html) 添加 `theme.json`，并在 `app.config.js` 中添加相关配置。

小程序自身 UI 的 Dark Mode，可使用 CSS 变量来控制，其它需要变化的色值，均源自 CSS 变量即可。

> 完整代码 → [github.com/nanxiaobei/taro-ux-kits/tree/main/dark-mode](https://github.com/nanxiaobei/taro-ux-kits/tree/main/dark-mode)

<details>
<summary>▶ 点击查看代码</summary>

```less
// less 主题文件
#theme() {
  --dark: #000;
  --darken: 0, 0, 0;
  --light: #fff;
  --lighten: 255, 255, 255;

  --yellow: #ff9500;
  --green: #34c759;
  --blue: #007aff;
  --indigo: #048;
  --red: #ff3b30;
}

#dark-theme() {
  --dark: #fff;
  --darken: 255, 255, 255;
  --light: #000;
  --lighten: 0, 0, 0;

  --yellow: #ff9500;
  --green: #30d158;
  --blue: #0a84ff;
  --indigo: #bce;
  --red: #ff453a;
}

page {
  #theme();
}

@media (prefers-color-scheme: dark) {
  page {
    #dark-theme();
  }
}
```

</details>

## 2. 可拖动的 Modal

FUTAKE 实现了类似手机原生弹窗的效果 —— 按住弹窗体后，可上下拖动弹窗。

实现方式即监听 touch 相关事件，动态设置 CSS 偏移，为进一步提升性能，使用原生小程序 `wxs` 来写。

> 完整代码 → [github.com/nanxiaobei/taro-ux-kits/tree/main/draggable-modal](https://github.com/nanxiaobei/taro-ux-kits/tree/main/draggable-modal)

<details>
<summary>▶ 点击查看代码</summary>

```js
// wxs 核心代码（省略了工具函数）
module.exports = {
  onTouchStart: function (event, ownerInstance) {
    var obj = ownerInstance.getState();

    if (!obj.setOffset) {
      var moveWrapper = ownerInstance.selectComponent("#move-wrapper");
      var setWrapperStyle = moveWrapper.setStyle;
      obj.raf = moveWrapper.requestAnimationFrame;
      obj.setTimeout = getSetTimeout(obj.raf);

      obj.setOffset = function (offset) {
        setWrapperStyle(
          offset === 0
            ? {}
            : { "margin-bottom": "-" + Math.ceil(offset) + "px" }
        );
      };
    }

    var pos = event.changedTouches[0];
    obj.startX = pos.pageX;
    obj.startY = pos.pageY;
    obj.startTime = Date.now();

    obj.prevOffset = null;
    obj.reset = false;
  },

  onTouchMove: function (event, ownerInstance) {
    var obj = ownerInstance.getState();

    var offset = getOffset(event, obj, "touchMove");
    if (!offset) return;

    obj.raf(function () {
      obj.setOffset(offset);
    });
  },

  onTouchEnd: function (event, ownerInstance) {
    var obj = ownerInstance.getState();

    var offset = getOffset(event, obj);
    if (!offset) {
      if (obj.reset) obj.setOffset(0);
      return;
    }

    obj.raf(function () {
      if (offset > 150 || (offset > 10 && Date.now() - obj.startTime < 200)) {
        ownerInstance.callMethod("onClose");
        obj.setTimeout(function () {
          obj.setOffset(0);
        }, 200);
        return;
      }

      obj.setOffset(0);
    });
  },
};
```

</details>

## 3. 毛玻璃 tabBar

使用自定义 tarBar，实现模糊半透明的毛玻璃效果，随着页面滚动 tabBar 一直动态变化。

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b1b02b8120f24c0ab97e4f490d7d5f78~tplv-k3u1fbpfcp-watermark.image" width="240" alt="" />

使用 CSS 的 `backdrop-filter` 来实现。

> 完整代码 → [github.com/nanxiaobei/taro-ux-kits/tree/main/custom-tab-bar](https://github.com/nanxiaobei/taro-ux-kits/tree/main/custom-tab-bar)

<details>
<summary>▶ 点击查看代码</summary>

```
.tab-bar {
  --lighten: 255, 255, 255;

  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  backdrop-filter: blur(24px);
}

.tab {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(96px + constant(safe-area-inset-bottom));
  height: calc(96px + env(safe-area-inset-bottom));
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.icon {
  width: 44px;
  height: 44px;
  opacity: 0.2;
}

.tab.active .icon,
.tab.hover .icon {
  opacity: 1;
}

@media (prefers-color-scheme: dark) {
  .tab-bar {
    --lighten: 0, 0, 0;
  }

  .icon {
    filter: invert(1);
  }
}
```

</details>

## 4. 页面向右滑直接返回

手机系统为左侧边缘向右滑返回，但如果屏幕过大，操作并不太顺手。

在一些 App 中，实现了直接在页面上右滑返回的效果，例如 Slack 和 Snapchat，体验非常顺滑。

在 Taro 小程序中，首先需要添加一个公共组件，页面均使用此公共组件包裹，然后在公共组件中监听 touch 相关事件。

这里的重点是需要计算滑动的角度，例如 `→` 这样的可以返回，但 `↘` 和 `↓` 这样的，应该忽略掉。

> 完整代码 → [github.com/nanxiaobei/taro-ux-kits/tree/main/touch-move-back](https://github.com/nanxiaobei/taro-ux-kits/tree/main/touch-move-back)

<details>
<summary>▶ 点击查看代码</summary>

```js
// React Hooks（省略了工具函数）
const useMoveX = ({ toLeft, toRight, disable }) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  const onTouchStart = useCallback(
    (event) => {
      if (disable) return;

      const { pageX, pageY } = event.changedTouches[0];
      startX.current = pageX;
      startY.current = pageY;
      startTime.current = Date.now();
    },
    [disable]
  );

  const getAbsAngle = useCallback((diffX, pageY) => {
    const diffY = pageY - startY.current;
    const angle = getAngle(diffX, diffY);
    return Math.abs(angle);
  }, []);

  const onTouchEnd = useCallback(
    (event) => {
      if (disable) return;

      const { pageX, pageY } = event.changedTouches[0];
      const diffX = pageX - startX.current;

      if (diffX > 0) {
        if (!toRight || getAbsAngle(diffX, pageY) > 20) return;
        if (diffX > 70 || (diffX > 10 && Date.now() - startTime.current < 200))
          toRight();
      } else {
        if (!toLeft || getAbsAngle(diffX, pageY) < 160) return;
        if (
          diffX < -70 ||
          (diffX < -10 && Date.now() - startTime.current < 200)
        )
          toLeft();
      }
    },
    [disable, getAbsAngle, toLeft, toRight]
  );

  return { onTouchStart, onTouchEnd };
};
```

</details>

## 5. 毛玻璃下拉加载效果

小程序原生的下拉加载也不错，但不够特别。FUTAKE 实现了毛玻璃下拉加载效果：

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7de7f55fd684f6e928b57569a2a5c6b~tplv-k3u1fbpfcp-watermark.image" width="240" alt="" />

> GIF 较模糊，强烈建议体验小程序的实际效果。

同样是监听 touch 事件，但实现更复杂一些，需要根据偏移，处理毛玻璃的模糊度，以及触发 loading 动画等。

在 React 中使用时，要注意将 loading 元素隔离开来，因为 loading 元素是不断 re-render 的。

> 完整代码 → [github.com/nanxiaobei/taro-ux-kits/tree/main/blur-loading](https://github.com/nanxiaobei/taro-ux-kits/tree/main/blur-loading)

<details>
<summary>▶ 点击查看代码</summary>

```jsx
// 部分核心代码（省略了相关组件）
const START = 40;
const END = 100;

const useBlurLoading = ({ hasTabBar }) => {
  const [blur, setBlur] = useState(0);
  const [dots, setDots] = useState(false);

  const blurStyle = useMemo(() => {
    if (blur < START) return undefined;
    return { "--blur": `blur(${Math.floor((blur - START) / 3)}px)` };
  }, [blur]);

  const startLoading = useCallback((reqFn) => {
    setBlur(60);
    setDots(true);

    const onEnd = () => {
      setTimeout(() => {
        setBlur(0);
        setDots(false);
      }, 300);
    };

    reqFn().then(shakePhone).finally(onEnd);
  }, []);

  const diffY = useRef(0);
  const maxDiffY = useRef(0);
  const hasLoading = useRef(false);
  const hasReq = useRef(false);
  const reqRef = useRef(null);

  // change
  const onTouchMoveChange = useCallback((absDiffY, onReq) => {
    if (absDiffY < START || absDiffY > END + 20) return;

    // 记录 diffY
    diffY.current = absDiffY;
    if (absDiffY > maxDiffY.current) maxDiffY.current = absDiffY;

    // 记录请求函数
    if (!reqRef.current) reqRef.current = onReq;

    // 显示 blur
    requestAnimationFrame(() => setBlur(absDiffY));

    // 显示 dots 动画
    if (!hasLoading.current && absDiffY > END) {
      hasLoading.current = true;
      setDots(true);
      shakePhone();
      return;
    }

    // 若未触发请求，停止 dots 动画
    if (hasLoading.current && absDiffY < END && !hasReq.current) {
      hasLoading.current = false;
      setDots(false);
    }
  }, []);

  // end
  const onTouchEnd = useCallback(() => {
    if (!reqRef.current) return;

    // 应触发请求
    const shouldReq =
      hasLoading.current && Math.abs(diffY.current - maxDiffY.current) < 5;
    if (shouldReq) {
      // 发送请求
      hasReq.current = true;

      reqRef.current().finally(() => {
        setTimeout(() => {
          hasReq.current = false;

          hasLoading.current = false;
          setDots(false);

          setBlur(0);
          diffY.current = 0;
          maxDiffY.current = 0;

          reqRef.current = null;
        }, 300);
      });
      return;
    }

    // 不触发请求
    setTimeout(() => {
      setBlur(0);
      diffY.current = 0;
      maxDiffY.current = 0;
    }, 200);
  }, [setBlur, setDots]);

  const loadingEl = blur > 0 && (
    <BlurLoading dots={dots} blurStyle={blurStyle} hasTabBar={hasTabBar} />
  );

  return { loadingEl, startLoading, onTouchMoveChange, onTouchEnd };
};
```

</details>

## 6. Swiper 动态列表数据

FUTAKE 使用 Swiper 组件，实现了类似抖音的上下滑动浏览。

但随着列表元素不断增加，小程序将变得卡顿，因为需要实现列表数据的动态化。

展示正在浏览的条目以及前后预载入条目，其它条目展示空元素占位即可。

> 完整代码 → [github.com/nanxiaobei/taro-ux-kits/tree/main/use-dynamic-list](https://github.com/nanxiaobei/taro-ux-kits/tree/main/use-dynamic-list)

<details>
<summary>▶ 点击查看代码</summary>

```js
// React Hooks（省略了工具函数）
export const useDynamicList = (list, index, count = 5) => {
  return useMemo(() => {
    const len = list.length;
    if (len <= count) return list;

    const [before, after] = splitCount(count);
    let start = index - before;
    let end = index + after;

    if (start < 0) start = 0;
    if (end > len - 1) end = len - 1;

    const res = [...Array(len)];
    for (let i = start; i <= end; i++) {
      res[i] = list[i];
    }

    return res;
  }, [index, count, list]);
};
```

</details>

## 7. 双击点赞动画

FUTAKE 实现了类似 Instagram 的对图片双击即可点赞的效果。

同时增加了「喜欢」展示红色 ❤️，「取消喜欢」展示白色 🤍 的逻辑。

> 完整代码 → [github.com/nanxiaobei/taro-ux-kits/tree/main/double-click-like](https://github.com/nanxiaobei/taro-ux-kits/tree/main/double-click-like)

<details>
<summary>▶ 点击查看代码</summary>

```jsx
const LikeWrapper = ({ isLiked, likeRequest }) => {
  const prevTime = useRef(0);
  const [iconVisible, setIconVisible] = useState(false);
  const [isRed, setIsRed] = useState(!isLiked);

  // 双击喜欢
  const onClick = useCallback(
    async (event) => {
      const startTime = event.timeStamp;
      if (startTime - prevTime.current < 300) {
        if (iconVisible) return;

        setIsRed(!isLiked);
        setIconVisible(true);

        likeRequest({ isLiked }).finally(() => {
          const timeLeft = 550 - (Date.now() - startTime);
          const hideIcon = () => setIconVisible(false);
          timeLeft > 0 ? setTimeout(hideIcon, timeLeft) : hideIcon();
        });
      }
      prevTime.current = startTime;
    },
    [iconVisible, isLiked, likeRequest]
  );

  return (
    <View className="like-wrapper" onClick={onClick}>
      {iconVisible && <LikeIcon isRed={isRed} />}
    </View>
  );
};
```

</details>

---

[**👉 欢迎体验 FUTAKE 🗺**](https://sotake.com/f)

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4d5e9a07e504d928e0b05dc673cd963~tplv-k3u1fbpfcp-watermark.image" alt="" />

[**👉 访问 FUTAKE 官网 🗺**](https://sotake.com/f)
