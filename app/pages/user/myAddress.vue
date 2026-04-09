<template>
  <div class="flex flex-col">
    <address-dialog ref="addressDialogRef" @refresh="getData"></address-dialog>
    <div>
      <el-button type="primary" @click="handleAdd">添加添加地址</el-button>
    </div>
    <el-table
      v-loading="loadingStore.isLoading"
      :data="tableData"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="recipient_name" label="收货人姓名" width="180" />
      <el-table-column prop="recipient_phone" label="手机号" width="180" />
      <el-table-column :formatter="formatRegion" label="所在地区" />
      <el-table-column prop="detail_address" label="详细地址" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            text
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            text
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="默认地址" align="center" prop="is_default">
        <template #default="scope">
          <el-tag v-if="scope.row.is_default" type="success">默认地址</el-tag>
          <el-button
            v-else
            text
            type="primary"
            size="small"
            @click="handleSetDefault(scope.row)"
            >设置为默认地址</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import AddressDialog from "@/components/addressDialog.vue";
import {
  getAddressListApi,
  updateAddressApi,
  deleteAddressApi,
} from "@/api/addressApi";
import type { UserAddress } from "~~/server/types/user-address";

import { codeToText } from "element-china-area-data";
import { ref, onMounted } from "vue";
const loadingStore = useLoadingStore();
const tableData = ref<UserAddress[]>([]);
const addressDialogRef = ref<InstanceType<typeof AddressDialog>>();

function handleEdit(row: UserAddress) {
  addressDialogRef.value?.handleOpen(row, true);
}
function handleAdd(row: UserAddress) {
  addressDialogRef.value?.handleOpen(row, false);
}

function handleDelete(row: UserAddress) {
  // 二次确认删除
  ElMessageBox.confirm("确认删除该地址吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteAddressApi(row.id).then(() => {
      getData();
    });
  });
}

// 设置默认地址
function handleSetDefault(row: UserAddress) {
  updateAddressApi({ id: row.id, is_default: true }).then(() => {
    getData();
  });
}

onMounted(() => {
  getData();
});
onActivated(() => {
  getData();
});

function getData() {
  getAddressListApi().then((res) => {
    tableData.value = res.data.list;
  });
}

// 格式化地区
function formatRegion(row: UserAddress) {
  return `${codeToText[row.province_code] || ""} 
    ${codeToText[row.city_code] || ""} 
    ${codeToText[row.district_code] || ""}`;
}
</script>
