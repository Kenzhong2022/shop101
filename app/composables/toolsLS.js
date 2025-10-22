/**
 * 通用工具：所有其它项目都能用的方法
 * @description:这个是从原来的utils.js分离出来的，之所以将它从utils.js分离出来，是因为stores.js用到utils.js里的LS_debounce方法，而utils.js同样也用到stores.js里的方法，
 * 				如是LS_debounce写在utils.js里，会由于相互循环引用的问题导致系统在服务端跑不起来。
 *
 */

/**
 * uView的防抖,名字是暂时的，升级版本再换回来
 * 防抖原理：一定时间内，只有最后一次操作，再过wait毫秒后才执行函数
 *
 * @param {Function} func 要执行的回调函数
 * @param {Number} wait 延时的时间
 * @param {Boolean} immediate 是否立即执行
 * @return null
 */
let timeout = null;

// 例:U_debounce(() => {});
function U_debounce(func, wait = 500, immediate = false) {
  // 清除定时器
  if (timeout !== null) clearTimeout(timeout); // 立即执行，此类情况一般用不到

  if (immediate) {
    var callNow = !timeout;
    timeout = setTimeout(function () {
      timeout = null;
    }, wait);
    if (callNow) typeof func === "function" && func();
  } else {
    // 设置定时器，当最后一次操作后，timeout不会再被清除，所以在延时wait毫秒后执行func回调方法
    timeout = setTimeout(function () {
      typeof func === "function" && func();
    }, wait);
  }
}

let timer;
let flag;
/**
 * 节流原理：在一定时间内，只能触发一次
 *     		例:U_throttle(() => {});
 *
 * @param {Function} func 要执行的回调函数
 * @param {Number} wait 延时的时间
 * @param {Boolean} immediate 是否立即执行
 * @return null
 */
function U_throttle(func, wait = 500, immediate = true) {
  if (immediate) {
    if (!flag) {
      flag = true;
      // 如果是立即执行，则在wait毫秒内开始时执行
      typeof func === "function" && func();
      timer = setTimeout(() => {
        flag = false;
      }, wait);
    }
  } else if (!flag) {
    flag = true;
    // 如果是非立即执行，则在wait毫秒内的结束处执行
    timer = setTimeout(() => {
      flag = false;
      typeof func === "function" && func();
    }, wait);
  }
}

// 例子: fn: LS_debounce(function () {})
function LS_debounce(fn, delay = 500, isImmediate = false) {
  let timer = null; // 声明计时器
  let flag = true;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    if (isImmediate) {
      if (flag) {
        fn.apply(context, args);
        flag = false;
      }
      timer = setTimeout(function () {
        flag = true;
      }, delay);
    } else {
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    }
  };
}

/* 节流
 *@param fn {Function}   实际要执行的函数
 * @param delay {Number}  延迟时间，也就是阈值，单位是毫秒（ms）
 * @return {Function}     返回一个“去弹跳”了的函数
 * 用法：import { LS_throttle } from '@/utils/utils.js';
 *       sure:LS_throttle(function(){}),//备注，不能用箭头函数()=>，不然里面的this不对
 */
// 这个方法在手机端会出现点击触发第一次后,再次点击时会失效的bug
// function LS_throttle(fn, delay = 500) {
// 	let last = 0;
// 	return function() {
// 		let curr = +new Date();
// 		if (curr - last > delay) {
// 			fn.apply(this, arguments);
// 			last = curr;
// 		}
// 	}
// }
function LS_throttle(fn, delay = 500) {
  let flag = true;
  return function () {
    if (!flag) return;
    flag = false;
    fn.apply(this, arguments);
    setTimeout(() => {
      flag = true;
    }, delay);
  };
}

//单例模式抽象，分离创建对象的函数和判断对象是否已经创建(第二版单例)
const createSingle = function (fn) {
  let result;
  return function () {
    return result || (result = new fn(...arguments));
  };
};
class MessageModal {
  constructor() {
    this.show = false;
  }
  showMessage(msg, type) {
    if (this.show) {
      return;
    }
    this.show = true;
    let that = this;
    ElMessage({
      message: msg || "Error",
      type: type || "error",
      duration: 5 * 1000,
      onClose: function () {
        that.show = false;
      },
    });
  }
}
const selfMessage = createSingle(MessageModal);
const singleMessage = selfMessage();

/* 
页面服务端渲染的分页专用。用来替代mixins/pages/commom.js的
parmas:	firstSearch 使用时是否需要加载一次数据
注意：1、想要在usePagin后，用return出来的resData等值给别的变量赋值的话，如：let a = resData.value，用usePagin时，必须得传key值(即是第一个参数)
	  2、本方法不能用{ watch: [() => route.query] }，因为params传了第一次值进来后，就监听不到它的变化了，要在外面页面用execute()更新，可参考：pages/good/searchShop
用法：
	async setup() {
		const route = useRoute();
		let res = await usePagin('intergralReceivable',api_Activity.integral.intergralReceivable,computed(()=>({ id: route.query.id })));
		return { ...res };
	},
或者：<script setup>
		const { resData, resultList, curPage, total, pageSize, paging, execute, refresh, handleSizeChange, handleCurrentChange } = await usePagin(
			'intergralReceivable',
			api_Activity.integral.intergralReceivable,
			computed(()=>({ id: route.query.id }))
		);
*/
async function usePagin(...args) {
  try {
    let id = String(new Date().getTime());
    let api = null;
    let params = {};
    if (typeof args[0] == "string") {
      //如果第一个参数传的是id
      id = args[0];
      api = args[1];
      params = args[2];
    } else if (typeof args[0] == "number") {
      //如果第一个参数传的是id，要转string
      id = String(args[0]);
      api = args[1];
      params = args[2];
    } else if (typeof args[0] == "function") {
      //如果第一个参数传的接口(方法)，则id为随机数
      /*	id=随机数，这个是为了解决如果a、b页面同时执行了usePagin，a跳转到b，点击返回a，再在a跳转到b时，进页面的瞬间b页面的resultList还是沿用上一个b页面的resultList数据的问题
				但这会引出另一个问题：在usePagin方法后console.log(resData),它是一个ObjectRefImpl,已确定data的value的[Target]是有值的，但 console.log(resData.value)时的值却是{}
				造成上述的原因是：setup()在服务端和客户端各执行一次，导致两次的key值是不一样的。useState 返回的状态是响应式的，可能在调用 console.log(res.value) 时，状态尚未被正确初始化或更新。
				解决方法：用usePagin时要传key值，例如：usePagin('key',fn))
			*/
      api = args[0];
      params = args[1];
      id = args[0].name + (params?.globalVersion || ""); //globalVersion 是 Vue 响应式系统中用于依赖追踪的一个全局版本号。它帮助 Vue 判断哪些依赖需要重新计算或更新。这样写依然解决不了服务端和客户端id值不同的问题
    } else {
      return {};
    }
    let paramsTemp = {
      curPage: 1,
      pageSize: 20,
      firstSearch: false,
      scrollToTop: true,
      ...unref(params), //判断是否是影响式(parmas是用computed(()=>(val)来传值的)，如果是影响式，自动加.value
    };
    // const layoutScrollRef = inject('layoutScrollRef', null)// 错误：inject 只能在 setup 或功能性组件中使用
    const pageSize = useState(`pageSize${id}`, () => paramsTemp.pageSize);
    const resData = useState(`resData${id}`, () => ({}));
    const resultList = useState(`resultList${id}`, () => []);
    const curPage = useState(`curPage${id}`, () => paramsTemp.curPage);
    const total = useState(`total${id}`, () => 0);
    const paging = useState(`paging${id}`, () => ({
      status: "loading",
      error: false,
      empty: false,
    }));
    const { data, status, error, execute, refresh } = await useLazyAsyncData(
      `usePagin${id}`,
      async (option) => {
        paging.value = { status: "loading", error: false, empty: false };
        let res = await api({
          ...unref(params),
          curPage: curPage.value,
          pageSize: pageSize.value,
        });
        resData.value = res?.data || {};
        resultList.value = res?.data?.resultList || [];
        curPage.value = res?.data?.curPageNO || 1;
        paging.value = {
          status: "noMore",
          empty: LS_test.isEmpty(res?.data?.resultList),
          error: res?.code ? false : true,
        };
        total.value = res?.data?.total || 0;
        return res;
      },
      { server: true }
    );

    // onMounted(() => {
    // 	paramsTemp.firstSearch && refresh();
    // })
    const handleSizeChange = (s) => {
      pageSize.value = s;
      execute();
    };
    const handleCurrentChange = (p) => {
      curPage.value = p;
      // if (paramsTemp.scrollToTop && layoutScrollRef.value) {
      // 	layoutScrollRef.value.setScrollTop(0);
      // 	layoutScrollRef.value.setScrollLeft(0);
      // }
      execute();
    };
    // console.log(11,data.value,status.value,error.value);
    return {
      resData,
      resultList,
      curPage,
      total,
      pageSize,
      paging,
      execute,
      refresh,
      handleSizeChange,
      handleCurrentChange,
    };
  } catch (error) {
    //TODO handle the exception
  }
}
/*
页面服务端渲染的获取数据用。与上面usePagin的区别是它不是分页的，例如：detail页面服务端渲染时用
注意：1、想要在useGetData后，用return出来的resData等值给别的变量赋值的话，如：let a = resData.value，用useGetData时，必须得传key值(即是第一个参数)
	  2、本方法不能用{ watch: [() => route.query] }，因为params传了第一次值进来后，就监听不到它的变化了，要在外面页面用execute()更新，可参考：pages/good/searchShop
用法(注意：如果是const query = useRoute().query，由于解构了，在useLazyAsyncData里watch: [query]是触发不了监听事件的)：	
	async setup() {
		const route = useRoute();
		let res = await useGetData('couponDetail',api_Activity.coupon.couponDetail,computed(()=>({ id: route.query.id })));
		return { ...res };
	},
或者：<script setup>
		const { resData, paging, execute, refresh } = await useGetData(
			'intergralReceivable',
			api_Activity.integral.intergralReceivable,
			computed(()=>({ id: route.query.id }))
		);
*/
async function useGetData(...args) {
  try {
    let id = String(new Date().getTime());
    let api = null;
    let params = {};
    if (typeof args[0] == "string") {
      //如果第一个参数传的是id
      id = args[0];
      api = args[1];
      params = args[2];
    } else if (typeof args[0] == "number") {
      //如果第一个参数传的是id，要转string
      api = args[1];
      params = args[2];
      id = String(args[0]);
    } else if (typeof args[0] == "function") {
      //如果第一个参数传的接口(方法)，则id为随机数
      /*	id=随机数，这个是为了解决如果a、b页面同时执行了usePagin，a跳转到b，点击返回a，再在a跳转到b时，进页面的瞬间b页面的resultList还是沿用上一个b页面的resultList数据的问题
				但这会引出另一个问题：在usePagin方法后console.log(resData),它是一个ObjectRefImpl,已确定data的value的[Target]是有值的，但 console.log(resData.value)时的值却是{}
				造成上述的原因是：setup()在服务端和客户端各执行一次，导致两次的key值是不一样的。useState 返回的状态是响应式的，可能在调用 console.log(res.value) 时，状态尚未被正确初始化或更新。
				解决方法：用usePagin时要传key值，例如：useGetData('key',fn))
			*/
      api = args[0];
      params = args[1];
      id = args[0].name + (params?.globalVersion || ""); //globalVersion 是 Vue 响应式系统中用于依赖追踪的一个全局版本号。它帮助 Vue 判断哪些依赖需要重新计算或更新。这样写依然解决不了服务端和客户端id值不同的问题
    } else {
      return {};
    }
    let paramsTemp = {
      firstSearch: false,
      scrollToTop: true,
      ...unref(params), //判断是否是影响式(parmas是用computed(()=>(val)来传值的)，如果是影响式，自动加.value
    };
    // const layoutScrollRef = inject('layoutScrollRef', null)// 错误：inject 只能在 setup 或功能性组件中使用
    const resData = useState(`resData${id}`, () => ({}));
    const paging = useState(`paging${id}`, () => ({
      status: "loading",
      error: false,
      empty: false,
    }));
    const { data, status, error, execute, refresh } = await useLazyAsyncData(
      `useGetData${id}`,
      async (option) => {
        paging.value = { status: "loading", error: false, empty: false };
        let res = await api(unref(params));
        resData.value = res?.data || {};
        paging.value = {
          status: "noMore",
          empty: LS_test.isEmpty(res?.data),
          error: res?.code ? false : true,
        };
        return res;
      },
      { server: true }
    );

    // onMounted(() => {
    // 	paramsTemp.firstSearch && refresh();
    // })
    // console.log(11,data.value,status.value,error.value);
    return { resData, paging, execute, refresh };
  } catch (error) {
    //TODO handle the exception
  }
}
export {
  U_debounce,
  U_throttle,
  LS_debounce,
  LS_throttle,
  selfMessage,
  singleMessage,
  usePagin,
  useGetData,
};
export default {
  U_debounce,
  U_throttle,
  LS_debounce,
  LS_throttle,
  selfMessage,
  singleMessage,
  usePagin,
  useGetData,
};
