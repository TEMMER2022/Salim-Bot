import { CocoaVersion } from "cocoa-discord-utils/meta";

import {
    ActivityLoader,
    Console,
    ComputedLoader,
    DataLoader,
    FrameWorkVersion,
    MultiLoader,
    OnlineLoader,
    SBotClient,
    SongLoader,
    Response,
    SongAppearance,
} from "s-bot-framework";

// ! WARNING: LEGACY CODE
// ! This file contains stuff related to s-bot-framework (Legacy part of Salim Bot)
// ! PS: In case you are looking to use s-bot-framework, good luck dealing
// ! with what I wrote many months ago

// * Create Client, token is automatically grabbed from process.env.DISCORD_TOKEN
// * (Importing s-bot-framework will run dotenv/config)
// * Make sure you added your token in .env
export const sclient = new SBotClient();

// * Import data from files
const keywords = new DataLoader("data/keywords.json", "ชังชาติ");
const localquotes = new DataLoader("data/morequotes.json", "วาทกรรมสลิ่ม");
const awesome_salim_quotes = new OnlineLoader(
    "https://watasalim.vercel.app/api/quotes",
    "quotes",
    (t) => t.body
);
awesome_salim_quotes.setAutoRefresh(24 * 60);
const facebook = new DataLoader(
    "data/facebook.json",
    "คนรักสถาบัน",
    (t) => `ดิฉันแนะนำให้คุณไปติดตาม ${t.name} นะ เพื่อคุณจะได้ตาสว่าง ${t.url}`
);

// * Combined multiple data into One Category
export const combinedQuotes = new MultiLoader([
    {
        loader: localquotes,
        label: "Local Quotes",
    },
    {
        loader: awesome_salim_quotes,
        label: "Awesome Salim Quotes",
    },
]);

// * -- Response on Keywords ex. Answering questions -- * //

// * Introducing itself
sclient.useResponse(
    new Response({
        trigger: { mention: true, keywords: ["แนะนำตัว"] },
        response: {
            loader: new ComputedLoader(
                () =>
                    `ส วั ส ดี ค รั บ ท่านสมาชิกชมรมคนรักสถาบันทุกท่าน กระผมสลิ่มบอทเวอร์ชั่น ${process.env.npm_package_version}\nขับเคลื่อนโดยสลิ่มบอทเฟรมเวิร์คเวอร์ชั่น ${FrameWorkVersion} และโกโก้ดิสคอร์ดยูทิลิตี้เวอร์ชั่น ${CocoaVersion}\nท่านสามารถช่วยร่วมแรงร่วมใจในการพัฒนาผมได้ที่ https://github.com/Leomotors/Salim-Bot`
            ),
            reply: true,
            audio: true,
        },
    })
);

sclient.useResponse(
    new Response({
        trigger: { mention: true, keywords: ["กี่คำ"] },
        response: {
            loader: new ComputedLoader(
                () =>
                    `มันก็จะมีอยู่ ${
                        keywords.getData().length
                    } คำที่พวกสามกีบชอบพูดซึ่งทำให้ผมไม่สบายใจ ผมเองก็มีอยู่ ${
                        combinedQuotes.getData().length
                    } ประโยคที่ผมเตรียมนำไปใช้ด่าพวกสามกีบ`
            ),
            reply: true,
            audio: true,
        },
    })
);

// * Facebook Recommendation Feature
sclient.useResponse(
    new Response({
        trigger: { mention: true, keywords: ["fb", "เฟส", "facebook"] },
        response: {
            loader: facebook,
            reply: true,
            audio: true,
        },
    })
);

// * Create Response Variable (instead of putting directly to the function)
// * It is to keep later for getting data of triggered words
const ชังชาติ = new Response({
    trigger: { keywords },
    response: {
        loader: combinedQuotes,
        react: "😡",
        audio: true,
    },
});
sclient.useResponse(ชังชาติ);

// * ComputedLoader allows simple dynamic string
sclient.useResponse(
    new Response({
        trigger: { mention: true, keywords: ["ผิด"] },
        response: {
            loader: new ComputedLoader(
                () =>
                    `พวกคุณผิดที่พูดคำว่า ${ชังชาติ.triggered} ถือเป็นการคุกคามสถาบันอย่างยิ่ง`
            ),
            reply: true,
            audio: true,
        },
    })
);

// * Bot Activity
sclient.useComputedActivity({
    type: "PLAYING",
    name: `Salim Bot ${process.env.npm_package_version}`,
});
const activityLoader = new ActivityLoader("data/activity.json", "activities");
sclient.useActivities(activityLoader);

// * Use Voice in Corgi Swift Jutsu Mode
sclient.useVoice({
    fallback: {
        no_channel: "นี่คุณจะให้ฉันไปเปิดเพลงให้ผีฟังหรอ",
        stage_channel: "ฉันไม่เข้าคลับเฮาส์ นั่นมันที่ของคนชังชาติ",
        not_joinable: "คุณอย่าทำตัวสามกีบ ที่เอาแต่แบนคนอื่นได้ไหม",
        internal:
            "ขออภัยแต่เกิดปัญหาภายในขึ้น ดิฉันคิดว่าน่าจะเป็นฝีมือของทักษิณ",
        reply: true,
    },
});
// ! NOTE: For SOD (Legacy) Mode, it is removed

// * DJSalima 参上!!!
const easterEggSong = new SongLoader("data/songs.json", "easter_egg");
const รักชาติSong = new SongLoader("data/songs.json", "รักชาติ");
sclient.useDJ(
    [
        // * Bot Songs
        {
            loader: easterEggSong,
            category: "Easter Egg",
            appearance: SongAppearance.RANDOM_ONLY,
            onPlay: "Easter Egg นะจ๊ะ!! 🤩🤩 ขอให้สนุกกับ {song_name}",
        },
        {
            loader: รักชาติSong,
            category: "เพลงรักชาติ",
            appearance: SongAppearance.EVERYWHERE,
            onPlay: "ขอเสริมความรักชาติให้กับคุณด้วย {song_name} 💛💛",
        },
    ],
    {
        // * Bot Commands
        play: {
            prefixes: ["!djsalima"],
            reply: true,
            onQueued: {
                tts: "แต่รอแป๊ปนะจ๊ะ พอดีกำลังด่าพวกชังชาติอยู่ ด่าเสร็จจะรีบเปิดเพลงให้ทันที",
                song: "แต่รอแป๊ปนะจ๊ะ พอดีกำลังเปิดเพลงอยู่ ถึงคิวแล้วจะเปิดให้",
            },
            search_fail:
                "ขออภัย แต่เนื่องจากเพลงดังกล่าว ไม่ได้อยู่ในแฟ้มข้อมูลเพลงรักชาติ ดิฉันคงเปิดให้พวกคุณฟังไม่ได้",
            search_multiple_result:
                "มีหลายเพลงที่ตรงกัน กรุณาโปรดเลือกเพลงของท่านให้เจาะจงกว่านี้",
            now_playing: {
                // * Salim Embed
                send_embed: true,
                color: "YELLOW", // 💛💛💛
                title: "กำลังเล่น",
                requested_by: "คนรักสถาบัน",
                duration: "ความยาวเพลง",
                link: "ลิงก์",
                click_here: "คลิ๊กที่นี่นะจ๊ะ",
                footer: "น้อน DJSalima เล่นเพลงรักชาติเพื่อชาติ ศาสน์ กษัตริย์ ด้วยหัวใจ 💛💛💛",
            },
        },
        skip: {
            prefixes: ["!skip"],
            already_empty: "จะให้ฉันไปข้ามอะไร ฉันไม่ได้พูดอะไรอยู่เลย!!!",
            react: "⏩",
        },
        clear: {
            prefixes: ["!clear"],
            already_empty: "มันมีอะไรอยู่ในคิวด้วยหรอ หัดคิดบ้างสิ พวกสามกีบ!!",
            react: "✅",
        },
        overrides: {
            direct_youtube: {
                admin_only: true,
                prefixes: ["-yt", "--youtube"],
                reply: true,
                message: "รับทราบค่ะ",
            },
        },
    }
);

// * Console, used to logout properly
const ctrlConsole = new Console(sclient);

// * Add Loaders to Console to be able to reload while bot is running
ctrlConsole.addLoader(
    keywords,
    localquotes,
    awesome_salim_quotes,
    facebook,
    activityLoader,
    easterEggSong,
    รักชาติSong
);

// * And Add it to Client, as Client is main Class running this Bot!
sclient.useConsole(ctrlConsole);
