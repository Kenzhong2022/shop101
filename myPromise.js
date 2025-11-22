/**
 * 手写promise
 */

// 状态常量
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class myPromise {
  //初始状态为pending 可以被修改
  #status = PENDING;
  #result = null;
  //构造器 外部new的时候可以调用
  constructor(executor) {
    //改变状态为fulfilled
    const resolve = (data) => {
      if (this.#status !== PENDING) return;
      this.#status = FULFILLED;
      this.#result = data;
      console.log(this.#status, this.#result);
    };
    //改变状态为rejected
    const reject = (err) => {
      if (this.#status !== PENDING) return;
      this.#status = REJECTED;
      this.#result = err;
      console.log(this.#status, this.#result);
    };
    // 1. 执行器立即执行
    // 2. 执行器有两个参数，分别是resolve和reject
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
}

const p = new myPromise(
  //当前构造器的同步代码如果报错了 状态要改变，result要改变
  (resolve, reject) => {
    throw 123;
  }
);
