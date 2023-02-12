import Image from "./Image";
import fs from "fs/promises";

(async () => {
  const imageFile = await fs.readFile("./dist/image/1.PNG");
  const image = await new Image("Текст", imageFile).generate();
  await fs.writeFile("./dist/image/2.PNG", <Buffer>image);
})();
