"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
class Image {
  constructor(text, imgBuffer) {
    this.text = text;
    this.imgBuffer = imgBuffer;
  }
  generate() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const svgText = this.generateSvgWithText();
        if (svgText === false) {
          return false;
        }
        return (0, sharp_1.default)(this.imgBuffer)
          .resize(600, 600)
          .composite([
            {
              input: Buffer.from(svgText),
            },
          ])
          .png()
          .toBuffer();
      } catch (e) {
        console.error(e);
        return false;
      }
    });
  }
  generateSvgWithText() {
    const lengthText = this.text.length;
    const positionTexts = [
      {
        x: "",
        y: "",
        txt: "",
      },
    ];
    if (lengthText <= 20) {
      positionTexts[0]["x"] = "25%";
      positionTexts[0]["y"] = "535";
      positionTexts[0]["txt"] = this.text;
    }
    if (lengthText > 20 && lengthText <= 26) {
      positionTexts[0]["x"] = "10";
      positionTexts[0]["y"] = "535";
      positionTexts[0]["txt"] = this.text;
    }
    if (lengthText > 26 && lengthText <= 58) {
      const texts = this.createTextRows(this.text);
      positionTexts[0]["x"] = "10";
      positionTexts[0]["y"] = "515";
      positionTexts[0]["txt"] = texts[0];
      positionTexts.push({ x: "10", y: "565", txt: texts[1] });
    }
    if (lengthText >= 58) {
      return false;
    }
    const textSVG = `
            <svg width="600" height="600">
                <style>
                    .text {
                        font-size: 36px;
                        fill: white;
                        font-family: sans-serif;
                        word-break: break-all;
                    }
                </style>

                <rect x="0" y="450" width="100%" height="150" fill="black" opacity="0.6"/>
                ${positionTexts
                  .map((el) => {
                    return `<text class="text" x="${el["x"]}" y="${el["y"]}">${el["txt"]}</text>`;
                  })
                  .join("")}
            </svg>
        `;
    return textSVG;
  }
  createTextRows(text) {
    const row1 = [];
    const row2 = [];
    const textAr = text.split(" ");
    let limit = 24;
    let isTransferedText = false;
    let countSymbols = 0 + textAr.length;
    textAr.forEach((txt, idx) => {
      if (txt === "*") {
        countSymbols = limit;
        isTransferedText = true;
      }
      if (countSymbols < limit) {
        row1.push(txt);
      } else {
        if (txt !== "*") row2.push(txt);
      }
      if (!isTransferedText) countSymbols += txt.length;
    });
    return [row1.join(" "), row2.join(" ")];
  }
}
exports.default = Image;
