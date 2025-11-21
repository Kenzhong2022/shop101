/**
 * useUser 多实例 Bug 最小案例演示
 * 
 * 这个文件展示了在修复前的版本中，为什么会出现多个 userState 实例的问题
 * 以及修复后的全局单例模式如何解决此问题
 */

// ============= 修复前的错误版本（多实例问题） =============
namespace BuggyVersion {
  // ❌ 错误：每次调用都创建新实例
  export function useUser_Buggy() {
    // 每次调用都会创建新的 ref 实例
    const userState = ref({
      user_id: -1,
      token: "",
      expireTime: 0
    })
    
    return userState // 返回新实例
  }
  
  // 使用示例 - 展示问题
  export function demonstrateBug() {
    console.log('=== Buggy Version 演示 ===')
    
    // 组件A 获取用户状态
    const userState_A = useUser_Buggy()
    
    // 组件B 获取用户状态  
    const userState_B = useUser_Buggy()
    
    // 问题：两个不同的实例！
    console.log('userState_A === userState_B:', userState_A === userState_B) // false
    console.log('userState_A.user_id:', userState_A.value.user_id) // -1
    console.log('userState_B.user_id:', userState_B.value.user_id) // -1
    
    // 组件A 更新状态
    userState_A.value.user_id = 123
    
    // 问题：组件B 看不到更新！
    console.log('组件A更新后:')
    console.log('userState_A.user_id:', userState_A.value.user_id) // 123
    console.log('userState_B.user_id:', userState_B.value.user_id) // 仍然是 -1！
    
    console.log('❌ 问题：状态不共享，组件间数据不一致！')
  }
}

// ============= 修复后的正确版本（全局单例） =============
namespace FixedVersion {
  // ✅ 正确：全局单例模式
  let globalUserState: Ref<UserState> | null = null
  
  export function useUser_Fixed() {
    if (!globalUserState) {
      // 只在第一次调用时创建实例
      globalUserState = ref({
        user_id: -1,
        token: "",
        expireTime: 0
      })
    }
    
    return globalUserState // 始终返回同一个实例
  }
  
  // 使用示例 - 展示修复效果
  export function demonstrateFix() {
    console.log('\n=== Fixed Version 演示 ===')
    
    // 组件A 获取用户状态
    const userState_A = useUser_Fixed()
    
    // 组件B 获取用户状态
    const userState_B = useUser_Fixed()
    
    // ✅ 同一个实例！
    console.log('userState_A === userState_B:', userState_A === userState_B) // true
    console.log('userState_A.user_id:', userState_A.value.user_id) // -1
    console.log('userState_B.user_id:', userState_B.value.user_id) // -1
    
    // 组件A 更新状态
    userState_A.value.user_id = 123
    
    // ✅ 组件B 立即看到更新！
    console.log('组件A更新后:')
    console.log('userState_A.user_id:', userState_A.value.user_id) // 123
    console.log('userState_B.user_id:', userState_B.value.user_id) // 123 ✅ 同步更新！
    
    console.log('✅ 修复：状态完全共享，组件间数据一致！')
  }
}

// ============= Bug 产生的根本原因 =============
/*
根本原因分析：

1. **问题本质**：
   - 每次调用 useUser() 都返回新的 ref 实例
   - Vue 的响应式系统基于引用相等性 (===)
   - 不同实例之间完全独立，无法触发彼此的响应式更新

2. **触发条件**：
   - 多个组件同时调用 useUser()
   - 一个组件更新状态后期望其他组件看到更新
   - 状态更新和监听不在同一个实例上

3. **表现症状**：
   - 页面显示的用户信息不一致
   - 登录后某些组件仍显示未登录状态
   - watchEffect 监听到变化但页面不更新

4. **解决方案**：
   - 使用全局单例模式确保所有调用返回同一实例
   - 利用闭包变量存储共享状态
   - 保持 Vue 响应式系统的引用一致性
*/

// ============= 运行演示 =============
export function runDemo() {
  BuggyVersion.demonstrateBug()
  FixedVersion.demonstrateFix()
}

// 类型定义
interface UserState {
  user_id: number
  token: string
  expireTime: number
}