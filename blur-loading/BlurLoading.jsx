import { useState, useCallback, useMemo, useRef, memo } from 'react';
import { usePageScroll, vibrateShort } from '@tarojs/taro';
import { View } from '@tarojs/components';
import Loading from './Loading';
import './BlurLoading.less';

const initObj = {};
const shakePhone = () => vibrateShort({ type: 'medium' });

const BlurLoading = ({ dots, blurStyle, hasTabBar }) => {
  const tabBarClass = hasTabBar ? 'has-tab-bar' : '';
  const dotsClass = dots ? '' : 'hide-dots';

  return (
    <Loading
      className={`blur-loading ${tabBarClass} ${dotsClass}`}
      style={blurStyle}
    />
  );
};

const START = 40;
const END = 100;

const useBlurLoading = ({ hasTabBar }) => {
  const [blur, setBlur] = useState(0);
  const [dots, setDots] = useState(false);

  const blurStyle = useMemo(() => {
    if (blur < START) return undefined;
    return { '--blur': `blur(${Math.floor((blur - START) / 3)}px)` };
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

/**
 * 用于 Swiper 组件的下拉加载 Hooks
 */
export const useSwiperLoading = ({ hasTabBar } = initObj) => {
  const { loadingEl, startLoading, onTouchMoveChange, onTouchEnd } =
    useBlurLoading({ hasTabBar });

  const onSwiperTransition = useCallback(
    (event, { onPullDown, onPullUp }) => {
      if (!(onPullDown || onPullUp)) return;

      const moveY = event.detail.dy;
      const absDiffY = onPullDown ? -moveY : moveY;

      onTouchMoveChange(absDiffY, onPullDown || onPullUp);
    },
    [onTouchMoveChange],
  );

  return { loadingEl, startLoading, onSwiperTransition, onTouchEnd };
};

const usePullDownRefresh = ({ hasTabBar } = initObj) => {
  const { loadingEl, onTouchMoveChange, onTouchEnd } = useBlurLoading({
    hasTabBar,
  });
  const startY = useRef(0);
  const isPageTop = useRef(true);

  // scroll
  usePageScroll(({ scrollTop }) => {
    isPageTop.current = scrollTop <= 0;
  });

  // start
  const onTouchStart = useCallback((event) => {
    startY.current = event.changedTouches[0].pageY;
  }, []);

  // move
  const onTouchChange = useCallback(
    (event, onPullDown) => {
      if (isPageTop.current) {
        const moveY = startY.current - event.changedTouches[0].pageY;
        onTouchMoveChange(-moveY, onPullDown);
      }
    },
    [onTouchMoveChange],
  );

  return { loadingEl, onTouchStart, onTouchChange, onTouchEnd };
};

const RefreshBox = memo((props) => {
  const {
    className,
    onPullDown,
    hasTabBar,
    onTouchStart,
    onTouchChange,
    onTouchEnd,
    children,
  } = props;

  const onTouchMove = useCallback(
    (event) => onTouchChange(event, onPullDown),
    [onPullDown, onTouchChange],
  );

  return (
    <View
      className={`refresh-box ${
        hasTabBar ? 'is-tab-page' : 'is-sub-page'
      } ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </View>
  );
});

/**
 * View 容器下拉加载组件
 */
export const PullDownRefresh = (props) => {
  const { className = '', onPullDown, hasTabBar, children } = props;
  const { loadingEl, onTouchStart, onTouchChange, onTouchEnd } =
    usePullDownRefresh({ hasTabBar });

  return (
    <>
      <RefreshBox
        className={className}
        onPullDown={onPullDown}
        hasTabBar={hasTabBar}
        onTouchStart={onTouchStart}
        onTouchChange={onTouchChange}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </RefreshBox>

      {loadingEl}
    </>
  );
};
