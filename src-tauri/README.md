# Priconne VN Installer - Rust Backend

## Kiến trúc dự án

Dự án được tổ chức theo Clean Architecture với các layer rõ ràng:

```
src-tauri/src/
├── models/              # Domain models & data structures
│   ├── game_info.rs     # Game information model
│   ├── translation_pack.rs  # Translation pack models
│   └── app_config.rs    # Application configuration
│
├── services/            # Business logic layer
│   ├── game_service.rs  # Game detection & validation
│   ├── github_service.rs    # GitHub API integration
│   ├── download_service.rs  # File download with progress
│   ├── file_service.rs      # File operations (zip, copy, etc)
│   └── translation_service.rs   # Translation installation logic
│
├── commands/            # Tauri command handlers (API layer)
│   ├── game_commands.rs     # Game-related commands
│   ├── translation_commands.rs  # Translation commands
│   ├── config_commands.rs   # Configuration commands
│   └── system_commands.rs   # System utilities
│
└── lib.rs              # Application entry point
```

## Các tính năng chính

### 1. Game Detection
- Tự động tìm thư mục game trong các vị trí phổ biến
- Tìm kiếm trong Windows Registry (Steam, DMM)
- Validate game directory với các file cần thiết

### 2. Translation Management
- Tải bản việt hóa từ GitHub Releases
- Cài đặt với progress tracking
- Cập nhật tự động
- **Backup thông minh**: CHỈ backup files việt hóa cũ (localization, translations), KHÔNG backup toàn bộ game
- Gỡ bỏ bản việt hóa
- Restore từ backup nếu cần

### 3. GitHub Integration
- Lấy danh sách releases
- Kiểm tra phiên bản mới
- Download assets từ releases

### 4. File Operations
- Extract ZIP files
- Copy directories recursively
- Create backups
- Check disk space
- Calculate directory size

### 5. Configuration
- Lưu/load cấu hình
- Auto-update settings
- Auto-start on boot
- Custom GitHub repository

### 6. App Auto-Update
- Kiểm tra phiên bản mới của trình cài đặt
- Tự động tải và cài đặt update
- Progress tracking
- Signed updates với keypair

## Backup Strategy

**QUAN TRỌNG**: Ứng dụng CHỈ backup các files liên quan đến việt hóa, KHÔNG backup toàn bộ game để tránh tốn dung lượng.

### Files được backup:
- `localization/` - Thư mục chứa file ngôn ngữ
- `translations/` - Thư mục chứa bản dịch
- `translation.dat` - File data việt hóa
- `strings.json` - File strings
- `translation_info.json` - Metadata

### Vị trí backup:
`{game_directory}/translation_backup/`

### Kích thước:
Thường chỉ vài MB thay vì hàng chục GB nếu backup cả game.

## API Commands

### Game Commands
```rust
auto_detect_game() -> Option<String>
validate_game_path(path: String) -> GameInfo
get_game_info(path: String) -> GameInfo
```

### Translation Commands
```rust
get_available_translations() -> TranslationPack
check_translation_updates(current_version: String) -> Option<TranslationVersion>
install_translation(game_path: String, version: TranslationVersion) -> ()
update_translation(game_path: String, new_version: TranslationVersion) -> ()
uninstall_translation(game_path: String) -> ()
get_translation_info(game_path: String) -> Option<TranslationInfo>
```

### Config Commands
```rust
load_config() -> AppConfig
save_config(config: AppConfig) -> ()
update_game_path(path: String) -> ()
toggle_auto_update(enabled: bool) -> ()
toggle_auto_start(enabled: bool) -> ()
set_github_repo(repo: String) -> ()
```

### System Commands
```rust
get_disk_space(path: String) -> (u64, u64)
check_disk_space(path: String, required_bytes: u64) -> bool
get_directory_size(path: String) -> u64
open_directory(path: String) -> ()
create_backup(source_path: String, backup_name: String) -> String
```

### Updater Commands
```rust
check_app_update() -> Option<AppUpdateInfo>
download_and_install_update() -> ()
```

## Events

### Progress Events
```typescript
// Listen to translation progress
listen("translation-progress", (event) => {
  const [message, progress] = event.payload;
  // message: string, progress: 0-100
});

// Listen to updater progress
listen("updater-progress", (event) => {
  const progress = event.payload; // 0-100
});

// Listen to updater completed
listen("updater-completed", () => {
  // Update completed, app will restart
});
```

## Design Patterns

### 1. Service Layer Pattern
Tất cả business logic được đóng gói trong services, tách biệt khỏi commands layer.

### 2. Repository Pattern
Models chứa data structures và basic validation, không có business logic.

### 3. Command Pattern
Commands layer chỉ là thin wrapper, delegate tất cả logic cho services.

### 4. Dependency Injection
Services được inject vào commands thông qua Tauri State management.

### 5. Error Handling
Tất cả functions trả về `Result<T, String>` để handle errors một cách consistent.

## Cách mở rộng

### Thêm service mới
1. Tạo file trong `services/`
2. Implement business logic
3. Export trong `services/mod.rs`

### Thêm command mới
1. Tạo function trong `commands/`
2. Thêm `#[tauri::command]` attribute
3. Register trong `lib.rs` `invoke_handler`

### Thêm model mới
1. Tạo struct trong `models/`
2. Derive `Serialize`, `Deserialize`
3. Export trong `models/mod.rs`

## Testing

```bash
# Run tests
cargo test

# Run with logging
RUST_LOG=debug cargo test

# Test specific module
cargo test services::game_service
```

## Build

```bash
# Development build
cargo build

# Release build
cargo build --release

# Build with Tauri
bun run tauri build
```
