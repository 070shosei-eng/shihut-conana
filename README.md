# 飲食店向けシフト・予約管理WEBアプリ

スマホ利用を最優先に設計した、小規模飲食店向けのシフト管理・予約管理WEBアプリです。Next.js + TypeScript + Tailwind CSS + Firebase Authentication + Firestore を採用し、Vercel にそのままデプロイできます。

## 特徴

- スマホ最適化された iOS 風 UI
- メールログイン / Google ログイン / ログイン状態保持
- 店長 / スタッフの権限制御
- 月間カレンダーの色分けシフト表示
- 曜日固定シフトの自動反映
- スタッフのシフト交代募集 → 他スタッフ承認 → 自動反映
- 予約登録 / 編集 / 削除 / 日別一覧
- Firestore ベースの通知一覧
- Firebase Cloud Messaging 連携用 Push 通知実装

## 技術構成

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firestore Database
- Firebase Cloud Messaging
- firebase-admin
- Vercel

## ディレクトリ構成

```bash
restaurant-shift-app/
├─ app/
│  ├─ api/notify/route.ts
│  ├─ admin/page.tsx
│  ├─ login/page.tsx
│  ├─ reservations/page.tsx
│  ├─ settings/page.tsx
│  ├─ shift/page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ providers.tsx
├─ components/
│  ├─ auth-guard.tsx
│  ├─ bottom-tab-bar.tsx
│  ├─ day-detail-sheet.tsx
│  ├─ home-summary.tsx
│  ├─ manager-panel.tsx
│  ├─ mobile-shell.tsx
│  ├─ month-calendar.tsx
│  ├─ reservation-list.tsx
│  └─ swap-request-card.tsx
├─ hooks/
│  └─ use-dashboard-data.ts
├─ lib/
│  ├─ auth.ts
│  ├─ date.ts
│  ├─ firebase-admin.ts
│  ├─ firebase.ts
│  ├─ firestore.ts
│  └─ notifications.ts
├─ public/
│  ├─ icon-192.png
│  ├─ icon-512.png
│  ├─ manifest.json
│  └─ sw.js
├─ scripts/
│  └─ seed.ts
├─ types/
│  └─ index.ts
├─ .env.example
├─ firestore.indexes.json
├─ firestore.rules
├─ next.config.mjs
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
└─ tsconfig.json
```

## 必要パッケージ

```bash
npm install next react react-dom firebase firebase-admin date-fns clsx lucide-react sonner
npm install -D typescript tailwindcss postcss autoprefixer tsx @types/node @types/react @types/react-dom
```

## Firestore 構成

### users

```ts
{
  authUid: string;
  displayName: string;
  email: string;
  role: 'manager' | 'staff';
  color: string;
  pushTokens: string[];
  notificationEnabled: boolean;
  defaultWeeklyShifts: {
    weekday: number;   // 0=日, 1=月 ... 6=土
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
  }[];
  createdAt: string;
}
```

### staffInvites

```ts
{
  displayName: string;
  email: string;
  color: string;
  role: 'staff';
  createdAt: string;
}
```

### shifts

```ts
{
  date: string;       // yyyy-MM-dd
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  staffId: string;
  staffName: string;
  color: string;
  createdBy: string;
  swapRequestId: string | null;
  history: {
    action: string;
    by: string;
    at: string;
  }[];
}
```

### reservations

```ts
{
  date: string;
  time: string;
  name: string;
  partySize: number;
  course: '宴会' | '貸切' | '一般';
  notes: string;
  createdBy: string;
}
```

### shiftRequests

```ts
{
  shiftId: string;
  date: string;
  requestedById: string;
  requestedByName: string;
  acceptedById?: string;
  acceptedByName?: string;
  status: 'open' | 'accepted' | 'completed';
  message: string;
  createdAt: string;
  completedAt?: string;
}
```

### notifications

```ts
{
  userId: string;
  type: 'shift' | 'swap' | 'reservation';
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}
```

## セットアップ

### 1. Firebase プロジェクト作成

- Authentication を有効化
  - メール / パスワード
  - Google
- Firestore Database を作成
- Cloud Messaging を有効化
- Web アプリを追加

### 2. 環境変数設定

`.env.local` を作成して `.env.example` をコピーしてください。

```bash
cp .env.example .env.local
```

入力する値:

- `NEXT_PUBLIC_FIREBASE_*`: Firebase コンソールの Web アプリ設定
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`: Cloud Messaging の Web Push 証明書キー
- `FIREBASE_ADMIN_*`: Firebase Admin SDK 用サービスアカウント

`FIREBASE_ADMIN_PRIVATE_KEY` は改行を `\n` で入れてください。

### 3. 開発サーバー起動

```bash
npm install
npm run dev
```

### 4. サンプルデータ投入

```bash
npm run seed
```

投入後のログイン例:

- 店長: `manager@example.com / password123`
- スタッフ: `staff.a@example.com / password123`
- スタッフ: `staff.b@example.com / password123`

## Vercel デプロイ手順

1. GitHub に push
2. Vercel で新規プロジェクト作成
3. Repository を選択
4. Environment Variables に `.env.local` と同じ値を登録
5. Build Command: `next build`
6. Output: Next.js default
7. Deploy

### Firebase 側で追加する設定

- Authentication の承認済みドメインに Vercel ドメインを追加
- Firestore Rules を `firestore.rules` で反映
- Firestore Indexes を `firestore.indexes.json` で反映
- Cloud Messaging の Web Push 証明書を設定

## Push 通知について

- フロントで通知許可を取得し、FCM トークンを `users.pushTokens` に保存
- `app/api/notify/route.ts` が firebase-admin を使って Web Push を送信
- 予約追加 / 交代完了などで通知ドキュメントと Push を送信

## 権限仕様

### 店長

- 全スタッフ確認
- スタッフ招待追加
- スタッフ色変更
- 曜日固定シフト設定
- シフト追加 / 削除
- 予約追加 / 編集 / 削除

### スタッフ

- 自分のシフト確認
- 予約確認
- 自分のシフトの交代募集
- 他スタッフの交代募集承認

## サンプルデータ内容

- 店長 1名
- スタッフ 3名
- 本日シフト 2件
- 本日 / 翌日の予約 2件
- 交代募集中 1件
- 曜日固定シフト設定済み

## 補足

- 本実装は小規模飲食店向けの MVP として実用レベルです
- 本番運用時は Firestore Rules をさらに厳密にし、監査ログや営業時間制限、通知対象の最適化を追加してください
