// ============================================
// 📁 types/user-address.ts
// ============================================

// ============================================
// 1. 数据库模型层 (Database Layer)
// ============================================

/**
 * 数据库原始类型 - 对应 Supabase 表结构
 * 包含所有数据库自动生成的字段
 */
export interface UserAddressDB {
  id: number;
  user_id: number;
  recipient_name: string;
  recipient_phone: string;
  province_code: string;
  city_code: string;
  district_code: string;
  detail_address: string;
  is_default: boolean;
  isChecked: boolean;
  created_at: string; // ISO 8601: 2024-01-15T08:30:00Z
  updated_at: string;
}

// ============================================
// 2. 前端业务层 (Frontend Business Layer)
// ============================================

/**
 * 前端地址展示类型
 */
export interface UserAddress extends UserAddressDB {
  // 前端计算属性：省市区中文名称
  province_name: string;
  city_name: string;
  district_name: string;
  // 完整地址字符串（省+市+区+详细地址）
  full_address: string;
  // 脱敏手机号（138****8888）
  masked_phone: string;
}

/**
 * 前端表单类型 - 与 el-cascader 绑定
 */
export interface UserAddressForm {
  // 级联选择器绑定值 [province_code, city_code, district_code]
  selected: [string, string, string] | [];
  detailAddress: string;
  name: string;
  phone: string;
  isDefault: boolean;
}

// ============================================
// 3. API 请求类型 (API Request Types)
// ============================================

/**
 * 创建地址请求
 * POST /api/user-address
 */
export interface CreateAddressRequest {
  recipient_name: string;
  recipient_phone: string;
  province_code: string;
  city_code: string;
  district_code: string;
  detail_address: string;
  is_default?: boolean;
}

/**
 * 更新地址请求
 * PUT /api/user-address/:id
 */
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  // 允许部分更新，所有字段可选
  id: number;
}

/**
 * 设置默认地址
 * PATCH /api/user-address/:id/default
 */
export interface SetDefaultAddressRequest {
  is_default: true;
}

/**
 * 地址查询参数
 * GET /api/user-address?is_default=true&limit=10
 */
export interface AddressQueryParams {
  is_default?: boolean;
  limit?: number;
  offset?: number;
  order_by?: "created_at" | "updated_at";
  order?: "asc" | "desc";
}

// ============================================
// 4. API 响应类型 (API Response Types)
// ============================================

/**
 * 标准 API 响应包装
 */
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  timestamp: string;
}

/**
 * 单条地址响应
 */
export type AddressResponse = ApiResponse<UserAddress>;

/**
 * 地址列表响应
 */
export interface AddressListResponse extends ApiResponse<{
  list: UserAddress[];
  total: number;
}> {}

/**
 * 操作成功响应（删除、设置默认等）
 */
export interface AddressActionResponse extends ApiResponse<{
  id: number;
  affected_rows: number;
}> {}

// ============================================
// 5. 错误类型 (Error Types)
// ============================================

export enum AddressErrorCode {
  // 客户端错误 4xx
  INVALID_PHONE = 400001, // 手机号格式错误
  INVALID_NAME = 400002, // 姓名格式错误
  ADDRESS_NOT_FOUND = 404001, // 地址不存在
  NOT_OWNER = 403001, // 无权操作他人地址
  MAX_ADDRESS_LIMIT = 429001, // 地址数量超限（最多20条）

  // 服务端错误 5xx
  DB_ERROR = 500001,
}

export interface AddressError {
  code: AddressErrorCode;
  message: string;
  field?: string; // 错误关联的字段（表单校验用）
}
