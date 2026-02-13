# Hướng dẫn cấu hình Auto-Update cho Trình cài đặt

## 1. Tạo keypair cho signing updates

```bash
# Chạy lệnh này để tạo private và public key
bun run tauri signer generate -w ~/.tauri/myapp.key
```

Lệnh này sẽ tạo:
- Private key: `~/.tauri/myapp.key` (GIỮ BÍ MẬT, không commit lên Git)
- Public key: sẽ hiển thị trong terminal

## 2. Cập nhật tauri.conf.json

Mở file `src-tauri/tauri.conf.json` và cập nhật phần `plugins.updater`:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/YOUR_USERNAME/priconevh/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

Thay thế:
- `YOUR_USERNAME` bằng GitHub username của bạn
- `YOUR_PUBLIC_KEY_HERE` bằng public key từ bước 1

## 3. Setup GitHub Actions để tự động build và release

Tạo file `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    strategy:
      fail-fast: false
      matrix:
        platform: [windows-latest]

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies
        run: bun install

      - name: Build and Release
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
        with:
          tagName: v__VERSION__
          releaseName: 'Priconne VN Installer v__VERSION__'
          releaseBody: 'See the assets to download and install this version.'
          releaseDraft: false
          prerelease: false
```

## 4. Thêm Private Key vào GitHub Secrets

1. Đi tới GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `TAURI_PRIVATE_KEY`
4. Value: Nội dung của file `~/.tauri/myapp.key`
5. Click "Add secret"

## 5. Tạo release mới

```bash
# Cập nhật version trong package.json
# Ví dụ: "version": "1.0.1"

# Commit changes
git add .
git commit -m "chore: bump version to 1.0.1"

# Tạo tag
git tag v1.0.1

# Push tag lên GitHub
git push origin v1.0.1
```

GitHub Actions sẽ tự động:
- Build ứng dụng cho Windows
- Tạo file `.msi` installer
- Sign update với private key
- Tạo file `latest.json` với thông tin update
- Upload tất cả lên GitHub Release

## 6. Cấu trúc file latest.json

File này được tạo tự động, có dạng:

```json
{
  "version": "1.0.1",
  "notes": "Release notes here",
  "pub_date": "2024-02-13T10:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "...",
      "url": "https://github.com/YOUR_USERNAME/priconevh/releases/download/v1.0.1/priconevh_1.0.1_x64_en-US.msi.zip"
    }
  }
}
```

## 7. Test Auto-Update

Trong ứng dụng:

```typescript
import { updaterApi } from '@/lib/api';

// Kiểm tra update
const updateInfo = await updaterApi.checkUpdate();
if (updateInfo) {
  console.log('New version available:', updateInfo.version);
  
  // Download và install
  await updaterApi.downloadAndInstall();
}

// Listen progress
updaterApi.onProgress((progress) => {
  console.log('Download progress:', progress);
});

updaterApi.onCompleted(() => {
  console.log('Update completed! App will restart.');
});
```

## 8. Auto-check on startup

Trong `src/App.tsx`:

```typescript
useEffect(() => {
  const checkForUpdates = async () => {
    const config = await configApi.load();
    
    if (config.check_update_on_startup) {
      const update = await updaterApi.checkUpdate();
      if (update) {
        // Show update dialog
      }
    }
  };
  
  checkForUpdates();
}, []);
```

## Lưu ý quan trọng

1. **Private key phải được giữ bí mật** - Không commit vào Git
2. **Public key** phải khớp với private key đã dùng để sign
3. Mỗi release phải có **version mới** (cao hơn version hiện tại)
4. File `latest.json` phải có trong GitHub Release
5. Update chỉ hoạt động với **production build** (không hoạt động trong dev mode)

## Troubleshooting

### Lỗi "Invalid signature"
- Kiểm tra public key trong `tauri.conf.json` có đúng không
- Đảm bảo private key trong GitHub Secrets khớp với public key

### Lỗi "No update available"
- Kiểm tra version trong `package.json` đã tăng chưa
- Kiểm tra URL endpoint trong `tauri.conf.json` có đúng không
- Kiểm tra file `latest.json` có tồn tại trong release không

### Update không tự động
- Kiểm tra `check_update_on_startup` trong config
- Kiểm tra network connection
- Xem logs trong DevTools console
