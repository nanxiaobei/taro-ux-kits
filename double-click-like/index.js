import { useState, useCallback, useRef } from "react";
import { View, Image } from "@tarojs/components";
import likeRedIcon from "./like_red.svg";

const LikeIcon = ({ isRed }) => {
  return (
    <View className={`like-icon ${isRed ? "is-red" : "is-white"}`}>
      <Image src={likeRedIcon} />
    </View>
  );
};

/**
 * @param {boolean} isLiked 已喜欢
 * @param {function} likeRequest 喜欢接口请求
 */
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

export default LikeWrapper;
