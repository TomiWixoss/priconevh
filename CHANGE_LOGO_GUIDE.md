# Hướng dẫn đổi Logo/Icon cho App

## Các file icon cần thay thế

Bạn cần chuẩn bị logo của mình và tạo các kích thước sau:

### 1. Icon cho Windows
- `src-tauri/icons/icon.ico` - File ICO chứa nhiều kích thước (16x16, 32x32, 48x48, 256x256)
- `src-tauri/icons/32x32.png` - Icon 32x32 pixels
- `src-tauri/icons/128x128.png` - Icon 128x128 pixels
- `src-tauri/icons/128x128@2x.png` - Icon 256x256 pixels (cho màn hình Retina)

### 2. Icon cho macOS
- `src-tauri/icons/icon.icns` - File ICNS cho macOS

### 3. Icon cho Windows Store (nếu cần)
- `src-tauri/icons/Square30x30Logo.png` - 30x30
- `src-tauri/icons/Square44x44Logo.png` - 44x44
- `src-tauri/icons/Square71x71Logo.png` - 71x71
- `src-tauri/icons/Square89x89Logo.png` - 89x89
- `src-tauri/icons/Square107x107Logo.png` - 107x107
- `src-tauri/icons/Square142x142Logo.png` - 142x142
- `src-tauri/icons/Square150x150Logo.png` - 150x150
- `src-tauri/icons/Square284x284Logo.png` - 284x284
- `src-tauri/icons/Square310x310Logo.png` - 310x310
- `src-tauri/icons/StoreLogo.png` - 50x50

## Cách tạo icon từ logo gốc

### Phương pháp 1: Sử dụng Tauri Icon Generator (Khuyến nghị)

1. Chuẩn bị logo gốc:
   - Kích thước tối thiểu: 1024x1024 pixels
   - Format: PNG với nền trong suốt
   - Đặt tên: `app-icon.png`

2. Cài đặt Tauri CLI (nếu chưa có):
```bash
cargo install tauri-cli
```

3. Tạo tất cả icon tự động:
```bash
# Từ thư mục gốc của project
cargo tauri icon "C:\Users\tomis\Downloads\logo.png"
```

Lệnh này sẽ tự động tạo tất cả các kích thước icon cần thiết trong `src-tauri/icons/`

### Phương pháp 2: Sử dụng Online Tools

**Tạo ICO file:**
- https://www.icoconverter.com/
- Upload PNG, chọn kích thước: 16, 32, 48, 256
- Download file `.ico`

**Tạo ICNS file (cho macOS):**
- https://cloudconvert.com/png-to-icns
- Upload PNG 1024x1024
- Convert và download

**Resize PNG:**
- https://www.iloveimg.com/resize-image
- Tạo các kích thước cần thiết

### Phương pháp 3: Sử dụng Photoshop/GIMP

1. Mở logo gốc
2. Resize về từng kích thước cần thiết
3. Export as PNG với nền trong suốt
4. Dùng tool online để tạo ICO và ICNS

## Sau khi thay icon

1. **Xóa cache build:**
```bash
# Xóa thư mục target
rm -rf src-tauri/target

# Hoặc trên Windows
rmdir /s /q src-tauri\target
```

2. **Build lại app:**
```bash
bun run tauri build
```

3. **Test icon:**
   - Icon sẽ hiển thị trên taskbar khi chạy app
   - Icon sẽ hiển thị trong file explorer
   - Icon sẽ hiển thị khi cài đặt app

## Lưu ý quan trọng

1. **Chất lượng logo:**
   - Nên dùng vector (SVG) rồi export ra PNG
   - Đảm bảo logo rõ nét ở kích thước nhỏ (32x32)
   - Nền trong suốt để đẹp trên mọi background

2. **Màu sắc:**
   - Logo nên có viền hoặc shadow để nổi bật trên nền sáng/tối
   - Tránh dùng màu quá nhạt

3. **Rebuild:**
   - Sau khi đổi icon, PHẢI build lại app
   - Dev mode có thể không hiển thị icon mới ngay

## Ví dụ với logo Princess Connect

Nếu bạn có logo Princess Connect:

1. Tìm logo PNG chất lượng cao (1024x1024)
2. Chạy lệnh:
```bash
cargo tauri icon princess-connect-logo.png
```

3. Xóa cache và build:
```bash
rmdir /s /q src-tauri\target
bun run tauri build
```

4. Icon mới sẽ xuất hiện trong file `.exe` sau khi build

## Troubleshooting

**Icon không đổi sau khi build:**
- Xóa hoàn toàn thư mục `src-tauri/target`
- Xóa file build cũ trong `src-tauri/target/release`
- Build lại từ đầu

**Icon bị vỡ/mờ:**
- Kiểm tra logo gốc có đủ độ phân giải không
- Đảm bảo export PNG với quality 100%
- Thử tạo lại icon với logo chất lượng cao hơn

**Icon không hiển thị trong Windows:**
- Xóa icon cache của Windows:
```bash
ie4uinit.exe -show
```
- Restart Windows Explorer
