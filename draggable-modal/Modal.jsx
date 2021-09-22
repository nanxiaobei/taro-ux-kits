import { useState, useEffect, useCallback, useRef, memo } from "react";
import { View, Image } from "@tarojs/components";
import closeIcon from "./close.svg";
import "./Modal.less";

const getAngle = (x, y) => Math.atan2(y, x) * (180 / Math.PI);

const Wrapper = memo(
  ({ setBottomRef, onTouchStart, onTouchMove, onTouchEnd, children }) => {
    const [bottom, setBottom] = useState(0);

    useEffect(() => {
      setBottomRef.current = setBottom;
    }, [setBottomRef]);

    return (
      <View
        className="wrapper"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          marginBottom: `calc(var(--bottom)${
            bottom > 0 ? ` - ${bottom}px` : ""
          })`,
        }}
      >
        {children}
      </View>
    );
  }
);

const Modal = (props) => {
  const {
    className = "",
    type = "auto", // auto, large, full, list
    blur = "none", // none, light, dark
    visible,
    stopClose,
    onClose,
    title,
    btnOk,
    children,
    ...restProps
  } = props;

  const setBottomRef = useRef();
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  const getDiffY = ({ pageX, pageY }) => {
    const diffY = pageY - startY.current;
    if (diffY <= 0) return 0;

    const diffX = pageX - startX.current;
    const angle = getAngle(diffX, diffY);
    if (angle < 45 || angle > 135) return 0;

    return diffY;
  };

  const onTouchStart = useCallback(
    (event) => {
      if (stopClose) return;

      const { pageX, pageY } = event.changedTouches[0];
      startX.current = pageX;
      startY.current = pageY;
      startTime.current = Date.now();
    },
    [stopClose]
  );

  const onTouchMove = useCallback(
    (event) => {
      if (stopClose) return;

      const diffY = getDiffY(event.changedTouches[0]);
      if (!diffY) return;
      setBottomRef.current(diffY);
    },
    [stopClose]
  );

  const onTouchEnd = useCallback(
    (event) => {
      if (stopClose) return;

      const diffY = getDiffY(event.changedTouches[0]);
      if (!diffY) {
        setBottomRef.current(0);
        return;
      }

      if (diffY > 200 || (diffY > 10 && Date.now() - startTime.current < 200)) {
        onClose();
        setTimeout(() => setBottomRef.current(0), 200);
        return;
      }

      setBottomRef.current(0);
    },
    [onClose, stopClose]
  );

  return (
    <View
      className={`modal ${type} ${blur} ${visible ? "show" : "hide"}`}
      catchMove
    >
      <View className="mask" onTouchStart={onClose} />

      <Wrapper
        setBottomRef={setBottomRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {type !== "list" && (
          <View
            className={`header ${type === "full" || btnOk ? "left-close" : ""}`}
          >
            <Image
              className="icon close-icon"
              src={closeIcon}
              onTouchStart={onClose}
            />
            {title}
            {btnOk}
          </View>
        )}

        <View className={`content ${className}`} {...restProps}>
          {children}
        </View>
      </Wrapper>
    </View>
  );
};

export default Modal;
