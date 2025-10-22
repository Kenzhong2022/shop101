/**
 * 日期格式化工具
 * @param {Date|number|string} time - 输入的时间（支持Date对象、时间戳、时间字符串）
 * @param {Object} [options] - 格式化配置
 * @param {string} [options.format='dateTime'] - 输出格式：'date'（年月日）、'dateTime'（年月日时分秒）、'timestamp'（时间戳）
 * @param {string|string[]} [options.dateSeparator='-'] - 年月日连接符（字符串或数组，如 '-', ['年','月','日']）
 * @param {string|string[]} [options.timeSeparator=':'] - 时分秒连接符（字符串或数组，如 ':', ['时','分','秒']）
 * @param {string} [options.dateTimeSeparator=' '] - 日期和时间之间的连接符（如 ' ', 'T'）
 * @param {any} [options.defaultValue=''] - 格式错误时的默认返回值
 * @returns {string|number|any} 格式化后的时间（格式错误返回defaultValue）
 */
const formatTime = (time, options = {}) => {
  console.log("time:", time);
  // 默认配置
  const {
    format = "dateTime",
    dateSeparator = "-",
    timeSeparator = ":",
    dateTimeSeparator = " ",
    defaultValue = `无效参数，格式化失败请检查，time: ${time}，options: ${JSON.stringify(
      options
    )}`,
  } = options;

  // 1. 处理输入时间，转换为Date对象
  let date;
  if (time instanceof Date) {
    date = time;
  } else if (typeof time === "number") {
    // 处理时间戳（兼容秒级/毫秒级，秒级需转换为毫秒）
    const isSecondTimestamp = time.toString().length <= 10;
    date = new Date(isSecondTimestamp ? time * 1000 : time);
  } else if (typeof time === "string") {
    // 处理特殊格式字符串（如中文日期），增强解析兼容性
    const normalizedTime = time.replace(/年|月/g, "/").replace(/日/g, " "); // 如 "2023年10月22日" → "2023/10/22 "
    date = new Date(normalizedTime);
  } else {
    // 无效类型
    return defaultValue;
  }

  // 验证时间有效性
  if (isNaN(date.getTime())) {
    return defaultValue;
  }

  // 2. 提取时间部分（补零处理）
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // 3. 处理日期连接符（支持数组格式，如 ['年','月','日'] → 2023年10月22日）
  const getJoinedStr = (parts, separator) => {
    if (Array.isArray(separator) && separator.length >= parts.length - 1) {
      return parts.reduce((res, part, index) => {
        return res + part + (separator[index] || "");
      }, "");
    }
    return parts.join(separator);
  };

  // 4. 根据格式返回结果
  switch (format) {
    case "date": {
      const dateParts = [year, month, day];
      return getJoinedStr(dateParts, dateSeparator);
    }
    case "dateTime": {
      const dateParts = [year, month, day];
      const timeParts = [hours, minutes, seconds];
      const dateStr = getJoinedStr(dateParts, dateSeparator);
      const timeStr = getJoinedStr(timeParts, timeSeparator);
      return `${dateStr}${dateTimeSeparator}${timeStr}`;
    }
    case "timestamp":
      return date.getTime(); // 毫秒级时间戳
    default:
      return defaultValue;
  }
};

// 导出（支持直接导出函数，更方便调用）
export default formatTime;
