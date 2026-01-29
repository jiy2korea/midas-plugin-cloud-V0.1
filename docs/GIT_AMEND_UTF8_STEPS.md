# 커밋 메시지 UTF-8 수정 후 force push (수동 절차)

`.git/index.lock` 때문에 자동 amend가 실패한 경우, 아래를 **Cursor를 완전히 종료한 뒤** 또는 **lock 파일이 없는 상태에서** 실행하세요.

## 1. lock 제거 (있는 경우만)

```powershell
cd "c:\Besto Designer\Midas Plugin Cloud V0.1"
Remove-Item -Force ".git\index.lock" -ErrorAction SilentlyContinue
```

## 2. UTF-8 메시지로 amend 후 force push

```powershell
git commit --amend -F commit_msg_utf8.txt
git push --force
```

`commit_msg_utf8.txt` 내용: `chore: 테스트 폴더 및 테스트.md 추가`

## 3. 완료 후

- `commit_msg_utf8.txt`는 .gitignore에 있으므로 커밋되지 않음. 필요 없으면 삭제해도 됨.
