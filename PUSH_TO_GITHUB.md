# GitHub 푸시 안내 (midas-plugin-cloud-V0.1)

**저장소:** https://github.com/jiy2korea/midas-plugin-cloud-V0.1

IDE에서 Git이 잠금 파일(`.git/index.lock`)을 잡고 있으면 아래 명령이 실패할 수 있습니다.  
**PowerShell 또는 cmd를 새로 열고** 프로젝트 폴더로 이동한 뒤 순서대로 실행하세요.

---

## 1. 리포지토리 생성 (최초 1회)

GitHub에 로그인된 상태에서:

```powershell
cd "c:\Besto Designer\Midas Plugin Cloud V0.1"

# 잠금 파일 제거 (에러 시 수동으로 .git\index.lock 삭제)
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue

# .cursor는 제외하고 커밋 (.cursor/skills 중첩 저장소 이슈 방지)
git rm -r --cached .cursor -f 2>$null
git add .
git status

# 커밋
git commit -m "chore: initial commit - MIDAS Plugin Cloud V0.1 (Phase 1.1-1.3)"

# GitHub에 리포 생성 + 원격 추가 + 푸시 (한 번에)
gh repo create midas-plugin-cloud-V0.1 --public --source=. --remote=origin --push
```

`gh`가 로그인되어 있지 않으면 `gh auth login` 후 다시 시도하세요.

---

## 2. 이미 리포를 만들어 둔 경우

```powershell
cd "c:\Besto Designer\Midas Plugin Cloud V0.1"
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue
git rm -r --cached .cursor -f 2>$null
git add .
git commit -m "chore: initial commit - MIDAS Plugin Cloud V0.1 (Phase 1.1-1.3)"
git remote add origin https://github.com/jiy2korea/midas-plugin-cloud-V0.1.git
git branch -M main
git push -u origin main
```

---

## 3. 정리

- `.gitignore`에 `__pycache__`, `.venv`, `.cursor` 등이 포함되어 있습니다.
- `.cursor` 폴더는 푸시하지 않습니다(로컬 스킬/설정용).

완료 후: https://github.com/jiy2korea/midas-plugin-cloud-V0.1 에서 코드를 확인할 수 있습니다.
