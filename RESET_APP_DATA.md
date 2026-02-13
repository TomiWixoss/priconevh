# Hướng dẫn Xóa Dữ liệu App để Test

## 📍 Vị trí file config

App lưu config tại:
```
C:\Users\[username]\AppData\Roaming\priconevh\config.json
```

Hoặc đường dẫn đầy đủ cho bạn:
```
C:\Users\tomis\AppData\Roaming\priconevh\config.json
```

## 🗑️ Cách xóa dữ liệu app

### Phương pháp 1: Xóa thủ công (Khuyến nghị)

1. Mở File Explorer
2. Paste đường dẫn vào address bar:
   ```
   %APPDATA%\priconevh
   ```
3. Xóa file `config.json`
4. Hoặc xóa toàn bộ thư mục `priconevh`

### Phương pháp 2: Dùng Command Prompt

```cmd
del "%APPDATA%\priconevh\config.json"
```

Hoặc xóa toàn bộ thư mục:
```cmd
rmdir /s /q "%APPDATA%\priconevh"
```

### Phương pháp 3: Dùng PowerShell

```powershell
Remove-Item "$env:APPDATA\priconevh\config.json" -Force
```

Hoặc xóa toàn bộ thư mục:
```powershell
Remove-Item "$env:APPDATA\priconevh" -Recurse -Force
```

## 🧪 Test tính năng quét thư mục

### Bước 1: Xóa config
```cmd
del "%APPDATA%\priconevh\config.json"
```

### Bước 2: Đóng app (nếu đang chạy)
- Đóng hoàn toàn app
- Kiểm tra Task Manager không còn process

### Bước 3: Mở lại app
- App sẽ không có game path đã lưu
- Tự động bắt đầu quét thư mục

### Bước 4: Quan sát quá trình
App sẽ thực hiện theo thứ tự:

1. **Kiểm tra Registry** (< 1s)
   - Tìm trong Windows Registry
   - Kiểm tra Steam install path

2. **Quét thư mục phổ biến** (< 3s)
   - C:\priconner
   - D:\priconner
   - C:\Games\priconner
   - D:\Games\priconner
   - ... (20+ vị trí)

3. **Quét tất cả ổ đĩa** (5-30s)
   - Quét C:\ → D:\ → E:\ → ...
   - Tìm tất cả thư mục "priconner"
   - Validate từng thư mục
   - Chọn thư mục hợp lệ đầu tiên

### Bước 5: Kết quả mong đợi

**Nếu tìm thấy:**
```
✓ Đã tìm thấy game tại: C:\Users\tomis\priconner
```

**Nếu không tìm thấy:**
```
Chưa chọn thư mục game
[Chọn thư mục game]
```

## 🔍 Debug: Kiểm tra app có tìm đúng không

### Kiểm tra thư mục game có đủ file không

Mở Command Prompt và chạy:
```cmd
cd C:\Users\tomis\priconner
dir
```

Kiểm tra có các file sau:
- ✅ PrincessConnectReDive.exe
- ✅ UnityPlayer.dll
- ✅ GameAssembly.dll
- ✅ PrincessConnectReDive_Data\ (thư mục)

Nếu thiếu file nào, app sẽ không chọn thư mục này.

### Kiểm tra có nhiều thư mục "priconner" không

```cmd
dir C:\ /s /b | findstr /i "priconner"
dir D:\ /s /b | findstr /i "priconner"
```

Nếu có nhiều thư mục, app sẽ:
1. Tìm tất cả
2. Validate từng thư mục
3. Chọn thư mục hợp lệ đầu tiên

## 📊 Kịch bản test

### Test 1: Game ở vị trí chuẩn
```
Setup:
- Game tại: C:\Users\tomis\priconner
- Có đủ file game

Steps:
1. Xóa config
2. Mở app
3. Chờ 1-3 giây

Expected:
✓ Tự động tìm thấy và chọn C:\Users\tomis\priconner
```

### Test 2: Game ở vị trí lạ
```
Setup:
- Di chuyển game đến: E:\MyFolder\priconner
- Có đủ file game

Steps:
1. Xóa config
2. Mở app
3. Chờ 5-15 giây (quét ổ đĩa)

Expected:
✓ Tự động tìm thấy và chọn E:\MyFolder\priconner
```

### Test 3: Nhiều thư mục priconner
```
Setup:
- C:\priconner (không có file game)
- D:\priconner (có đủ file game)
- E:\priconner (không có file game)

Steps:
1. Xóa config
2. Mở app
3. Chờ quét

Expected:
✓ Bỏ qua C:\priconner và E:\priconner
✓ Chọn D:\priconner (thư mục hợp lệ)
```

### Test 4: Không có game
```
Setup:
- Không cài game
- Hoặc game không tên "priconner"

Steps:
1. Xóa config
2. Mở app
3. Chờ quét xong

Expected:
✗ Không tìm thấy
→ Hiển thị "Chưa chọn thư mục game"
→ Nút "Chọn thư mục game"
```

### Test 5: Chọn thủ công thư mục sai
```
Setup:
- Xóa config
- App không tìm thấy tự động

Steps:
1. Nhấn "Chọn thư mục game"
2. Chọn thư mục không phải game (VD: C:\Windows)
3. Nhấn OK

Expected:
✗ Hiển thị dialog lỗi:
"Thư mục không phải là game Princess Connect Re:Dive.

Thiếu các file:
• PrincessConnectReDive.exe
• UnityPlayer.dll
• GameAssembly.dll
• PrincessConnectReDive_Data/"
```

## 🐛 Troubleshooting

### App không tìm thấy game

**Nguyên nhân 1: Thư mục không tên "priconner"**
```
Solution: Đổi tên thư mục thành "priconner"
```

**Nguyên nhân 2: Thiếu file game**
```
Solution: Kiểm tra có đủ 4 file/folder cần thiết:
- PrincessConnectReDive.exe
- UnityPlayer.dll
- GameAssembly.dll
- PrincessConnectReDive_Data/
```

**Nguyên nhân 3: Game ở ổ đĩa mạng/USB**
```
Solution: App chỉ quét ổ đĩa cục bộ (C: đến Z:)
Chọn thủ công nếu game ở ổ mạng
```

### App quét quá lâu

**Nguyên nhân: Nhiều file trên ổ đĩa**
```
Solution: 
- Chờ quét xong (tối đa 30s)
- Hoặc nhấn "Chọn thư mục game" để chọn thủ công
```

### App chọn sai thư mục

**Nguyên nhân: Có nhiều thư mục "priconner"**
```
Solution:
- App chọn thư mục hợp lệ đầu tiên
- Nếu muốn dùng thư mục khác, chọn thủ công
```

## 📝 Lưu ý

1. **Backup config trước khi xóa** (nếu cần):
   ```cmd
   copy "%APPDATA%\priconevh\config.json" "%USERPROFILE%\Desktop\config_backup.json"
   ```

2. **Restore config**:
   ```cmd
   copy "%USERPROFILE%\Desktop\config_backup.json" "%APPDATA%\priconevh\config.json"
   ```

3. **Xem log** (nếu có):
   - App có thể log quá trình quét
   - Kiểm tra console/terminal khi chạy dev mode

## 🚀 Quick Test Commands

Chạy các lệnh này để test nhanh:

```cmd
REM Xóa config
del "%APPDATA%\priconevh\config.json"

REM Kiểm tra game có đủ file
cd C:\Users\tomis\priconner
dir PrincessConnectReDive.exe
dir UnityPlayer.dll
dir GameAssembly.dll
dir PrincessConnectReDive_Data

REM Tìm tất cả thư mục priconner
dir C:\ /s /b | findstr /i "priconner"
```

Giờ bạn có thể test tính năng quét thư mục!
