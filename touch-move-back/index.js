import { useCallback, useRef } from 'react';

const getAngle = (x, y) => Math.atan2(y, x) * (180 / Math.PI);

/**
 * @param {function} toLeft 为向左滑 callback
 * @param {function} toRight 为向右滑 callback（可传入返回上一页函数）
 * @param {boolean} disable 禁止滑动
 * 返回 onTouchStart onTouchEnd，传入公共组件容器 View 即可
 */
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
    [disable],
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
    [disable, getAbsAngle, toLeft, toRight],
  );

  return { onTouchStart, onTouchEnd };
};

export default useMoveX;
