"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Image_1 = __importDefault(require("./Image"));
const node_vk_bot_api_1 = __importDefault(require("node-vk-bot-api"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
require("dotenv/config");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const bot = new node_vk_bot_api_1.default(process.env.TOKEN_BOT);
    bot.command(/\/gimg\s.+/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const attachments = ctx.message.attachments;
            const textForImage = (_a = ctx.message.text) === null || _a === void 0 ? void 0 : _a.replace("/gimg ", "");
            if (!attachments) {
                return;
            }
            if (!attachments[0]) {
                ctx.reply("🐊 Кя, прикрепляй фотографию");
                return;
            }
            const attachemntType = attachments[0].type;
            if (attachemntType !== "photo") {
                ctx.reply("🐊 Кя, прикрепляй фотографию");
                return;
            }
            const lengthSizesPhoto = (_b = attachments[0].photo) === null || _b === void 0 ? void 0 : _b.sizes.length;
            const photoURL = (_d = (_c = attachments[0].photo) === null || _c === void 0 ? void 0 : _c.sizes[lengthSizesPhoto - 1]) === null || _d === void 0 ? void 0 : _d.url;
            if (!photoURL) {
                return;
            }
            const req = yield axios_1.default.get(photoURL, {
                responseType: "arraybuffer",
            });
            if (req.status !== 200) {
                return;
            }
            const imageBuffer = yield new Image_1.default(textForImage, req.data).generate();
            if (imageBuffer === false) {
                ctx.reply("🐊 Кя, сликшом много текста, я не могу уместить");
                return;
            }
            const { upload_url } = yield bot.execute("photos.getMessagesUploadServer", {
                peer_id: ctx.message.peer_id,
            });
            yield promises_1.default.writeFile(path_1.default.resolve("dist", "image", `image_${ctx.message.from_id}.png`), imageBuffer);
            const reqVkServer = yield (0, axios_1.default)({
                method: "post",
                url: upload_url,
                headers: { "Content-Type": "multipart/form-data" },
                data: {
                    photo: (0, fs_1.createReadStream)(path_1.default.resolve("dist", "image", `image_${ctx.message.from_id}.png`)),
                },
            });
            if (reqVkServer.status !== 200) {
                return;
            }
            yield promises_1.default.unlink(path_1.default.resolve("dist", "image", `image_${ctx.message.from_id}.png`));
            const photoFromVkServer = yield bot.execute("photos.saveMessagesPhoto", {
                server: reqVkServer.data.server,
                photo: reqVkServer.data.photo,
                hash: reqVkServer.data.hash,
            });
            const photo = photoFromVkServer[0];
            ctx.reply("", `photo${photo.owner_id}_${photo.id}`);
        }
        catch (e) {
            console.error(e);
        }
    }));
    bot.startPolling();
}))();
