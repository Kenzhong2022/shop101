/**
 * API请求封装使用示例
 * 
 * 新的请求封装提供了更简洁的API调用方式
 */

import { http } from '~/utils/request'
import { register, login, sendCode, logout } from '~/api/index'

// 使用封装的http工具直接发送请求
async function examples() {
  // GET请求示例
  const userData = await http.get('/api/user/info', { id: 123 })
  
  // POST请求示例
  const loginResult = await http.post('/api/login', {
    email: 'user@example.com',
    password: 'password123'
  })
  
  // PUT请求示例
  const updateResult = await http.put('/api/user/update', {
    name: '新名字',
    avatar: 'new-avatar.jpg'
  })
  
  // DELETE请求示例
  const deleteResult = await http.delete('/api/user/delete', { id: 123 })
}

// 使用认证相关的封装函数
async function authExamples() {
  try {
    // 发送验证码
    const codeResult = await sendCode('user@example.com')
    console.log('验证码发送结果:', codeResult)
    
    // 注册用户
    const registerResult = await register({
      username: '新用户',
      email: 'user@example.com',
      code: '123456',
      password: 'password123'
    })
    console.log('注册结果:', registerResult)
    
    // 用户登录
    const loginResult = await login({
      email: 'user@example.com',
      password: 'password123'
    })
    console.log('登录结果:', loginResult)
    
  } catch (error) {
    console.error('API调用失败:', error)
  }
}

export { examples, authExamples }