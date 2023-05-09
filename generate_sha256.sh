git stash && git checkout 5bfcba09f12334983420e29a8953cd9967776d42
zip -r src.zip src
shasum 256 src.zip 
rm src.zip
