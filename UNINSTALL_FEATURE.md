# Tính năng Gỡ bỏ Bản việt hóa

## ✨ Tính năng mới

Đã thêm nút "Gỡ bỏ" để gỡ bản việt hóa khỏi game.

## 🎯 Vị trí

Nút "Gỡ bỏ" xuất hiện ở góc phải của section "Phiên bản hiện tại":

```
┌─────────────────────────────────┐
│ PHIÊN BẢN HIỆN TẠI    [Gỡ bỏ]  │
│ [v20260211] Cài đặt: 11/02/2026 │
└─────────────────────────────────┘
```

## 🔄 Quy trình gỡ bỏ

### 1. Nhấn nút "Gỡ bỏ"
- Hiển thị dialog xác nhận
- Thông báo: "Bạn có chắc muốn gỡ bỏ bản việt hóa?"
- Giải thích: Dữ liệu cũ sẽ được backup

### 2. Xác nhận gỡ bỏ
- Nhấn "Gỡ bỏ" → Thực hiện gỡ
- Nhấn "Hủy" → Đóng dialog

### 3. Backend xử lý
```rust
pub fn uninstall_translation(&self, game_path: &Path) -> Result<(), String> {
    // 1. Backup trước khi gỡ
    self.backup_old_translation(game_path)?;

    // 2. Xóa files việt hóa
    self.remove_old_translation(game_path)?;

    // 3. Xóa file thông tin
    let info_file = game_path.join("translation_info.json");
    if info_file.exists() {
        FileService::remove_path(&info_file)?;
    }

    Ok(())
}
```

### 4. Files bị xóa
- `BepInEx/` - Thư mục BepInEx framework
- `dotnet/` - Thư mục .NET runtime
- `.doorstop_version` - File version
- `doorstop_config.ini` - File config
- `dxgi.dll` - DLL loader
- `translation_info.json` - File thông tin

### 5. Backup
Tất cả files trên được backup vào:
```
[game_path]/translation_backup/
├── BepInEx/
├── dotnet/
├── .doorstop_version
├── doorstop_config.ini
├── dxgi.dll
└── translation_info.json
```

## 🎨 UI Design

### Nút "Gỡ bỏ"
- Màu đỏ (danger color)
- Border đỏ, background trong suốt
- Hover: Background đỏ nhạt
- Disabled khi đang cài đặt/gỡ bỏ

### Dialog xác nhận
- Overlay tối với blur
- Glass panel style
- 2 nút: "Hủy" (xám) và "Gỡ bỏ" (đỏ)
- Animation: fadeIn + slideUp

## 📝 Code Changes

### MainScreen.tsx

**State mới:**
```typescript
const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);
```

**Handler mới:**
```typescript
const handleUninstall = async () => {
  if (!gamePath) return;
  
  setShowUninstallConfirm(false);
  await uninstall(gamePath);
};
```

**UI mới:**
```tsx
{/* Nút gỡ bỏ */}
<button 
  onClick={() => setShowUninstallConfirm(true)}
  className="uninstall-btn"
  disabled={isInstalling}
>
  Gỡ bỏ
</button>

{/* Dialog xác nhận */}
{showUninstallConfirm && (
  <div className="confirm-overlay">
    <div className="confirm-dialog">
      <h3>Xác nhận gỡ bỏ</h3>
      <p>Bạn có chắc muốn gỡ bỏ bản việt hóa?</p>
      <button onClick={handleUninstall}>Gỡ bỏ</button>
      <button onClick={() => setShowUninstallConfirm(false)}>Hủy</button>
    </div>
  </div>
)}
```

### MainScreen.css

**Nút gỡ bỏ:**
```css
.uninstall-btn {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
  font-size: 11px;
}

.uninstall-btn:hover {
  background: rgba(255, 107, 107, 0.2);
}
```

**Dialog xác nhận:**
```css
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
}

.confirm-dialog {
  max-width: 400px;
  padding: 24px;
}

.confirm-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  color: white;
}
```

## 🧪 Testing

### Test Case 1: Hiển thị nút
1. Cài đặt bản việt hóa
2. Kiểm tra nút "Gỡ bỏ" xuất hiện
3. Nút nằm ở góc phải section "Phiên bản hiện tại"

### Test Case 2: Dialog xác nhận
1. Nhấn nút "Gỡ bỏ"
2. Dialog xuất hiện với message
3. Có 2 nút: "Hủy" và "Gỡ bỏ"

### Test Case 3: Hủy gỡ bỏ
1. Nhấn "Gỡ bỏ"
2. Nhấn "Hủy" trong dialog
3. Dialog đóng, không gỡ bỏ gì

### Test Case 4: Gỡ bỏ thành công
1. Nhấn "Gỡ bỏ"
2. Nhấn "Gỡ bỏ" trong dialog
3. Files việt hóa bị xóa
4. Backup được tạo trong `translation_backup/`
5. Section "Phiên bản hiện tại" biến mất
6. Hiển thị message "Đã gỡ bỏ bản việt hóa"

### Test Case 5: Disabled khi đang cài đặt
1. Bắt đầu cài đặt bản việt hóa
2. Nút "Gỡ bỏ" bị disabled
3. Không thể nhấn được

## 🔒 An toàn

### Backup tự động
- Mọi file việt hóa được backup trước khi xóa
- Backup vào `translation_backup/`
- Người dùng có thể restore thủ công nếu cần

### Xác nhận trước khi xóa
- Dialog xác nhận ngăn xóa nhầm
- Message rõ ràng về hành động
- Giải thích về backup

### Không xóa file game
- Chỉ xóa files việt hóa
- Không động đến files gốc của game
- Game vẫn chạy bình thường sau khi gỡ

## 🎯 User Experience

### Trước khi có tính năng:
- Người dùng phải xóa thủ công
- Không biết xóa file nào
- Dễ xóa nhầm file game
- Không có backup

### Sau khi có tính năng:
- 1 click để gỡ bỏ
- Tự động backup
- An toàn, không xóa nhầm
- Có thể restore nếu cần

## 📋 Checklist

- [x] Backend: uninstall_translation command
- [x] Frontend: Nút "Gỡ bỏ"
- [x] Frontend: Dialog xác nhận
- [x] Frontend: Handler uninstall
- [x] CSS: Style nút và dialog
- [x] UX: Disabled khi đang cài đặt
- [x] Safety: Backup trước khi xóa
- [x] Safety: Xác nhận trước khi xóa

## 🚀 Kết luận

Tính năng gỡ bỏ đã hoàn chỉnh với:
- ✅ UI đẹp và dễ sử dụng
- ✅ An toàn với backup tự động
- ✅ Xác nhận trước khi xóa
- ✅ Chỉ xóa files việt hóa, không động đến game
- ✅ Feedback rõ ràng cho người dùng
