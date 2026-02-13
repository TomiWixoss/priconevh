# Hướng dẫn tạo GitHub Release cho bản việt hóa

## Cấu trúc đã được cấu hình

- **GitHub Repository**: `TomiWixoss/priconevh`
- **Tên file release**: `PriconneTL_YYYYMMDD-VH.zip` (ví dụ: `PriconneTL_20260211-VH.zip`)
- **Tag version**: Theo format `vX.Y.Z` hoặc `YYYYMMDD` (ví dụ: `v1.0.0` hoặc `20260211`)

## Cấu trúc file ZIP

File ZIP cần chứa cấu trúc thư mục như sau:

```
PriconneTL_20260211-VH.zip
├── BepInEx/
│   ├── config/
│   │   ├── AutoTranslatorConfig.ini
│   │   └── BepInEx.cfg
│   ├── core/
│   │   └── (các DLL files)
│   ├── interop/
│   │   └── (các DLL files)
│   ├── patchers/
│   │   └── (các DLL files)
│   ├── plugins/
│   │   ├── XUnity.AutoTranslator/
│   │   ├── XUnity.ResourceRedirector/
│   │   └── (các plugin files)
│   └── Translation/
│       └── en/
│           ├── Font/
│           ├── Other/
│           ├── Proxy/
│           ├── Text/
│           └── Texture/
├── dotnet/
│   └── (các file .NET runtime)
├── .doorstop_version
├── changelog.txt
├── doorstop_config.ini
└── dxgi.dll
```

## Các bước tạo Release trên GitHub

### 1. Chuẩn bị file ZIP

```bash
# Từ thư mục chứa bản việt hóa
cd "C:\Users\tomis\Docs\priconevh"

# Nén thư mục thành file ZIP (dùng 7-Zip hoặc WinRAR)
# Đảm bảo tên file theo format: PriconneTL_YYYYMMDD-VH.zip
```

### 2. Tạo Release trên GitHub

1. Truy cập: https://github.com/TomiWixoss/priconevh/releases/new

2. Điền thông tin:
   - **Tag version**: `20260211` hoặc `v1.0.0`
   - **Release title**: `Bản việt hóa Princess Connect Re:Dive - 11/02/2026`
   - **Description** (Changelog):
     ```markdown
     ## Thay đổi trong phiên bản này
     
     - Cập nhật bản dịch mới nhất
     - Sửa lỗi hiển thị font
     - Thêm dịch cho sự kiện mới
     - Tối ưu hiệu suất
     
     ## Cài đặt
     
     1. Tải file `PriconneTL_20260211-VH.zip`
     2. Giải nén vào thư mục game
     3. Chạy game và tận hưởng
     ```

3. Upload file ZIP:
   - Kéo thả file `PriconneTL_20260211-VH.zip` vào phần **Attach binaries**

4. Nhấn **Publish release**

## Cách app tự động tải về

Khi bạn tạo release, app sẽ:

1. **Tự động phát hiện**: Kết nối đến GitHub API và lấy danh sách releases
2. **Hiển thị phiên bản**: Liệt kê tất cả phiên bản có sẵn với changelog
3. **Tải xuống**: Khi người dùng chọn cài đặt:
   - Tải file ZIP về thư mục temp
   - Giải nén
   - Backup bản cũ (nếu có) vào `translation_backup/`
   - Xóa files cũ: `BepInEx/`, `dotnet/`, `.doorstop_version`, `doorstop_config.ini`, `dxgi.dll`
   - Copy files mới vào thư mục game
   - Tạo file `translation_info.json` để lưu thông tin phiên bản

## Kiểm tra cập nhật

App sẽ tự động kiểm tra cập nhật bằng cách:
- So sánh version hiện tại với latest release trên GitHub
- Thông báo nếu có phiên bản mới
- Cho phép người dùng cập nhật với 1 click

## Lưu ý quan trọng

1. **Tên file ZIP**: Phải chứa `PriconneTL` và kết thúc bằng `.zip`
2. **Cấu trúc thư mục**: Phải giữ đúng cấu trúc như trên
3. **Changelog**: Nên viết rõ ràng để người dùng biết có gì mới
4. **Tag version**: Nên dùng format nhất quán (khuyến nghị: `YYYYMMDD`)

## Ví dụ Release

**Tag**: `20260211`  
**Title**: `Bản việt hóa Princess Connect Re:Dive - 11/02/2026`  
**File**: `PriconneTL_20260211-VH.zip`  
**Changelog**:
```
- Cập nhật bản dịch event Valentine 2026
- Sửa lỗi font tiếng Việt trong menu
- Thêm dịch cho 5 nhân vật mới
- Tối ưu tốc độ load game
```
