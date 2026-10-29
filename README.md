# 🧩 Puzzle Gift — website ghép hình tặng người thương

Một website tĩnh (không cần server, không database): người nhận ghép một bức ảnh thành bức tranh ghép hình thật, có mấu lồi lõm khớp nhau, và nghe nhạc trong lúc chơi.

> **Trạng thái hiện tại (sau Milestone 5):** tất cả các màn hình đã hoàn thành.
> Luồng chơi: **chào mừng → ghép hình → hiệu ứng → phong thư → lá thư** (có Replay và xem lại ảnh).
> Phần "Kiểm thử đã thực hiện" ở mục 8 ghi rõ cái gì đã được thử và cái gì **chưa** thử.

---

## 1. Yêu cầu

- **Node.js 18 trở lên** (tải bản LTS tại https://nodejs.org). Kiểm tra: `node -v`.

## 2. Chạy trên máy

```bash
npm install        # chỉ cần chạy một lần
npm run dev        # mở http://localhost:5173
```

Các lệnh khác:

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy thử khi đang chỉnh sửa (tự cập nhật khi lưu file) |
| `npm run build` | Kiểm tra kiểu TypeScript rồi tạo bản chạy thật trong `dist/` |
| `npm run preview` | Xem thử bản `dist/` ngay trên máy |
| `npm test` | Chạy kiểm tra tự động (hình học mảnh ghép, khớp mảnh, nhạc, chuyển cảnh phong thư/lá thư) |

> Windows báo *"running scripts is disabled"*: dùng Command Prompt, hoặc chạy một lần trong PowerShell `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

---

## 3. Cấu trúc project

```
puzzle-gift/
├── index.html                  # Trang HTML gốc (tiêu đề, thẻ viewport)
├── package.json                # Thư viện và các lệnh npm
├── vite.config.ts              # Cấu hình build (base './' để deploy ở đâu cũng chạy)
├── tsconfig.json               # Cấu hình TypeScript
├── public/                     # File tĩnh, được chép nguyên vào bản build
│   ├── images/                 #   ➜ ĐẶT ẢNH GHÉP HÌNH Ở ĐÂY (sample.svg là ảnh mẫu)
│   └── audio/                  #   ➜ ĐẶT FILE NHẠC Ở ĐÂY (không kèm sẵn nhạc có bản quyền)
├── scripts/
│   └── preview.ts              # Công cụ vẽ thử viền mảnh ghép ra SVG (dành cho dev)
└── src/
    ├── main.tsx                # Điểm khởi động: nạp font, CSS, AudioProvider, App
    ├── App.tsx                 # Điều phối các màn hình: welcome → puzzle → surprise
    ├── config/
    │   └── giftConfig.ts       # ⭐ FILE DUY NHẤT BẠN CẦN SỬA: tên, ảnh, lời thư, nhạc, chữ giao diện
    ├── components/
    │   ├── Welcome.tsx         # Màn hình chào mừng
    │   ├── FloatingHearts.tsx  # Trái tim bay nền
    │   ├── Puzzle.tsx          # Chọn độ khó, đo kích thước màn hình, chọn bố cục
    │   ├── Surprise.tsx        # Màn hình bất ngờ: phong thư → lá thư → xem lại ảnh, nút Replay
    │   ├── surpriseState.ts    # Logic chuyển cảnh của màn hình bất ngờ (thuần, dễ test)
    │   ├── Celebration.tsx     # Tim và confetti bắn ra khi ghép xong
    │   ├── Board.tsx           # Bảng ghép: kéo thả, tiến độ, phát hiện hoàn thành
    │   ├── Piece.tsx           # Một mảnh ghép (SVG: ảnh cắt theo viền mảnh)
    │   └── MusicPlayer.tsx     # Nút nhạc nhỏ ở góc phải
    ├── engine/                 # Lõi ghép hình, thuần TypeScript, không phụ thuộc giao diện
    │   ├── jigsawGeometry.ts   #   Tạo cạnh lồi/lõm và đường viền từng mảnh
    │   ├── layout.ts           #   Bố cục (rải mảnh bên cạnh / khay dưới), vị trí rải, ngưỡng khớp
    │   ├── puzzleState.ts      #   Trạng thái: mảnh nào đã khớp, tiến độ, hoàn thành
    │   └── engine.test.ts      #   Test của lõi
    ├── audio/
    │   ├── AudioProvider.tsx   #   Một trình phát duy nhất dùng chung cho cả trang
    │   ├── playerState.ts      #   Logic bật/tắt, đổi bài, báo lỗi (thuần, dễ test)
    │   └── player.test.ts      #   Test của nhạc
    └── styles/
        ├── tokens.css          # Bảng màu, font, khoảng cách, đổ bóng
        └── app.css             # Kiểu dáng của từng thành phần
```

**Nguyên tắc:** để tạo một món quà mới, bạn chỉ cần thay ảnh và sửa `giftConfig.ts`. Bạn không cần đụng vào `engine/` hay `components/`.

---

## 4. Tuỳ chỉnh từng phần

### 4.1 Đổi ảnh ghép hình
1. Chép ảnh vào `public/images/`, ví dụ `public/images/anh-cua-minh.jpg`.
2. Trong `src/config/giftConfig.ts`:
   ```ts
   image: { src: 'images/anh-cua-minh.jpg', alt: 'Mô tả ảnh' },
   ```
- Đường dẫn **không có dấu `/` ở đầu** và tính từ thư mục `public/`.
- Ảnh ngang hay dọc đều được, số hàng/cột tự điều chỉnh theo tỉ lệ ảnh.
- Nên dùng ảnh **rộng khoảng 1200–2000px**, JPG hoặc WebP, dưới ~1MB để tải nhanh. Ảnh quá lớn làm trang tải chậm và kéo mảnh có thể giật.
- Ảnh rõ chi tiết khắp khung hình sẽ dễ ghép hơn ảnh có nhiều mảng màu giống nhau (bầu trời, tường trơn).
- Ảnh mẫu `sample.svg` có thể xoá khi bạn đã có ảnh của mình.

### 4.2 Đổi tên người nhận và người gửi
```ts
recipientName: 'Linh',
senderName: 'Khang',
```
Ở các đoạn chữ khác, bạn viết `{recipient}` và `{sender}` thì hệ thống tự thay bằng hai tên này.

### 4.3 Chữ chào mừng
```ts
welcome: {
  title: 'A little puzzle for you, {recipient}',
  intro: 'I hid something in this picture. ...',
  startLabel: 'Start the puzzle',
},
```

### 4.4 Lá thư bí mật
```ts
letter: {
  title: 'For {recipient}',
  paragraphs: [            // mỗi chuỗi là một đoạn văn
    'Đoạn thứ nhất...',
    'Đoạn thứ hai...',
  ],
  signature: 'Yours, {sender}',   // có thể bỏ
  date: '',                        // có thể để trống
},
closingMessage: '',                // dòng chữ dưới ảnh hoàn chỉnh (khi bấm "See the photo"), có thể để trống
```
Sau khi ghép xong, người nhận thấy hiệu ứng tim và confetti, rồi đến phong thư. Bấm vào phong thư (hoặc chọn bằng phím Tab rồi nhấn Enter/Space) thì nắp mở ra, lá thư trượt lên và hiện nội dung. Dưới lá thư có hai nút: **Replay** (xem lại hiệu ứng mở thư) và **See the photo** (xem lại bức ảnh đã ghép, có nút quay lại thư). Thư dài sẽ cuộn bên trong tờ giấy. Người bật chế độ *giảm chuyển động* sẽ thấy thư hiện ngay, không có hiệu ứng.

### 4.5 Độ khó mặc định
```ts
defaultDifficulty: 'medium',   // 'easy' = 12 mảnh · 'medium' = 24 · 'hard' = 48
```
Người chơi vẫn đổi được ba mức ngay trên màn hình. Trên điện thoại nên để `easy` hoặc `medium`, vì 48 mảnh khá nhỏ để kéo.

### 4.6 Nhạc
1. Chép file nhạc **bạn có quyền sử dụng** vào `public/audio/`.
2. Khai báo trong `giftConfig.ts`:
   ```ts
   music: {
     enabled: true,
     tracks: [
       { title: 'Ngày xưa em đến', artist: 'Anh Khang', src: 'audio/ngay-xua-em-den.mp3' },
       // thêm bài nữa là nút nhạc tự có ô chọn bài
     ],
   },
   ```
- Đặt `enabled: false` để tắt hoàn toàn nhạc (nút nhạc biến mất).
- Nhạc **không tự phát** khi mở trang. Nó chỉ bắt đầu khi người nhận bấm *Start the puzzle* hoặc bấm nút nhạc, theo quy định của trình duyệt.
- Thiếu file hoặc file lỗi: nút nhạc báo *"Music file not found"*, phần còn lại của trang vẫn chạy bình thường.
- Định dạng nên dùng là **MP3** hoặc **M4A** (chạy tốt trên mọi trình duyệt, kể cả iPhone).
- Project **không kèm** bản ghi âm có bản quyền. Bạn tự chịu trách nhiệm về quyền sử dụng file nhạc bạn thêm vào.
- Rê chuột vào nút nhạc để xem tên bài; trên điện thoại chỉ cần bấm nút để bật/tắt.

### 4.7 Chữ trong giao diện (đổi ngôn ngữ)
Mọi chữ của giao diện nằm trong `ui: { ... }` của `giftConfig.ts` (nhãn độ khó, tiến độ, nút xáo lại, báo lỗi...). Muốn Việt hoá, bạn chỉ cần sửa các chuỗi ở đây. Ví dụ `progress: '{done} / {total} mảnh'`.
Riêng nhãn ngắn *"Music"* dùng cho trình đọc màn hình đang nằm trong `MusicPlayer.tsx`.

### 4.8 Màu sắc và font
- **Màu**: sửa trong `src/styles/tokens.css`:
  ```css
  --ivory: #fff8f3;     /* nền trang */
  --blush: #f9d9d3;     /* hồng nhạt */
  --coral: #d9777f;     /* san hô, thanh tiến độ */
  --coral-ink: #a8434f; /* màu nút chính */
  --ink: #4a2f33;       /* chữ chính */
  ```
- **Font**: đang dùng *Fraunces* (tiêu đề) và *Be Vietnam Pro* (nội dung), cài sẵn trong máy chứ không tải từ web. Muốn đổi, cài font mới bằng `npm i @fontsource/ten-font`, nạp trong `src/main.tsx` rồi sửa `--font-display` / `--font-body` trong `tokens.css`.
- **Tim bay**: số lượng và tốc độ nằm ở mảng `HEARTS` trong `components/FloatingHearts.tsx`.
- Người dùng bật chế độ *giảm chuyển động* trên hệ điều hành thì tim bay và hiệu ứng khớp mảnh tự tắt.

### 4.9 Tinh chỉnh ghép hình (nâng cao)
| Muốn đổi | Sửa ở đâu |
|---|---|
| Độ dễ khớp mảnh (mặc định 30% kích thước ô) | `isSnapped` trong `engine/layout.ts` |
| Hình dáng/kích thước mấu lồi | hàm `tabbed` trong `engine/jigsawGeometry.ts` |
| Số mảnh của từng mức | `COUNTS` trong `components/Puzzle.tsx` |
| Vùng rải mảnh quanh bảng / khay dưới | `GUTTER` và `TRAY` trong `engine/layout.ts` |
| Thời gian xem hiệu ứng trước khi sang phong thư (mặc định 2,6 giây) | `setTimeout(..., 2600)` trong `components/Board.tsx` |
| Số lượng/màu confetti và tim bắn ra | `PIECES`, `HEARTS`, `COLORS` trong `components/Celebration.tsx` |
| Thời gian hiệu ứng mở phong thư (mặc định 1,3 giây) | `setTimeout(..., 1300)` trong `components/Surprise.tsx` và các `transition` của `.env-*` trong `app.css` |
| Màu phong thư | `.env-back`, `.env-front`, `.env-flap` trong `styles/app.css` |

Xem thử hình dạng mảnh ghép: `npx tsx scripts/preview.ts` tạo `/tmp/assembled.svg` và `/tmp/apart.svg` (trên Windows chỉnh đường dẫn trong file trước khi chạy).

---

## 5. Cách ghép hình hoạt động (tóm tắt)

- **Hình dáng:** mỗi cạnh trong của bảng được tạo **một lần** với tọa độ tuyệt đối. Mảnh bên này dùng nó theo chiều xuôi, mảnh bên kia dùng chiều ngược, nên mấu lồi và lõm luôn khớp tuyệt đối. Cạnh ngoài cùng thì thẳng.
- **Hiển thị ảnh:** mỗi mảnh là một SVG chứa toàn bộ ảnh, cắt (`clipPath`) theo đường viền của riêng mảnh đó.
- **Vị trí:** lưu theo đơn vị của bảng (không phải pixel), chỉ đổi sang pixel khi vẽ. Vì vậy đổi kích thước cửa sổ không làm lệch mảnh.
- **Kéo thả:** dùng Pointer Events (chuột, cảm ứng, bút chung một cách xử lý), vùng chơi tắt cuộn trang để kéo không bị trượt.
- **Khớp mảnh:** thả trong ngưỡng gần đúng ô của mình thì mảnh hít vào và khóa. Sai chỗ thì vẫn kéo lại được. Tiến độ chỉ đếm mảnh đã khóa.
- **Hoàn thành:** chỉ khi **mọi** mảnh đã khóa (không dùng bộ đếm giờ hay cú bấm nào khác).

---

## 6. Đưa lên mạng (deploy)

```bash
npm run build
```
Toàn bộ website nằm trong thư mục **`dist/`**. Đường dẫn file là tương đối (`base: './'`), nên chạy được ở gốc tên miền lẫn thư mục con.

### Cách nhanh nhất: Netlify Drop
1. Vào https://app.netlify.com/drop
2. Kéo thả **thư mục `dist`** vào trang. Bạn có link ngay.

### Vercel
- Đẩy code lên GitHub, vào vercel.com → *Add New Project* → chọn repo. Vercel tự nhận Vite: lệnh build `npm run build`, thư mục kết quả `dist`.

### GitHub Pages
1. Đẩy code lên GitHub (repo có `.gitignore` sẵn để bỏ `node_modules` và `dist`).
2. Vào *Settings → Pages → Source: GitHub Actions*.
3. Tạo `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy
   on: { push: { branches: [main] } }
   permissions: { contents: read, pages: write, id-token: write }
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22 }
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with: { path: dist }
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
   Chưa kiểm tra file workflow này trên GitHub; nếu có lỗi, bạn dán thông báo lỗi để chỉnh lại.

### Lưu ý riêng tư
- Ảnh và nhạc nằm trong `dist/` nên **ai có link đều tải về được**. Hãy chỉ gửi link cho đúng người, và nếu muốn thì đặt tên project/link khó đoán.
- Không có mật khẩu hay tài khoản nào trong project này.

---

## 7. Xử lý sự cố

| Hiện tượng | Cách xử lý |
|---|---|
| Vạch đỏ khắp VS Code, báo `Cannot find module 'react'` | Chưa chạy `npm install`. Chạy xong rồi `Ctrl+Shift+P` → *TypeScript: Restart TS Server*. |
| Hiện "The photo could not be loaded" | Sai `image.src` trong `giftConfig.ts` (nhớ không có `/` ở đầu) hoặc ảnh chưa nằm trong `public/images/`. |
| "Music file not found" | File nhạc chưa nằm trong `public/audio/` hoặc tên khác với `src` trong config. |
| Nhạc không phát khi mở trang | Bình thường: trình duyệt chỉ cho phát sau khi người dùng bấm. |
| Sửa config mà trang không đổi | Kiểm tra `npm run dev` còn chạy, và có lỗi đỏ trong terminal không. |
| Kéo mảnh bị giật | Ảnh quá lớn: nén xuống khoảng 1500px; hoặc chọn mức dễ hơn. |
| Sau deploy ảnh/nhạc không hiện | Kiểm tra đường dẫn trong config và rằng file nằm trong `public/` rồi build lại. |

---

## 8. Kiểm thử đã thực hiện (Milestone 5)

**Kiểm thử tự động (`npm test`, 23 bài):** hình học mảnh ghép (cạnh kề nhau khớp tuyệt đối), logic khớp mảnh và hoàn thành, trình phát nhạc, chuyển cảnh phong thư/lá thư.

**Kiểm thử luồng đầy đủ trong trình duyệt Chromium chạy ngầm** (chuột trên màn hình 1280×800, cảm ứng trên màn hình điện thoại 390×844):

| Độ khó | Desktop | Điện thoại |
|---|---|---|
| Easy (12) | 21/21 đạt | 21/21 đạt |
| Medium (24) | 21/21 đạt | 21/21 đạt |
| Hard (48) | 21/21 đạt | 21/21 đạt |

Mỗi lượt kiểm tra: không tràn ngang; thả sai chỗ không được tính; thả đúng chỗ thì tăng tiến độ; ghép đủ mới sang phong thư; nút độ khó bị khóa khi xong; phong thư mở ra; lá thư hiện đúng nội dung cấu hình, vừa khít màn hình; xem ảnh, quay lại thư, Replay; không có lỗi console bất ngờ.

**Chưa kiểm thử (bạn nên tự thử trước khi tặng):**
- Điện thoại thật (đặc biệt iPhone/Safari) và máy tính bảng.
- Ảnh thật của bạn, nhất là ảnh dọc hoặc ảnh vuông. Các lượt kiểm thử dùng ảnh mẫu hình tim (Easy) và một ảnh JPG ngang tự tạo (Medium, Hard).
- Phát nhạc với file âm thanh thật. Mới thử trường hợp thiếu file (báo lỗi nhẹ nhàng, trang vẫn chạy).
- File GitHub Actions ở mục 6 chưa chạy thử trên GitHub.

**Mẹo trước khi gửi quà:** deploy xong, mở link bằng chính điện thoại của người nhận (hoặc loại điện thoại tương tự), ghép một lượt ở mức Easy để xem toàn bộ luồng và nghe thử nhạc.

**Hiệu năng:** mức Hard (48 mảnh) dùng ảnh nhẹ (JPG/WebP khoảng 1500px, dưới 1MB) sẽ mượt hơn nhiều. Ảnh SVG phức tạp hoặc ảnh rất lớn có thể làm kéo mảnh chậm.

## 9. Giấy phép nội dung
Mã nguồn dự án dùng tự do cho mục đích cá nhân. Ảnh và nhạc bạn thêm vào thuộc quyền của chủ sở hữu tương ứng; hãy đảm bảo bạn có quyền sử dụng chúng.
