import { useMemo } from "react";

// 获取动态列表
const splitCount = (count) => {
  if (!splitCount[count]) {
    const side = (count - 1) / 2;
    if (side % 1 === 0) {
      splitCount[count] = [side, side]; // count 为偶数
    } else {
      const big = Math.ceil(side);
      splitCount[count] = [big - 1, big]; // count 为奇数
    }
  }

  return splitCount[count];
};

/**
 * @param {array} list
 * @param {number} index
 * @param {number} count
 */
const useDynamicList = (list, index, count = 5) => {
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

export default useDynamicList;
