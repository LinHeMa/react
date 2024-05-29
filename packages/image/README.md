# [@readr-media/react-image](https://www.npmjs.com/package/@readr-media/react-image) &middot; ![npm version](https://img.shields.io/npm/v/@readr-media/react-image.svg?style=flat)

## Feature

- 可傳入的多個圖片 URL，並依序載入。
- 可傳入參數`rwd`，決定不同螢幕寬度下的圖片。
- 可傳入參數`breakpoint`，修改螢幕寬度斷點。
- 元件會依據參數`rwd`與 DPR（Device pixel ratio），決定最先載入的圖片 URL 為何。
- 當特定圖片載入成功時，則顯示該圖片；當特定圖片載入失敗時，則載入更大尺寸的圖片。
- 當所有圖片 URL 皆載入失敗時，載入預設圖片。
- 實作圖片載入動畫效果。
- 實作圖片 preload 或 lazy load。

## How to Use This Pkg as React Component ?

1. Install the npm [package](https://www.npmjs.com/package/@readr-media/react-image)
   `yarn add @readr-media/react-image`
2. Import component in the desired place

```
import CustomImage from '@readr-media/react-image'
const IMAGES_URL = { w480: "480.png", w800: "w800.png", original: "original.png"}
export default function SomeComponent() {
  return (
    <div>
      <OtherComponent/>

       <Image
          images={IMAGES_URL}
          rwd={{
            mobile: '320px',
            tablet: '244px',
            laptop: '500px',
            desktop: '1200px',
            default: '1600px'
          }}
        ></Image>

    </div>
  )
}
```

## Props

| 名稱                        | 資料型別 | 必須 | 預設值                                                                                     | 說明                                                                                                                                                                                    |
| --------------------------- | -------- | ---- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| images                      | Object   | `V`  | `{original: ""}`                                                                           | 圖片設定，範例： `{ w400: '400.png', w800: '800.png', w1200: '1200.png', original: 'original.png' }`。圖片載入順序詳見 [Sequence of Loading Images](##sequence-of-loading-images)。     |
| imagesWebP                  | Object   |      | `null`                                                                                     | 圖片設定，範例： `{ w400: '400.webp', w800: '800.webp', w1200: '1200.webp', original: 'original.webp' }`。圖片載入順序詳見 [Sequence of Loading Images](##sequence-of-loading-images)。 |
| defaultImage                | String   |      | `""`                                                                                       | 預設圖片。當`image`皆載入失敗時，則載入預設圖片。<br>當`loadingImage`未傳入時，則以預設圖片作為圖片載入動畫效果。                                                                       |
| loadingImage                | String   |      | `""`                                                                                       | 載入動畫效果，作為載入圖片的動畫。目前僅接受圖片檔 URL。                                                                                                                                |
| alt                         | String   |      | `""`                                                                                       | 替代文字                                                                                                                                                                                |
| objectFit                   | String   |      | `"cover"`                                                                                  | 圖片區塊填滿設定，即為 CSS property `object-fit`                                                                                                                                        |
| height                      | String   |      | `"100%"`                                                                                   | 圖片高度                                                                                                                                                                                |
| width                       | String   |      | `"100%"`                                                                                   | 圖片寬度                                                                                                                                                                                |
| rwd                         | Object   |      | `{mobile: '100vw', tablet: '100vw', laptop: '100vw', desktop: '100vw', default: '100vw' }` | 不同螢幕寬度斷點下的圖片尺寸。                                                                                                                                                          |
| breakpoint                  | Object   |      | `{ mobile: '767px', tablet: '1199px', laptop: '1439px', desktop: '2439px', }`              | 螢幕寬度斷點。 搭配 rwd，可以組出不同螢幕寬度斷點下的圖片尺寸。                                                                                                                         |
| debugMode                   | boolean  |      | `false`                                                                                    | 是否開啟開發模式，若開啟，則在載入圖片成功或失敗時，透過`console.log`顯示相關訊息                                                                                                       |
| priority                    | boolean  |      | `false`                                                                                    | 設定圖片是否 preload (`rel="preload"`)                                                                                                                                                  |
| intersectionObserverOptions | Object   |      | `{root: null, rootMargin: '0px', threshold: 0.25, }`                                       | intersection observer 的選項，用於調整圖片懶載入的條件。僅在參數`priority`為`false`的情況才會生效                                                                                       |
| priority                    | Object   |      | `{}`                                                                                       | 傳給 `img` 的額外屬性                                                                                                                                                                   |

## Sequence of Loading Images

- 當只有傳入 `images` 時，會依據解析度由小至大載入。
- 如果同時有傳入 `images` 與 `imagesWebP` 時，會依據解析度由小至大載入，若解析度相同，則 webP 圖片優先載入。

舉例來說，若僅有傳入 `images`，且傳入的 `images` 為：

```
{
      original: 'original.png',
      w480: 'w480.png',
      w800: 'w800.png',
      w1600: 'w1600.png',
      w2400: 'w2400.png',
}
```

圖片載入順序為 `w480.png` -> `w800.png` -> `w1600.png` -> `w2400.png` -> `original.png`。

如果除了傳入上述 `images` ，亦有傳入 `imagesWebP`，且傳入的 `imagesWebP` 為：

```
{
      original: 'original.webp',
      w480: 'w480.webp',
      w800: 'w800.webp',
      w1600: 'w1600.webp',
      w2400: 'w2400.webp',
},
```

圖片載入順序為 `w480.webp` -> `w480.png` -> `w800.webp` -> `w800.png` -> `w1600.webp` ->`w1600.png` -> `w2400.webp` -> `w2400.png` -> `original.webp` -> `original.png`。

## Precautions

若使用該套件時，禁用了瀏覽器的 cache，則同張圖片會載入至少兩次（一次在函式`loadImage()`中載入各個大小的圖片，一次則在 useEffect 中，將成功載入的圖片掛載至`<img>`上），這是正常的現象。
之所以要分載入兩次，而不是在`loadImage()`中嘗試載入圖片並掛載至`<img>`，是因為這樣才能在圖片載入時顯示`loadingImage`。

若無禁用瀏覽器快取，則僅會載入一次圖片。

## Installation

`yarn install`

## Development

```
$ yarn dev
// or
$ npm run dev
// or
$ make dev
```

## Build

Transpile React, ES6 Codes to ES5, and generate two module system (ES module and Commonjs) at the same time

```
$ npm run build
// or
$ make build
// or
$ make build-lib
```

### NPM Publish

After executing `Build` scripts, we will have `/lib` folders,
and then we can execute publish command,

```
npm publish
```

Note: before publish npm package, we need to bump the package version first.

### Folder Structure of Build File

```
@readr-media/react-image
  |
  ├──lib
  |    └── cjs    // for CommonJS project
  |    └── esm    // for ES Modules project
  |    └── types  // for Typescript
  |
  ├── README.md
  ├── CHANGELOG.md
  └── package.json
```

Note:

- If your Node.js project has enable ES Modules, it will use file in `/esm` folder when import this package.
- If not, it will use file in `/cjs` folder when import this package.
- See [Node.js Documentation](https://nodejs.org/api/esm.html#modules-ecmascript-modules) to get more info about ES Modules.

## TODOs

- [ ] 建立 CI pipeline，透過 CI 產生 npm package，並且上傳至 npm registry
- [ ] 透過 Lerna 控制 packages 之間的版號
- [ ] 在禁用瀏覽器的快取情況下，仍僅需載入圖片一次。
