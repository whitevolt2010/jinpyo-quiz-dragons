# 진표·진서의 어휘 용사 (QUIZ & DRAGONS)

1992년 캡콤 오락실 게임 "퀴즈 앤 드래곤즈" 방식의 국어·영어 어휘 퀴즈 게임.
주사위로 말판을 이동 → 몬스터 칸에서 4지선다 퀴즈 → 맞히면 보석이 켜지며 공격, 틀리면 하트 −1 → 스테이지 끝 보스전.

- 진표(7살): 스테이지 1~6 = 초1~초6 어휘, 7 = 초4~6 최종. 국어(가)·영어(A) 칸.
- 진서(5살): 그림 보고 소리 듣고 고르는 그림 퀴즈(모든 문제를 녹음 목소리로 읽어 줌).
- 용사 4명: 전사(하트+1·승리 시 회복) / 마법사(가끔 문제 종류 선택) / 아마존(가끔 틀린 보기 제거) / 닌자(가끔 보석 2배).

## 고치는 법
- 코드: `src/head.html`(화면·CSS), `src/game.js`(게임), 문제 자료 `src/ko_vocab.js`(초1~6 국어 382문제), `src/ko_old.js`(국어 대결 게임의 문제 생성기), `src/en_data.js`(영어 낱말·문장·대화).
- `python3 build.py` → `index.html` 생성.
- 문제 자동 검사: `node test_q.js`
- 녹음 목소리: `node voice_list.js && python3 make_voice.py` (macOS say: 유나·Samantha)
- 그림·효과음·음악: GPT 아스트라(Codex)가 제작 — `assets/ASTRA_REPORT.md`, 요청서 `assets/ASSETS_REQUEST.md`.
- 시험: `index.html?fast` 로 열면 연출이 50배 빨라짐.
