# Cải tiến Validation Game Directory

## 🎯 Mục tiêu

Cải tiến logic validation để:
1. Kiểm tra đầy đủ các file game cần thiết
2. Tìm TẤT CẢ thư mục "priconner" và chọn thư mục hợp lệ
3. Hiển thị cảnh báo chi tiết khi chọn thư mục sai

## ✅ Files cần thiết để nhận diện game

### Files bắt buộc:
```
PrincessConnectReDive.exe       - File thực thi game
UnityPlayer.dll                 - Unity engine
GameAssembly.dll                - Game assembly
PrincessConnectReDive_Data/     - Thư mục dữ liệu game
```

### Files tùy chọn (không bắt buộc):
```
doorstop_config.ini             - Config cho mod loader
dxgi.dll                        - DLL loader
UnityCrashHandler64.exe         - Crash handler
baselib.dll                     - Base library
translation_info.json           - Thông tin việt hóa (nếu đã cài)
BepInEx/                        - Framework mod (nếu đã cài)
dotnet/                         - .NET runtime (nếu đã cài)
```

## 🔍 Quy trình tìm kiếm mới

### Bước 1: Registry (< 1s)
```rust
if let Some(path) = find_in_registry() {
    if validate_game_path(path).is_ok() {
        return Some(path);
    }
}
```

### Bước 2: Thư mục phổ biến (< 3s)
```rust
if let Some(path) = search_common_locations() {
    return Some(path);
}
```

### Bước 3: Quét tất cả ổ đĩa (5-30s)
```rust
// Tìm TẤT CẢ các thư mục "priconner"
let all_candidates = find_all_priconner_folders();

// Lọc và chọn thư mục hợp lệ đầu tiên
for candidate in all_candidates {
    if validate_game_path(candidate).is_ok() {
        return Some(candidate);
    }
}
```

## 🎯 Logic mới

### 1. Thu thập tất cả thư mục "priconner"
```rust
fn find_all_priconner_folders() -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    // Quét tất cả ổ đĩa
    for drive in ['C', 'D', 'E', 'F', ...] {
        collect_priconner_folders(&drive, 2, &mut candidates);
    }

    candidates
}
```

### 2. Validate từng thư mục
```rust
for candidate in all_candidates {
    if validate_game_path(candidate).is_ok() {
        return Some(candidate);  // Trả về thư mục hợp lệ đầu tiên
    }
}
```

### 3. Validation chi tiết
```rust
pub fn validate(&mut self) -> bool {
    let required_files = vec![
        "PrincessConnectReDive.exe",
        "UnityPlayer.dll",
        "GameAssembly.dll",
    ];

    let data_folder_exists = self.path
        .join("PrincessConnectReDive_Data")
        .exists();

    self.is_valid = required_files.iter().all(|file| {
        self.path.join(file).exists()
    }) && data_folder_exists;

    self.is_valid
}
```

### 4. Lấy danh sách file thiếu
```rust
pub fn get_missing_files(&self) -> Vec<String> {
    let mut missing = Vec::new();

    if !self.path.join("PrincessConnectReDive.exe").exists() {
        missing.push("PrincessConnectReDive.exe".to_string());
    }
    
    if !self.path.join("UnityPlayer.dll").exists() {
        missing.push("UnityPlayer.dll".to_string());
    }
    
    if !self.path.join("GameAssembly.dll").exists() {
        missing.push("GameAssembly.dll".to_string());
    }
    
    if !self.path.join("PrincessConnectReDive_Data").exists() {
        missing.push("PrincessConnectReDive_Data/".to_string());
    }

    missing
}
```

## 📊 Kịch bản sử dụng

### Kịch bản 1: Tìm thấy 1 thư mục hợp lệ
```
Tìm thấy:
- C:\priconner (có đủ file game) ✓

Kết quả: Chọn C:\priconner
```

### Kịch bản 2: Tìm thấy nhiều thư mục, 1 hợp lệ
```
Tìm thấy:
- C:\priconner (không có file game) ✗
- D:\Games\priconner (có đủ file game) ✓
- E:\Backup\priconner (không có file game) ✗

Kết quả: Chọn D:\Games\priconner
```

### Kịch bản 3: Tìm thấy nhiều thư mục, không có thư mục nào hợp lệ
```
Tìm thấy:
- C:\priconner (thiếu GameAssembly.dll) ✗
- D:\priconner (thiếu UnityPlayer.dll) ✗

Kết quả: Không tự động chọn, yêu cầu người dùng chọn thủ công
```

### Kịch bản 4: Không tìm thấy thư mục nào
```
Tìm thấy: (không có)

Kết quả: Hiển thị "Chưa chọn thư mục game"
```

### Kịch bản 5: Người dùng chọn thủ công thư mục sai
```
Người dùng chọn: C:\Random\Folder

Validation:
- Thiếu: PrincessConnectReDive.exe
- Thiếu: UnityPlayer.dll
- Thiếu: GameAssembly.dll
- Thiếu: PrincessConnectReDive_Data/

Kết quả: Hiển thị dialog cảnh báo với danh sách file thiếu
```

## 🎨 UI/UX

### Cảnh báo khi chọn thư mục sai
```
┌─────────────────────────────────────────┐
│              ⚠️ Lỗi                     │
├─────────────────────────────────────────┤
│ Thư mục không phải là game Princess     │
│ Connect Re:Dive.                        │
│                                         │
│ Thiếu các file:                         │
│ • PrincessConnectReDive.exe             │
│ • UnityPlayer.dll                       │
│ • GameAssembly.dll                      │
│ • PrincessConnectReDive_Data/           │
│                                         │
│ Vui lòng chọn đúng thư mục game.        │
├─────────────────────────────────────────┤
│                    [OK]                 │
└─────────────────────────────────────────┘
```

### Trạng thái tìm kiếm
```
Đang tìm kiếm game...
→ Kiểm tra Registry...
→ Quét thư mục phổ biến...
→ Quét ổ đĩa C:\
→ Quét ổ đĩa D:\
→ Tìm thấy 3 thư mục "priconner"
→ Kiểm tra thư mục 1/3...
→ Kiểm tra thư mục 2/3...
✓ Tìm thấy game tại: D:\Games\priconner
```

## 🧪 Testing

### Test Case 1: Thư mục hợp lệ
```
Input: C:\priconner (có đủ file)
Expected: ✓ Validation thành công
```

### Test Case 2: Thiếu file .exe
```
Input: C:\priconner (không có PrincessConnectReDive.exe)
Expected: ✗ Lỗi "Thiếu các file: PrincessConnectReDive.exe"
```

### Test Case 3: Thiếu thư mục Data
```
Input: C:\priconner (không có PrincessConnectReDive_Data/)
Expected: ✗ Lỗi "Thiếu các file: PrincessConnectReDive_Data/"
```

### Test Case 4: Nhiều thư mục priconner
```
Input: 
- C:\priconner (không hợp lệ)
- D:\priconner (hợp lệ)
- E:\priconner (không hợp lệ)

Expected: Chọn D:\priconner
```

### Test Case 5: Tất cả thư mục đều không hợp lệ
```
Input:
- C:\priconner (thiếu file)
- D:\priconner (thiếu file)

Expected: Không tự động chọn, yêu cầu chọn thủ công
```

## 📋 Code Changes

### GameInfo.rs
```rust
// Thêm method get_missing_files
pub fn get_missing_files(&self) -> Vec<String> {
    let mut missing = Vec::new();
    
    if !self.path.join("PrincessConnectReDive.exe").exists() {
        missing.push("PrincessConnectReDive.exe".to_string());
    }
    // ... các file khác
    
    missing
}
```

### GameService.rs
```rust
// Tìm tất cả thư mục priconner
fn find_all_priconner_folders() -> Vec<PathBuf> {
    let mut candidates = Vec::new();
    // Quét tất cả ổ đĩa
    // Thu thập tất cả thư mục "priconner"
    candidates
}

// Validate với message chi tiết
pub fn validate_game_path(path: PathBuf) -> Result<GameInfo, String> {
    let mut game_info = GameInfo::new(path);
    
    if !game_info.validate() {
        let missing = game_info.get_missing_files();
        return Err(format!(
            "Thư mục không phải là game Princess Connect Re:Dive.\n\nThiếu các file: {}",
            missing.join(", ")
        ));
    }
    
    Ok(game_info)
}
```

## 🚀 Kết luận

Validation đã được cải tiến:
- ✅ Kiểm tra đầy đủ 4 file/folder cần thiết
- ✅ Tìm TẤT CẢ thư mục "priconner"
- ✅ Chọn thư mục hợp lệ đầu tiên
- ✅ Hiển thị cảnh báo chi tiết khi sai
- ✅ Message lỗi rõ ràng với danh sách file thiếu
- ✅ UX tốt hơn cho người dùng

Người dùng sẽ biết chính xác tại sao thư mục không hợp lệ và cần làm gì!
