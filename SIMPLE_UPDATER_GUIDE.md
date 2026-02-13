# Hướng dẫn Updater đơn giản (Không cần API Key)

## 🎯 Thay đổi

Đã đơn giản hóa logic cập nhật app:
- ❌ Không cần `tauri-plugin-updater`
- ❌ Không cần API key/pubkey
- ❌ Không cần file `latest.json`
- ✅ Tải trực tiếp từ GitHub releases
- ✅ Logic giống như cập nhật việt hóa

## 🔄 Quy trình cập nhật mới

### 1. Kiểm tra cập nhật
```rust
pub async fn check_for_updates(&self) -> Result<Option<AppUpdateInfo>, String> {
    // Lấy latest release từ GitHub
    let latest = self.github_service.get_latest_release().await?;
    
    // So sánh version
    if self.is_newer_version(&latest.tag_name) {
        // Tìm file .msi hoặc .exe
        let asset = latest.assets.iter().find(|a| {
            a.name.ends_with(".msi") || a.name.ends_with(".exe")
        })?;

        Ok(Some(AppUpdateInfo {
            version: latest.tag_name,
            current_version: self.current_version,
            download_url: asset.browser_download_url,
            file_size: asset.size,
            changelog: parse_changelog(latest.body),
        }))
    } else {
        Ok(None)
    }
}
```

### 2. Tải và cài đặt
```rust
pub async fn download_and_install(&self, update_info: &AppUpdateInfo) -> Result<PathBuf, String> {
    // 1. Tải installer về temp folder
    let installer_path = temp_dir.join("installer.msi");
    download_file(&update_info.download_url, &installer_path).await?;
    
    // 2. Chạy installer
    if installer_path.ends_with(".msi") {
        Command::new("msiexec")
            .args(&["/i", &installer_path])
            .spawn()?;
    } else {
        Command::new(&installer_path).spawn()?;
    }
    
    // 3. Đóng app hiện tại
    std::process::exit(0);
}
```

## 📦 Cấu trúc GitHub Release

### Release cần có:
```
Tag: v1.0.1
Title: Phiên bản 1.0.1
Body (Changelog):
- Thêm tính năng X
- Sửa lỗi Y
- Cải thiện hiệu suất

Assets:
- priconevh_1.0.1_x64_en-US.msi (Windows installer)
hoặc
- priconevh-setup.exe (Windows installer)
```

### Tên file installer:
- `.msi` - Windows Installer (khuyến nghị)
- `.exe` - Executable installer

## 🎨 UI Flow

### 1. Kiểm tra cập nhật
```typescript
const update = await updaterApi.checkUpdate();

if (update) {
  // Có bản cập nhật mới
  console.log(`Phiên bản mới: ${update.version}`);
  console.log(`Changelog:`, update.changelog);
}
```

### 2. Hiển thị dialog
```
┌─────────────────────────────────────┐
│     🎉 Có bản cập nhật mới!         │
├─────────────────────────────────────┤
│ Phiên bản hiện tại: 1.0.0           │
│ Phiên bản mới: 1.0.1                │
│                                     │
│ Thay đổi:                           │
│ • Thêm tính năng tự động tìm game   │
│ • Sửa lỗi validation                │
│ • Cải thiện UI                      │
│                                     │
│ Kích thước: 45.2 MB                 │
├─────────────────────────────────────┤
│        [Bỏ qua]  [Cập nhật]        │
└─────────────────────────────────────┘
```

### 3. Tải và cài đặt
```typescript
await updaterApi.downloadAndInstall(update);

// Progress events
updaterApi.onProgress((event) => {
  console.log(event.message); // "Đang tải xuống..."
  console.log(event.progress); // 45.5
});
```

### 4. Sau khi tải xong
```
1. Installer tự động chạy
2. App hiện tại đóng
3. Người dùng cài đặt bản mới
4. Mở app mới
```

## 🔧 So sánh Version

### Logic đơn giản:
```rust
fn is_newer_version(&self, new_version: &str) -> bool {
    let current = self.current_version.trim_start_matches('v');
    let new = new_version.trim_start_matches('v');
    
    // So sánh string: "1.0.1" > "1.0.0"
    new > current
}
```

### Ví dụ:
- Current: `v1.0.0` → `1.0.0`
- New: `v1.0.1` → `1.0.1`
- Result: `"1.0.1" > "1.0.0"` = `true` ✓

## 📋 Checklist tạo Release

### 1. Build app
```bash
bun run tauri build
```

### 2. Tìm installer
```
src-tauri/target/release/bundle/msi/priconevh_1.0.1_x64_en-US.msi
```

### 3. Tạo Release trên GitHub
1. Vào: https://github.com/TomiWixoss/priconevh/releases/new
2. Tag: `v1.0.1`
3. Title: `Phiên bản 1.0.1`
4. Body:
   ```markdown
   ## Thay đổi
   - Thêm tính năng tự động tìm game
   - Sửa lỗi validation
   - Cải thiện UI
   
   ## Cài đặt
   Tải file `.msi` và chạy để cài đặt
   ```
5. Upload file `.msi`
6. Publish release

### 4. Test
1. Mở app cũ (v1.0.0)
2. Kiểm tra cập nhật
3. Nhấn "Cập nhật"
4. Chờ tải xuống
5. Installer tự động chạy
6. Cài đặt bản mới

## 🆚 So sánh với cách cũ

### Cách cũ (tauri-plugin-updater):
```
❌ Cần generate keypair
❌ Cần sign installer
❌ Cần tạo file latest.json
❌ Cần config pubkey
❌ Phức tạp, dễ lỗi
```

### Cách mới (Simple):
```
✅ Không cần key
✅ Không cần sign
✅ Không cần latest.json
✅ Chỉ cần upload .msi lên GitHub
✅ Đơn giản, dễ maintain
```

## 🔒 Bảo mật

### Cách cũ:
- Signature verification
- Public key validation
- Secure update channel

### Cách mới:
- GitHub HTTPS (secure)
- Người dùng tự verify installer
- Windows SmartScreen protection

## 🚀 Kết luận

Updater mới:
- ✅ Đơn giản hơn nhiều
- ✅ Không cần config phức tạp
- ✅ Logic giống translation update
- ✅ Dễ maintain và debug
- ✅ Chỉ cần upload .msi lên GitHub

Chỉ cần:
1. Build app
2. Upload .msi lên GitHub release
3. App tự động phát hiện và cập nhật!
