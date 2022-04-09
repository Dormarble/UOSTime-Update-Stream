<p align="center">
  <p align="center"><b>UOSTime API 서버</b></p>
  <p align="center">
    <a href="https://nodejs.org/en" target="_blank"><img src="https://img.shields.io/badge/NodeJS-15.3.0-green.svg" alt="NodeJS Version" /></a>
    <a href="https://yarnpkg.com" target="_blank"><img src="https://img.shields.io/badge/yarn-1.22.10-green.svg" alt="yarn Version" /></a>
    <a href="https://www.npmjs.com/package/inversify-express-utils" target="_blank"><img src="https://img.shields.io/badge/Framework-inversify--express--utils-green.svg" alt="Framework" /></a>
    <a href="https://www.typescriptlang.org/docs" target="_blank"><img src="https://img.shields.io/badge/Language-typescript-blue.svg" alt="Language" /></a>
    <a href="https://www.typescriptlang.org/docs" target="_blank"><img src="https://img.shields.io/badge/Test Deploy-Heroku-puple.svg" alt="Language" /></a>
  </p>
</p>

서울시립대학교 시간표 관리 서비스 - API 서버 (Version 2 / 개발 중)  
현재 서비스 중인 [UOSTime](https://uostime.com)은 Version 1으로, 이 소스코드를 사용하고 있지 않습니다.

## 서비스 구조
<p align="center">
 <img src="https://user-images.githubusercontent.com/48513798/135470608-8e25a35a-8d37-49a2-b271-a424df9208e9.png" width="600" alt="Service Architecture">
</p>

## 설치 및 실행

**docker와 docker-compose가 개발환경 또는 배포환경에 설치되어 있어야 합니다.**

1. UOSTime팀 github에서 소스코드를 클론합니다.  
   `git clone https://github.com/UOSTime/UOSTime-Server.git`

2. 프로젝트 루트 디렉토리로 이동합니다.  
   `cd UOSTime-Server`

3. 프로젝트 루트 디렉토리에 config.env 파일을 추가합니다.  
   `touch ./config.env`

4. config.env 파일에 설정값들을 붙여넣습니다.  
   `cat > ./config.env`

5. 컨테이너들을 실행시킵니다.  
   `docker-compose up` (개발 및 디버깅용 실행 / ts-node)  
   `yarn start` (배포용 실행 / node)
## Code Convention
1. 문자열은 큰따옴표("") 및 back quato(`)만 사용합니다.
2. 문장뒤에 세미콜론(;)은 무조건 붙입니다.
3. 들여쓰기는 Tab으로 통일합니다.
4. 변수, 상수 선언 시 컴파일러가 타입 추론을 하지 못하는 경우를 제외하고는 타입 생략이 가능합니다.
5. 간단한 함수, 상수 또는 model을 제외한 모든 코드들은 클래스로 모듈화시켜야합니다.
6. 불가피한 경우를 제외하고는 any 타입은 지양합니다.
7. 콜백함수는 절대 지양합니다. 불가피한 경우에는 래핑해서 사용합니다.
8. 파일명은 소문자로 시작하는 Camel-Case를 사용합니다.
9. 모든 Service 클래스들은 IoCContainer에 의해 관리되어야 합니다.
10. 성공 시나리오를 제외한 모든 시나리오는 예외 던지기를 통한 예외 처리기에서 처리되어야합니다.

## API
[#Link](https://app.swaggerhub.com/apis/uostime/UOSTime/2.0.0)

## Test 서버(URL)
[#Link](https://uostime2-server.herokuapp.com)
## Redis 정보
`redis-cli`
`info`

### ~~Redis Sentinel 정보 (Deprecated)~~
~~`redis-cli -p **sentinel port**`~~
~~`info sentinel`~~
