# Migration to Vanilla CSS

Đã chuyển đổi từ Tailwind CSS và shadcn/ui sang CSS thuần.

## Các thay đổi đã thực hiện:

1. **Xóa dependencies không cần thiết:**
   - `tailwindcss`
   - `@tailwindcss/postcss`
   - `@tailwindcss/vite`
   - `autoprefixer`
   - `postcss`
   - `shadcn`
   - `tw-animate-css`
   - `class-variance-authority`
   - `clsx`
   - `tailwind-merge`
   - `radix-ui`
   - `react-icons`

2. **Xóa file cấu hình:**
   - `components.json` (shadcn/ui config)
   - `postcss.config.js`

3. **Cập nhật files:**
   - `src/index.css` - Viết lại toàn bộ CSS thuần
   - `src/App.tsx` - Thay thế Tailwind classes bằng CSS classes
   - `src/components/pages/MainScreen.tsx` - Thay thế Tailwind classes
   - `src/components/pages/Settings.tsx` - Thay thế Tailwind classes
   - `src/lib/utils.ts` - Xóa tailwind-merge, giữ lại utility function đơn giản
   - `vite.config.ts` - Xóa Tailwind plugin

4. **Xóa thư mục components/ui** (shadcn/ui components)

## Cài đặt lại dependencies:

```bash
# Xóa node_modules và lock file cũ
rm -rf node_modules
rm bun.lock

# Cài đặt lại
bun install
```

## Chạy ứng dụng:

```bash
bun run dev
```

hoặc

```bash
bun run tauri dev
```

## Lưu ý:

- Tất cả styling giờ đây được quản lý trong `src/index.css`
- Không còn sử dụng Tailwind utility classes
- CSS được tổ chức theo component với naming convention rõ ràng
- Giữ nguyên theme màu sắc và design system
