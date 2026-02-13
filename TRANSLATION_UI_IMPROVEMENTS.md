# Cải tiến UI cho Bản việt hóa

## Những thay đổi đã thực hiện

### 1. Hiển thị thông tin phiên bản hiện tại

**Trước đây:**
- Không hiển thị thông tin bản việt hóa đã cài đặt
- Chỉ có badge "Đã cài" trong dropdown
- Người dùng không biết phiên bản nào đang được cài

**Bây giờ:**
- Hiển thị section "Phiên bản hiện tại" với:
  - Số phiên bản (màu xanh lá)
  - Ngày cài đặt
  - Border màu xanh để nhấn mạnh
- Chỉ hiển thị khi đã có bản việt hóa

### 2. Logic nút cài đặt thông minh

**Trước đây:**
- Nút hiển thị "Đã cài đặt" khi cùng phiên bản
- Icon Play (không phù hợp)
- Không thể cài lại

**Bây giờ:**
- "Chọn thư mục game" - Khi chưa chọn game
- "Cài đặt" - Khi chưa có bản việt hóa
- "Cập nhật" - Khi có phiên bản mới hơn
- "Cài lại" - Khi chọn cùng phiên bản đã cài
  - Màu xanh lá thay vì hồng
  - Cho phép cài lại nếu bị lỗi

### 3. Cải thiện UX

**Layout:**
```
┌─────────────────────────────────┐
│ Thư mục game                    │
│ [Path] [Đổi]                    │
├─────────────────────────────────┤
│ Phiên bản hiện tại              │ ← MỚI
│ [v20260211] Cài đặt: 11/02/2026 │
├─────────────────────────────────┤
│ Chọn phiên bản                  │
│ [Dropdown với badge "Đã cài"]   │
├─────────────────────────────────┤
│ [Nút hành động]                 │
└─────────────────────────────────┘
```

**Màu sắc:**
- Phiên bản hiện tại: Border xanh lá (#7dd3c0)
- Nút "Cài lại": Gradient xanh lá
- Nút "Cập nhật": Gradient hồng (mặc định)
- Nút "Cài đặt": Gradient hồng (mặc định)

### 4. Trải nghiệm người dùng

**Kịch bản 1: Lần đầu cài đặt**
1. Chọn thư mục game
2. Chọn phiên bản từ dropdown
3. Nhấn "Cài đặt"
4. Sau khi cài xong, hiển thị "Phiên bản hiện tại"
5. Nút đổi thành "Cài lại"

**Kịch bản 2: Có bản mới**
1. Mở app, thấy "Phiên bản hiện tại: v20260211"
2. Dropdown hiển thị "Mới nhất: v20260215"
3. Chọn phiên bản mới
4. Nút tự động đổi thành "Cập nhật"
5. Nhấn để cập nhật

**Kịch bản 3: Cài lại (khi bị lỗi)**
1. Thấy "Phiên bản hiện tại: v20260211"
2. Dropdown vẫn chọn v20260211 (có badge "Đã cài")
3. Nút hiển thị "Cài lại" (màu xanh)
4. Nhấn để cài lại nếu cần

## Code Changes

### Frontend (MainScreen.tsx)

1. **Thêm section hiển thị phiên bản hiện tại:**
```tsx
{hasGame && hasTranslation && currentInfo && (
  <div className="current-translation-section">
    <div className="current-translation-header">
      <span className="current-translation-label">Phiên bản hiện tại</span>
    </div>
    <div className="current-translation-info">
      <div className="current-version-badge">
        <span className="current-version-text">{currentInfo.version}</span>
      </div>
      <span className="current-install-date">
        Cài đặt: {new Date(currentInfo.installed_date).toLocaleDateString('vi-VN')}
      </span>
    </div>
  </div>
)}
```

2. **Cập nhật logic nút:**
```tsx
const getMainButtonText = () => {
  if (isInstalling) return "Đang cài đặt...";
  if (!hasGame) return "Chọn thư mục game";
  if (hasTranslation && currentInfo?.version === selectedVersion?.version) return "Cài lại";
  if (hasTranslation && currentInfo?.version !== selectedVersion?.version) return "Cập nhật";
  return "Cài đặt";
};
```

3. **Thêm class cho nút cài lại:**
```tsx
className={`main-button ${!hasGame ? 'select-path' : ''} ${hasTranslation && currentInfo?.version === selectedVersion?.version ? 'reinstall' : ''}`}
```

### CSS (MainScreen.css)

1. **Style cho phiên bản hiện tại:**
```css
.current-translation-info {
  padding: 16px 18px;
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--success);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.current-version-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--success);
}
```

2. **Style cho nút cài lại:**
```css
.main-button.reinstall {
  background: linear-gradient(135deg, #7dd3c0 0%, #5fb8a8 100%);
  box-shadow: 0 4px 20px rgba(125, 211, 192, 0.3);
}
```

## Lợi ích

1. **Rõ ràng hơn:** Người dùng biết chính xác phiên bản nào đang cài
2. **Linh hoạt hơn:** Có thể cài lại nếu bị lỗi
3. **Trực quan hơn:** Màu sắc và layout phân biệt rõ các trạng thái
4. **Chuyên nghiệp hơn:** Giống các launcher game AAA (Genshin, Honkai)

## Testing

Để test các tính năng mới:

1. **Test hiển thị phiên bản hiện tại:**
   - Cài đặt bản việt hóa
   - Kiểm tra section "Phiên bản hiện tại" xuất hiện
   - Xác nhận số phiên bản và ngày cài đặt đúng

2. **Test nút "Cài lại":**
   - Chọn cùng phiên bản đã cài
   - Xác nhận nút đổi thành "Cài lại" màu xanh
   - Nhấn và kiểm tra có cài lại được không

3. **Test nút "Cập nhật":**
   - Tạo release mới trên GitHub
   - Chọn phiên bản mới
   - Xác nhận nút đổi thành "Cập nhật"
   - Nhấn và kiểm tra cập nhật thành công

4. **Test badge "Đã cài":**
   - Mở dropdown
   - Xác nhận phiên bản hiện tại có badge "Đã cài"
