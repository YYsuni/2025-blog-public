我想在项目加入一个 ts 文件，文件包含每个 commit 最新的信息，这样可以：

- 辅助版本控制
- 配合页面刷新机制
- bug 跟踪记录
- 检测 bot 对页面不同版本的扫描情况

第一个想到 husky 可以方便的写入一个 pre-commit

```
GIT_HASH=$(git rev-parse HEAD)

echo "export const currentGitHash = '$GIT_HASH';" > src/gitHash.ts
```

把 git hash 存入 ts 文件。这里会有两个问题，一个是文件只能是 commit 生成之后出现一个新的 file change，另一个问题是 hash 不是最新的 hash。

## 同时存入 commit

通过 AI 提示，可以设置 post-commit 然后继续 `git add` + `git commit --amend --no-edit`。但是这里会有 2 个坑，一个是 amend 之后的 hash 不是我们存的 hash，因为 hash 是一个文件集合，文件改动一定会生成新的 hash。所以不可能存入最新 hash。

第二个坑是，post-commit 会无限循环，会崩溃 git 程序，如果发生一次，会影响整个 git 树。所以写入的时候需要加一段 if 逻辑，并且指定一个动态的且固定的值，保证当前 amend 逻辑只会发生一次。

> 如果发生一次无限循环崩溃，请一定要 drop 掉这个 commit ，不然后续会产生影响。

## 新办法

基于上面问题，所以存入 commit 信息的时候，不能存最新 hash，可以存入 commit 的 msg 然后加一个真实的时间戳。

post-commit 的逻辑要加入单词判定逻辑，这里已时间戳判定就行，当前的时间戳与记录的时间戳相差小于 5 秒就行。

hash 也可以存一个 前 hash，用来辅助快速精准定位。

## 加密

文件放入项目，git msg 也算是敏感信息，可以加密处理。

但这里又有一个坑，openssl enc 的加密，很难用 js 的 crypt-js 顺利的解析出来。所以解析的时候最好用 openssl enc -d 同样地解析出来，不然就得花心思去 js 解密。

./husky/pre-commit code

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

COMMIT_MSG=$(git log -1 --pretty=format:%B)
ENCRYPTED_COMMIT_MSG=$(echo -n "$COMMIT_MSG" | openssl enc -aes-256-cbc -a -pass pass:xxx)

COMMIT_TIMESTAMP=$(date +%s)

PREV_HASH=$(git rev-parse HEAD)


if [ -z "$ENCRYPTED_COMMIT_MSG" ]; then
  echo "ENCRYPT FAIL"
  exit 1
fi


if [ -f .git/no-post-commit ]; then
  PREVIOUS_TIMESTAMP=$(cat .git/no-post-commit)


  TIMESTAMP_DIFF=$((COMMIT_TIMESTAMP - PREVIOUS_TIMESTAMP))

  TIMESTAMP_DIFF=${TIMESTAMP_DIFF#-}


  if [ "$TIMESTAMP_DIFF" -le 5 ]; then
    echo "Skipping update since it's the same commit."
    exit 0
  fi
fi

echo "export const COMMIT_MSG = '$ENCRYPTED_COMMIT_MSG'" > src/commit-info.ts
echo "export const COMMIT_TIMESTAMP = $COMMIT_TIMESTAMP" >> src/commit-info.ts
echo "export const PREV_HASH = '$PREV_HASH'" >> src/commit-info.ts

echo "$COMMIT_TIMESTAMP" > .git/no-post-commit

git add src/commit-info.ts
git commit --amend --no-edit
```

快捷的解密命令：

```sh
echo 'U2FsdGVkX1xxxxxxxxxxxxxxxx'| openssl enc -aes-256-cbc -d -a -pass pass:xxx
```

> 我或许该使用 `-pbkdf2` 的？