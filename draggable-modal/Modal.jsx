import { View, Image } from "@tarojs/components";
import closeIcon from "./close.svg";
import "./Modal.less";

const Modal = (props) => {
  const {
    className = "",
    visible,
    stopClose,
    onClose,
    children,
    ...restProps
  } = props;

  return (
    <View className={`modal ${visible ? "show" : "hide"}`} catchMove>
      <view className="mask" onTouchStart={onClose} />

      <mp-modal mpClass="container" stopClose={stopClose} onClose={onClose}>
        <View className="controls">
          <View className="bar-icon" />
          <Image
            className="close-icon"
            src={closeIcon}
            onTouchStart={onClose}
          />
        </View>

        <View className={`stage ${className}`} {...restProps}>
          {children}
        </View>
      </mp-modal>
    </View>
  );
};

export default Modal;
