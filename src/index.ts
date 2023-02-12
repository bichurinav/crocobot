import Image from "./Image";
import VkBot from "node-vk-bot-api";
import axios from "axios";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import "dotenv/config";

(async () => {
  const bot = new VkBot(<string>process.env.TOKEN_BOT);

  bot.command(/\/gimg\s.+/, async (ctx) => {
    try {
      const attachments: VkBotAttachment[] | undefined =
        ctx.message.attachments;
      const textForImage = ctx.message.text?.replace("/gimg ", "");

      if (!attachments) {
        return;
      }

      if (!attachments[0]) {
        ctx.reply("🐊 Кя, прикрепляй фотографию");
        return;
      }

      const attachemntType: string = attachments[0].type;

      if (attachemntType !== "photo") {
        ctx.reply("🐊 Кя, прикрепляй фотографию");
        return;
      }

      const lengthSizesPhoto: number | undefined =
        attachments[0].photo?.sizes.length;
      const photoURL: string | undefined =
        attachments[0].photo?.sizes[<number>lengthSizesPhoto - 1]?.url;

      if (!photoURL) {
        return;
      }

      const req = await axios.get(photoURL, {
        responseType: "arraybuffer",
      });

      if (req.status !== 200) {
        return;
      }

      const imageBuffer: Buffer | false = await new Image(
        <string>textForImage,
        req.data
      ).generate();

      if (imageBuffer === false) {
        ctx.reply("🐊 Кя, сликшом много текста, я не могу уместить");
        return;
      }

      const { upload_url } = await bot.execute(
        "photos.getMessagesUploadServer",
        {
          peer_id: ctx.message.peer_id,
        }
      );

      await fs.writeFile(
        path.resolve(`image/image_${ctx.message.from_id}.png`),
        imageBuffer
      );

      const reqVkServer = await axios({
        method: "post",
        url: upload_url,
        headers: { "Content-Type": "multipart/form-data" },
        data: {
          photo: createReadStream(
            path.resolve(`image/image_${ctx.message.from_id}.png`)
          ),
        },
      });

      if (reqVkServer.status !== 200) {
        return;
      }

      await fs.unlink(path.resolve(`image/image_${ctx.message.from_id}.png`));

      const photoFromVkServer = await bot.execute("photos.saveMessagesPhoto", {
        server: reqVkServer.data.server,
        photo: reqVkServer.data.photo,
        hash: reqVkServer.data.hash,
      });
      const photo = photoFromVkServer[0];

      ctx.reply("", `photo${photo.owner_id}_${photo.id}`);
    } catch (e) {
      console.error(e);
    }
  });

  bot.startPolling();
})();
