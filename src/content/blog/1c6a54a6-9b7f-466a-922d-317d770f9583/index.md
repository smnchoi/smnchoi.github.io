---
uuid: 1c6a54a6-9b7f-466a-922d-317d770f9583
date created: 2024-06-07 23:35
date updated: 2024-06-17 22:43

title: "EAS Build - Android 편"
description: "야 너두 EAS 할 수 있어"
date: "2024-06-17"
---

#RN #expo

## TL;TR

`expo eject` 한 프로젝트가 아니라면, 그냥 [Expo EAS 공식문서](https://docs.expo.dev/build/introduction/) 따라하면 된다.

나처럼 `eas prebuild` 라는 커맨드가 존재하기 이전, `expo-dev-client` 같은 게 없었던 시절에 프로젝트를 시작해서, _당시 Expo 의 한계때문에 눈물을 머금고 `expo eject` 한 프로젝트에서_ EAS Build 와 EAS Submit 를 구현하고 있는 이들에게 도움이 될 만한 글이다.

---

## EAS 프로젝트 셋업

### `eas login`

- EAS username 과 password 를 입력한다.
- 없으면 expo.dev 홈페이지에서 계정 하나 만드셈.

### `eas init`

- (기존에 연결한 프로젝트가 없다면)
- EAS 프로젝트를 생성하고, 연결한다.
- `eas.json` 파일이 자동으로 생성된다. 이 파일에는 연결된 프로젝트의 정보, 소유 계정에 대한 정보가 담겨있다. 없으면 `eas build` 자체를 못 함.

### `eas build:configure`

- 안드로이드 업로드키(`*.keystore` 파일)를 EAS 프로젝트에 등록한다.
- 이 키는 Release 빌드를 생성할 때 사용된다. 즉, 이미 Google Play Store 에 제출한 키가 있다면 **반드시** 그 키를 사용해야 한다.

## EAS Build: 안드로이드 빌드 (CI)

### ~~`app.json` -> `app.config.js`~~ (필요없게 됨)

app.json 에 "expo.extra.eas" 프로퍼티를 이용하면, Expo 또는 EAS 서비스에 작용하는 여러가지 설정을 조작할 수 있다.

```json
// app.json
{
 ...
  "expo": {
	...
    "extra": {
	      "eas": {
	        // 여기서 조작 가능
	      }
    }
  }
}
```

process.env 와 같은 객체를 사용하는 "동적 세팅"이 필요한 순간이 있다. EAS Secrets 의 환경변수들을 사용할 때가 바로 그렇다. 당연히, json 파일로는 동적 할당을 구현할 수 없고, 대신 js 파일을 사용해야 한다. 이를 위해서, app.json 파일을 app.config.js 파일로 변환한다. 파일 포맷이 다르더라도, 작성해야 할 코드의 구조는 매우 비슷하다. (역시, 괜히 json 이 js object notation 이 아니다.)

> 참고: <https://docs.expo.dev/versions/latest/config/app/#googleservicesfile-1>

하지만 나는 후술할 사유로 인해, process.env 객체에 제대로 접근 할 수 없었다.
즉, 난 app.json 으로 진행했다.

### EAS Secrets

실제 상용 앱은 당연하게도 `.gitignore` 에 포함시켜야만 하는 파일들이 많다.

이번편은 안드로이드 빌드만 다루고 있으므로, 아마 가장 많은 사람들이 사용하고 있을, `google-services.json` 파일도 당연히 포함되어 있다.

eas build 가 진행되는 동안 프로젝트의 코드는 eas 클라우드 환경으로 clone 된다. 이 때, 당연히 `.gitignore` 에 수록된 파일들은 무시된다. 이것은 "파일을 찾을 수 없다"며, 안드로이드 빌드 실패를 야기한다.

```shell
ERROR
... 후술
```

이를 해결하기 위해, Expo 공식문서에서 아~주 친절하게 EAS Secrets 을 사용하라고 안내하고 있다. 일종의 환경변수 인데, Github Actions 를 사용해 본 이들은 이미 익숙한 개념일 것이다.

그런데, EAS Secrets 은 "값"뿐만 아니라 "파일"도 지원한다! 그냥 파일 자체를 업로드하면, 해당 파일의 경로를 암호화하고, eas 가 경로를 해석함으로써 파일 그 자체를 마치 환경변수 처럼 쓸 수 있다.

하지만...

### expo ejected 프로젝트의 한계 😢

`expo eject` 한 프로젝트는 android 와 ios 폴더가 생성된다. 말 그대로 eject. 더 이상 Expo 의 울타리에서 편하게 쉴 수 없고, 내가 직접 Java 와 Objective C 로 쓰여진 네이티브 코드들을 직시해야 한다. 이 폴더들은 영구히 남아있게 된다. 우리 프로젝트가 eject 를 결심했을 당시에는, Expo 미지원 라이브러리를 사용하기 위해서는 eject 외에는 방법이 없었다. 정말 피하고 싶었지만, 안타깝게도 해당 라이브러리는 우리 앱의 핵심기능 구현을 위한 써드파티 앱의 SDK 이였기 때문에, 피할 방법이 없었다.

그 후 수개월 동안 우리는 android, ios 폴더 안에 있는 수 많은 네이티브 파일들에에F 수정사항을 덧씌었다. 어떤 건 라이브러리 세팅을 위해서, 어떤 건 빌드 이슈를 해결하기 위해서, 또 어떤건 RN 버전을 업그레이드 하기 위해서.

그리고 eas prebuild 가 세상 밖으로 나왔다. eas prebuild 는 Expo 의 가능성을 무궁무진하게 만들어준 환상적인 도구 였지만, 이것을 우리 환경에서 실행하면 이미 기존에 존재하는 android, ios 폴더와 충돌하기 때문에, 우리에게는 무용지물 이었다.

`eas prebuild` 를 생략하기 때문에 Secrets 파일 경로가 소용없었다... 즉, 나는 EAS Secrets 에 업로드한 파일들에 접근할 수 없었다.

그리고 여기에 더하여, 이미 앞서 예고했듯, process.env 객체도 제대로 접근할 수 없었다. 이 모든 것은 eas prebuild 커맨드가 실행될 때 동작하는 것으로 보인다.

그러나 나는 이 커맨드를 기본적으로 사용할 수 없는, 생략해야만 하는 상황이었으니 그야말로 말짱 도루묵이었다.

### base 64 인코딩/디코딩 으로 해결

웹에서 탐험을 계속하던 도중, 이 문제를 해결할 방법을 발견하였다.
바로 `eas-build-pre-install` 커맨드를 사용하는 것이었다!

> 참고: <https://stackoverflow.com/a/70948356/16673541>

이 커맨드는 eas build 환경에서, install 단계 직전에 실행된다. shell 에서 환경변수에 접근한 뒤, 파일을 생성하는 간단한 shell script 를 만들었다.

```shell
"eas-build-pre-install": "echo $환경변수 | base64 -d > ./파일명.확장자"
```

이 방식으로 `google-services.json` 말고도 `.env` 파일과 같은 파일도 모두 base64 인코딩해서 EAS Secrets 에 환경변수로 저장한 뒤, `eas-build-pre-install` 로 디코딩하여 파일을 생성했다.

## 🍪 쿠키) EAS Submit: Google Play Console 제출 (CD)

`eas submit --platform android`
Google Service Account key 가 필요하다.

> 설정하는 법 참고:

- 전부 다 따라하면 됨: <https://github.com/expo/fyi/blob/main/creating-google-service-account.md>
- Qonversion 설정 전까지만 따라할 것: <https://documentation.qonversion.io/docs/service-account-key-android>

위 글을 참고하면 어려움 없이 진행할 수 있다. 나는 별다른 어려움이 없었기 때문에 더이번 글에서는 EAS Submit 에 대해서는 더 자세히 적지 않겠다.
