<template>
  <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
    <el-tab-pane
      v-for="tab in tabs"
      :key="tab.value"
      :label="tab.label"
      :name="tab.value"
    >
      <order-table :orderMap="orderMap" />
      <!-- 分页组件（如果需要） -->
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref, onMounted, onActivated } from "vue";
import type { TabsPaneContext } from "element-plus";
import { getOrderListApi } from "~/api/order";
import type {
  OrderListResponseDTO,
  OrderItem,
} from "~~/server/api/orders/list.post";
import OrderTable from "./components/order-table.vue";
// 订单状态枚举（与后端一致）OrderStatus.PENDING_PAYMENT 打印出来为 0
enum OrderStatus {
  ALL = 5, // 所有状态
  PENDING_PAYMENT = 0, // 待支付
  PENDING_SHIPMENT = 1, // 待发货
  PENDING_RECEIPT = 2, // 待收货
  COMPLETED = 3, // 已完成
  CANCELLED = 4, // 已取消
}

// 状态对应的中文标签
const ORDER_STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  [OrderStatus.ALL]: "所有状态",
  [OrderStatus.PENDING_PAYMENT]: "待支付",
  [OrderStatus.PENDING_SHIPMENT]: "待发货",
  [OrderStatus.PENDING_RECEIPT]: "待收货",
  [OrderStatus.COMPLETED]: "已完成",
  [OrderStatus.CANCELLED]: "已取消",
};

// 构建 tabs 数据，使用枚举值作为 name（转换为字符串，因为 v-model 绑定的一般是 string/number）
const tabs = Object.entries(ORDER_STATUS_LABEL_MAP).map(([value, label]) => ({
  label,
  value: Number(value), // 使用数字作为 name，也可以转为字符串，但要注意 v-model 类型
}));

// 当前激活的 tab（默认所有状态）
const activeName = ref<OrderStatus>(OrderStatus.ALL);

/**
 * 订单映射对象，key 为订单号，value 为订单项数组 可以通过orderMap[order_shop_id] 来获取对应订单号的所有订单项
 */
const orderMap = ref<Record<number, OrderItem[]>>({});

// 根据状态值获取中文标签（用于表格内显示）
function getStatusLabel(status: number): string {
  return ORDER_STATUS_LABEL_MAP[status as OrderStatus] || "未知";
}

// 获取订单列表
async function fetchOrderList(status: OrderStatus) {
  try {
    const res = (await getOrderListApi({
      item_status: status,
      page: 1,
      pageSize: 20,
    })) as OrderListResponseDTO;
    const orderList = res.data.OrderList || [];
    console.log(`✅ 获取状态 ${status} 订单列表:`, orderList);
    // 根据订单号聚合订单项
    /**
     * 1.创建一个空的映射对象，后续可以使用订单号作为key,value 为订单项数组
     * 可以通过Object.entries() 得到一个包含所有订单号和对应订单项数组的数组，每个元素是一个数组，包含订单号和订单项数组，格式为 [order_shop_id, order_items]
     */
    orderMap.value = orderList.reduce(
      (acc: Record<string, OrderItem[]>, item: OrderItem) => {
        const key = item.slave_order_no; // 订单号作为key
        // 若首次遇到该订单号，初始化一个空数组作为 value
        if (acc[key] === undefined) {
          acc[key] = [];
        }
        // 将当前订单项添加到对应订单号的数组中
        acc[key].push(item);
        return acc;
      },
      {} as Record<number, OrderItem[]>,
    );
  } catch (error) {
    console.error("获取订单列表失败:", error);
  }
}

// tab 切换处理
const handleClick = (tab: TabsPaneContext) => {
  // tab.paneName 是当前选中的 name（可能是 string 或 number），这里我们存的是数字
  const status = tab.paneName as OrderStatus;
  fetchOrderList(status);
};

// 初始化加载
onMounted(() => {
  fetchOrderList(activeName.value);
});

onActivated(() => {
  // 如果使用 keep-alive，激活时重新加载（可选，根据业务决定）
  fetchOrderList(activeName.value);
});
</script>

<style scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
