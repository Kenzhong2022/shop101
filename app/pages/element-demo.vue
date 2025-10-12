<template>
  <div class="demo-container">
    <h1>🎨 Element Plus + UnCSS 演示</h1>
    
    <!-- 基础组件演示 -->
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>基础组件演示</span>
          <el-button class="button" text>操作按钮</el-button>
        </div>
      </template>
      
      <div class="demo-section">
        <h3>按钮组件</h3>
        <div class="button-group">
          <el-button>默认按钮</el-button>
          <el-button type="primary">主要按钮</el-button>
          <el-button type="success">成功按钮</el-button>
          <el-button type="info">信息按钮</el-button>
          <el-button type="warning">警告按钮</el-button>
          <el-button type="danger">危险按钮</el-button>
        </div>
      </div>
      
      <div class="demo-section">
        <h3>输入框组件</h3>
        <el-input 
          v-model="inputValue" 
          placeholder="请输入内容"
          style="width: 300px; margin-right: 10px;"
        />
        <el-tag type="info">输入值: {{ inputValue }}</el-tag>
      </div>
      
      <div class="demo-section">
        <h3>图标组件</h3>
        <div class="icon-group">
          <el-icon size="20"><House /></el-icon>
          <el-icon size="20" color="#409EFF"><User /></el-icon>
          <el-icon size="20" color="#67C23A"><Setting /></el-icon>
          <el-icon size="20" color="#E6A23C"><Star /></el-icon>
        </div>
      </div>
    </el-card>
    
    <!-- 布局组件演示 -->
    <el-card class="demo-card">
      <template #header>
        <span>布局组件演示</span>
      </template>
      
      <el-container style="height: 200px; border: 1px solid #eee;">
        <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
          <el-menu :default-openeds="['1']">
            <el-sub-menu index="1">
              <template #title><el-icon><House /></el-icon>导航一</template>
              <el-menu-item index="1-1">选项1</el-menu-item>
              <el-menu-item index="1-2">选项2</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2">
              <template #title><el-icon><Setting /></el-icon>导航二</template>
              <el-menu-item index="2-1">选项3</el-menu-item>
              <el-menu-item index="2-2">选项4</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
        
        <el-container>
          <el-header style="text-align: right; font-size: 12px">
            <el-dropdown>
              <el-icon style="margin-right: 15px"><Setting /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>查看</el-dropdown-item>
                  <el-dropdown-item>新增</el-dropdown-item>
                  <el-dropdown-item>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span>王小虎</span>
          </el-header>
          
          <el-main>
            <el-table :data="tableData" style="width: 100%">
              <el-table-column prop="date" label="日期" width="140" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="address" label="地址" />
            </el-table>
          </el-main>
        </el-container>
      </el-container>
    </el-card>
    
    <!-- UnCSS 优化说明 -->
    <el-card class="demo-card">
      <template #header>
        <span>🚀 UnCSS 优化说明</span>
      </template>
      <div class="optimization-info">
        <h3>✨ 优化特性</h3>
        <ul>
          <li>🎯 <strong>按需加载</strong>: 只加载使用到的Element Plus组件样式</li>
          <li>📦 <strong>体积优化</strong>: 自动移除未使用的CSS规则</li>
          <li>⚡ <strong>性能提升</strong>: 减少CSS文件大小，加快页面加载速度</li>
          <li>🔧 <strong>智能分析</strong>: 分析HTML结构，保留必要的CSS选择器</li>
        </ul>
        
        <h3>📊 当前使用的组件</h3>
        <el-tag 
          v-for="component in usedComponents" 
          :key="component"
          type="success"
          style="margin: 5px;"
        >
          {{ component }}
        </el-tag>
      </div>
    </el-card>
    
    <div class="navigation">
      <NuxtLink to="/" class="nav-link">
        <el-button type="primary" :icon="House">
          返回首页
        </el-button>
      </NuxtLink>
      <NuxtLink to="/three-cube" class="nav-link">
        <el-button type="info" :icon="Star">
          Three.js演示
        </el-button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// 导入Element Plus图标组件
import { House, User, Setting, Star } from '@element-plus/icons-vue'

// 响应式数据
const inputValue = ref('')

// 表格数据
const tableData = ref([
  {
    date: '2024-01-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1518 弄'
  },
  {
    date: '2024-01-02',
    name: '张小美',
    address: '上海市普陀区金沙江路 1517 弄'
  },
  {
    date: '2024-01-03',
    name: '李小明',
    address: '上海市普陀区金沙江路 1519 弄'
  }
])

// 使用的组件列表（用于显示UnCSS优化效果）
const usedComponents = ref([
  'ElButton', 'ElInput', 'ElCard', 'ElIcon', 
  'ElContainer', 'ElAside', 'ElHeader', 'ElMain',
  'ElMenu', 'ElSubMenu', 'ElMenuItem', 'ElDropdown',
  'ElDropdownMenu', 'ElDropdownItem', 'ElTable',
  'ElTableColumn', 'ElTag'
])

// 页面加载完成后的提示
onMounted(() => {
  console.log('🎨 Element Plus + UnCSS 演示页面已加载')
  console.log('📦 当前使用的组件:', usedComponents.value)
  
  // 显示UnCSS优化提示
  setTimeout(() => {
    ElMessage.success({
      message: '✨ UnCSS已优化CSS，移除了未使用的样式！',
      type: 'success',
      duration: 3000
    })
  }, 1000)
})
</script>

<style scoped>
.demo-container {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.demo-container h1 {
  text-align: center;
  color: white;
  margin-bottom: 30px;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.demo-card {
  margin: 20px auto;
  max-width: 1000px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-section {
  margin: 20px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.demo-section h3 {
  margin-bottom: 15px;
  color: #303133;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.icon-group {
  display: flex;
  gap: 20px;
  align-items: center;
}

.optimization-info {
  padding: 20px;
}

.optimization-info ul {
  list-style: none;
  padding: 0;
}

.optimization-info li {
  margin: 10px 0;
  padding: 10px;
  background: #f0f9ff;
  border-left: 4px solid #409eff;
  border-radius: 4px;
}

.navigation {
  text-align: center;
  margin-top: 30px;
}

.nav-link {
  text-decoration: none;
  margin: 0 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-container {
    padding: 10px;
  }
  
  .demo-container h1 {
    font-size: 2rem;
  }
  
  .demo-card {
    margin: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .navigation {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>