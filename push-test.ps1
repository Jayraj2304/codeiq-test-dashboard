git checkout -b feat/test-push
echo "test" > test.txt
git add test.txt
git commit -m "Test push"
git push -u origin HEAD
