import sharp from "sharp";

class Image {
  private text: string;
  private imgBuffer: Buffer;

  constructor(text: string, imgBuffer: Buffer) {
    this.text = text;
    this.imgBuffer = imgBuffer;
  }

  async generate(): Promise<Buffer | false> {
    try {
      const svgText = this.generateSvgWithText();

      if (svgText === false) {
        return false;
      }

      return sharp(this.imgBuffer)
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
  }

  generateSvgWithText(): string | false {
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
      const texts: string[] = this.createTextRows(this.text);
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
                        font-family: "Ubuntu";
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

  private createTextRows(text: string): string[] {
    const row1: string[] = [];
    const row2: string[] = [];
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

export default Image;
