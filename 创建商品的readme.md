# 商品插入规范

## 必填字段（必须提供）

| 字段         | 类型            | 约束       | 说明           | 示例                       |
| ------------ | --------------- | ---------- | -------------- | -------------------------- |
| `goods_name` | `varchar(100)`  | `NOT NULL` | 商品名称       | `'白色正肩t恤男士夏季...'` |
| `image`      | `varchar(255)`  | `NOT NULL` | 商品主图文件名 | `'goods_10_tjjvh6'`        |
| `price`      | `numeric(10,2)` | `NOT NULL` | 商品售价       | `99.00`                    |
| `shop_id`    | `bigint`        | `NOT NULL` | 所属商家ID     | `1002`                     |
| `shop_name`  | `varchar(100)`  | -          | 商家名称       | `'店铺1002'`               |

## 可选/Mock字段（提供默认值）

以下字段若不提供，将自动使用默认值：

| 字段             | 类型           | 默认值  | 说明                                                       |
| ---------------- | -------------- | ------- | ---------------------------------------------------------- |
| `stock`          | `integer`      | `0`     | 商品库存。若存在 SKU 表触发器，插入 SKU 后会自动计算汇总值 |
| `is_show`        | `smallint`     | `1`     | 上架状态：`1`上架，`0`下架                                 |
| `sort`           | `integer`      | `0`     | 排序权重，数值越大越靠前                                   |
| `category_id`    | `bigint`       | `NULL`  | 商品分类ID                                                 |
| `sales_count`    | `integer`      | `0`     | 销量统计                                                   |
| `review_count`   | `integer`      | `0`     | 评价数量（由 `goods_reviews` 触发器自动更新）              |
| `average_rating` | `numeric(3,2)` | `0.00`  | 平均评分（由 `goods_reviews` 触发器自动更新）              |
| `created_at`     | `timestamp`    | `now()` | 创建时间（自动填充）                                       |
| `updated_at`     | `timestamp`    | `now()` | 更新时间（自动填充）                                       |

## SQL 示例

### 基础插入（仅必填字段）

```sql
INSERT INTO goods (
    goods_name,
    image,
    price,
    shop_id,
    shop_name
) VALUES (
    '白色正肩t恤男士夏季重磅长袖半袖华夫格短袖男款打底衫',
    'goods_10_tjjvh6',
    99.00,
    1002,
    '店铺1002'
)
RETURNING id, goods_name, stock;
```
