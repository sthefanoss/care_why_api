git stash && git checkout 5bfcba09f12334983420e29a8953cd9967776d42
zip -r src.zip src
shasum -a 512 src.zip
git switch -