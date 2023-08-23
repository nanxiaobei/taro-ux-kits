import { memo } from 'react';
import { View } from '@tarojs/components';
import './Loading.less';

const Loading = memo(({ className = '', style }) => {
  return (
    <View className={`loading ${className}`} style={style}>
      <View className="dot" />
      <View className="dot" />
      <View className="dot" />
    </View>
  );
});

export default Loading;
