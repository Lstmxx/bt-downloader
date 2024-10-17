# bt-downloader

一个基于webtorrent的磁力链下载器

![bt-downloader](https://raw.githubusercontent.com/Lstmxx/picx-images-hosting/refs/heads/master/20240930/image.7p9k40yvq.png)

## 技术栈

- 框架：electron + vite + Vue3 + Typescript
- 前端持久化 pinia
- 磁力链下载：webtorrent
- UI：TailwindCSS PrimeVue
- 数据库: better-sqlite3
- orm: Typeorm
- 配置保存：electron-store

## 开发

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
