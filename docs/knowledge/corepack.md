# Corepack

Corepack は、Node.js プロジェクトで使うパッケージマネージャーのバージョンを管理するためのツールです。

Yarn や pnpm をプロジェクトごとに直接グローバルインストールするのではなく、`package.json` に指定されたパッケージマネージャーとバージョンを Corepack が読み取り、必要なバージョンを取得して実行します。

## 何を解決するものか

Node.js プロジェクトでは、同じコマンド名でもパッケージマネージャーやバージョンによって挙動が変わることがあります。

例:

- あるプロジェクトは Yarn 4 を使う
- 別のプロジェクトは pnpm 9 を使う
- 開発者ごとにグローバルの Yarn / pnpm バージョンが違う
- CI とローカルで使われるパッケージマネージャーのバージョンが違う

Corepack を使うと、プロジェクトの `package.json` に指定されたバージョンを基準にして、チーム全体で同じパッケージマネージャーを使いやすくなります。

## npm / nvm との違い

Corepack が解決する対象は、`npm` や `nvm` とは異なります。

| ツール     | 主な役割                                           | 管理するもの                                                     |
| ---------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| `nvm`      | Node.js のバージョンを切り替える                   | `node` / Node.js に同梱される `npm`                              |
| `npm`      | npm パッケージのインストール、実行、公開を行う     | `node_modules`、`package-lock.json`、npm registry 上のパッケージ |
| `Corepack` | プロジェクトで使うパッケージマネージャーを解決する | Yarn / pnpm / npm などのパッケージマネージャー本体のバージョン   |

`nvm` は `node --version` を揃えるためのツールです。たとえば `.nvmrc` や `nvm install --lts` によって Node.js のバージョンを合わせられますが、プロジェクトが `yarn@4.4.1` を使うべきか `pnpm@9` を使うべきかまでは解決しません。

`npm` は Node.js に同梱されるパッケージマネージャーです。`npm install -g yarn` や `npm install -g pnpm` で Yarn / pnpm を入れることはできますが、その場合はグローバルに入れたバージョンに依存しやすくなります。プロジェクトごとに `yarn@4.4.1`、`pnpm@9` のようなバージョンを自動で切り替える用途には向きません。

Corepack は、その間に入って `package.json` の `packageManager` を見ます。つまり、`nvm` で Node.js を揃え、Corepack で Yarn / pnpm のバージョンを揃え、実際の依存関係インストールは Yarn / pnpm / npm が行う、という分担です。

## 仕組み

Corepack は `yarn` や `pnpm` などのコマンドに対する shim を用意します。

開発者が次のように実行したとします。

```bash
yarn install
```

Corepack はカレントディレクトリから親ディレクトリへ向かって最も近い `package.json` を探し、`packageManager` フィールドを読み取ります。

```json
{
  "packageManager": "yarn@4.4.1"
}
```

指定されたパッケージマネージャーがサポート対象であれば、Corepack はそのバージョンを必要に応じてダウンロードし、実際の `yarn install` をそのバージョンで実行します。

## 基本的な使い方

### Corepack を有効化する

Node.js 14.19.0 から 24.x までは Corepack が Node.js に同梱されています。ただし、最初から有効化されているとは限らないため、以下を実行します。

```bash
corepack enable
```

これにより、`yarn`、`yarnpkg`、`pnpm`、`pnpx` などの shim が使えるようになります。

Node.js 25 以降では Corepack は Node.js に同梱されません。その場合は npm で Corepack をインストールします。

```bash
npm install -g corepack
corepack enable
```

### プロジェクトで使うパッケージマネージャーを指定する

`package.json` の `packageManager` フィールドで指定します。

```json
{
  "packageManager": "yarn@4.4.1"
}
```

または `corepack use` を使って設定できます。

```bash
corepack use yarn@4.4.1
```

pnpm の例:

```bash
corepack use pnpm@9
```

`corepack use` は、指定したパッケージマネージャーを `package.json` に設定し、インストールも実行します。

### パッケージマネージャーを実行する

通常どおりコマンドを実行します。

```bash
yarn install
yarn start
```

pnpm プロジェクトの場合:

```bash
pnpm install
pnpm dev
```

Corepack が有効で、`packageManager` が設定されていれば、指定されたバージョンの Yarn / pnpm が使われます。

## npm との関係

Corepack は npm も扱えますが、npm は Node.js に別の形で同梱されているため、npm の shim はデフォルトでは有効化されません。

そのため、プロジェクトが Yarn や pnpm を指定していても、`npm install` を直接実行すると Corepack で止められないケースがあります。チームでは、プロジェクトに合ったコマンドを使うことを明示しておく必要があります。

## Backstage での使いどころ

Backstage は Yarn を使うプロジェクトとして作成されます。公式の手順でも、Corepack を有効化したうえで Yarn のバージョンを設定する流れが案内されています。

Backstage アプリを作成・起動する場合の例:

```bash
corepack enable
yarn set version 4.4.1
yarn --version
```

プロジェクトに `packageManager` が設定されていれば、他の開発者や CI でも同じ Yarn バージョンを使いやすくなります。

## 注意点

### 初回実行時にネットワークが必要になる

Corepack は必要な Yarn / pnpm のバージョンをキャッシュしていない場合、初回実行時にネットワークから取得します。

ネットワークにアクセスできない CI、コンテナ、閉域環境では、事前に必要なパッケージマネージャーを準備しておく必要があります。

### グローバルインストール済みの Yarn / pnpm と競合することがある

既に `npm install -g yarn` や `npm install -g pnpm` でインストールしている場合、Corepack の shim と競合することがあります。

Corepack を使う場合は、基本的にグローバルの Yarn / pnpm を直接管理するのではなく、Corepack に任せます。

### 読み取り専用のインストール先では `corepack enable` が失敗することがある

`corepack enable` は Node.js のインストール場所の近くに shim を作成します。その場所が読み取り専用の場合は失敗します。

その場合は、Node.js のインストール方法を見直すか、Corepack 公式 README にあるように shell alias で `corepack yarn` や `corepack pnpm` を呼び出す方法を検討します。

## よく使うコマンド

```bash
# Corepack を有効化する
corepack enable

# プロジェクトで使う Yarn を指定する
corepack use yarn@4.4.1

# プロジェクトで使う pnpm を指定する
corepack use pnpm@9

# Corepack 経由で Yarn を実行する
corepack yarn install

# Corepack 経由で pnpm を実行する
corepack pnpm install

# Corepack のキャッシュを削除する
corepack cache clean
```

## 参考

- [Node.js Corepack documentation](https://nodejs.org/download/release/latest/docs/api/corepack.html)
- [Corepack README](https://github.com/nodejs/corepack)
- [Backstage Standalone Installation](https://backstage.io/docs/next/getting-started/)
