# Components

此目录存放了项目的所有可复用 Vue 组件。

## 组织结构

为了保持代码的清晰和可维护性，我们建议遵循以下组织结构：

- **通用基础组件 (Base Components):**
  - 存放最基础、最通用的原子级组件，例如按钮 (`BaseButton.vue`)、输入框 (`BaseInput.vue`)、图标 (`BaseIcon.vue`) 等。
  - 建议文件名以 `Base` 开头。
  - 可以直接放在 `components/` 根目录下，或创建一个 `components/base/` 子目录。

- **业务功能组件 (Feature Components):**
  - 存放与特定业务功能或页面相关的组件。
  - 建议按照功能/页面创建子目录，例如 `components/user/UserProfile.vue` 或 `components/product/ProductCard.vue`。

- **布局组件 (Layout Components):**
  - 如果某些布局部分（非 Nuxt 的 `layouts/`）在多个页面中复用，可以放在这里，例如 `TheHeader.vue`, `TheFooter.vue`。
  - 建议文件名以 `The` 开头，表示全局单例。

## 命名规范

- **文件名:** 使用帕斯卡命名法 (PascalCase)，例如 `MyComponent.vue`。
- **组件名:** 在 `<script setup>` 中，组件名由文件名自动推断。在模板中使用时，也应使用 PascalCase，例如 `<MyComponent />`。

## 自动导入

Nuxt 3 会自动导入 `components/` 目录下的所有组件，你无需在 `<script>` 块中手动 `import` 它们。只需在模板中直接使用即可。

---

_此文件由 Trae AI 助手创建和维护。_
