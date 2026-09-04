export interface GameStats {
  bloodSugar: number
  mood: number
  energy: number
  satiety: number
}

export interface Effect {
  bloodSugar?: number
  mood?: number
  energy?: number
  satiety?: number
}

export type ChoiceId = "A" | "B"

export interface Choice {
  /** 稳定的题库编号；左右展示顺序可以随机，但统计和复盘始终使用这个编号。 */
  id: ChoiceId
  label: string
  tip?: string
  effect: Effect
  isPreferred: boolean
  knowledgeTags: string[]
  /** 只有连续命中至少两个风险节点，才允许触发低糖死亡。 */
  lowSugarRisk?: boolean
  scienceTip: string
  /** 仅用于选项文字已经明确表达“硬撑/过量”的场景，避免普通高饱腹餐误判为吃撑。 */
  overfull?: boolean
}

export interface ChoiceRecord {
  day: number
  eventId: number
  eventTitle: string
  choiceId: ChoiceId
  choiceLabel: string
  isPreferred: boolean
  knowledgeTags: string[]
}

export type EventGroup = "breakfast" | "lunch" | "afternoon" | "dinner" | "evening"

export interface GameEvent {
  id: number
  group: EventGroup
  title: string
  description: string
  image: string
  preEffect?: Effect
  choices: [Choice, Choice]
  weekendOnly?: boolean
  weekdayOnly?: boolean
}

export const CHARACTER_NAME = "小糖"
export const GAME_DATA_VERSION = "2026-09-03-v8"

export const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] as const

export interface TimeSlotInfo {
  label: string
  emoji: string
  time: string
  scene: string
  color: string
  bg: string
}

export const TIME_SLOT_META: Record<EventGroup, TimeSlotInfo> = {
  breakfast: { label: "晨间", emoji: "\u{1F305}", time: "AM 7:30", scene: "厨房 / 早餐店 / 路上", color: "#e8824a", bg: "#fdecd8" },
  lunch:     { label: "午间", emoji: "\u{2600}\u{FE0F}", time: "PM 12:00", scene: "食堂 / 外卖 / 餐厅", color: "#e05a5a", bg: "#fde8e8" },
  afternoon: { label: "下午", emoji: "\u{2615}", time: "PM 3:30", scene: "茶水间 / 办公室", color: "#f5c542", bg: "#fef6d4" },
  dinner:    { label: "晚间", emoji: "\u{1F319}", time: "PM 6:30", scene: "家里 / 餐馆 / 饭局", color: "#5a9a6e", bg: "#e0f0e4" },
  evening:   { label: "深夜", emoji: "\u{1F30C}", time: "PM 9:00", scene: "家里 / 健身房 / 床上", color: "#7c6fb0", bg: "#ece8f5" },
}

// 首日与后续每日统一从轻度空腹开始，避免早餐后的正常午餐被累计成“吃撑”。
export const INITIAL_STATS: GameStats = {
  bloodSugar: 45,
  mood: 80,
  energy: 80,
  satiety: 20,
}

/**
 * 游戏化变化标尺（不是生理测量值）：
 * - 血糖：0–5 几乎不动，8–15 温和，18–22 明显，25–28 较强；
 * - 精力 / 心情：±3–5 轻微，±8–12 明显，±15 以上只留给强情境；
 * - 饱腹：0–5 饮品，8–18 加餐，20–35 正餐，40+ 明确的大份量。
 */

export interface GameTrackers {
  peakBsCount: number
  foodComaCount: number
  hangoverFreeDays: number
}

// ==========================================
// v2.4 Event Database (58 events)
// ==========================================

const BREAKFAST_EVENTS: GameEvent[] = [
  {
    id: 1, group: "breakfast", title: "起晚了", description: "起晚了，来不及好好吃饭。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "当做轻断食，今天就不吃早餐啦", effect: { bloodSugar: -9, mood: -5, energy: -23, satiety: -19 }, isPreferred: false, knowledgeTags: ["规律进餐","混合餐搭配"], lowSugarRisk: true, scienceTip: "空腹越久，有些人上午越容易疲惫，中午也可能饿得太急。\n赶时间也别硬扛，哪怕先补一份主食和蛋白质。" },
      { id: "B", label: "路上买根玉米，再带一盒牛奶", effect: { bloodSugar: 19, mood: 9, energy: 14, satiety: 20 }, isPreferred: true, knowledgeTags: ["规律进餐","混合餐搭配"], scienceTip: "玉米给一份主食，牛奶补上蛋白质，早餐没有因为赶时间而缺席。\n不用追求零碳水，先把上午的精力接住。" },
    ],
  },
  {
    id: 2, group: "breakfast", title: "周末早餐", description: "难得周末，认真吃顿早饭。", weekendOnly: true,
    image: "/images/s-breakfast.jpg",
    choices: [
      { id: "A", label: "用两个橙子榨一杯鲜果汁，营养又健康", effect: { bloodSugar: 33, mood: 18, energy: -13, satiety: 9 }, isPreferred: false, knowledgeTags: ["水果形态","混合餐搭配"], scienceTip: "橙子榨汁后少了咀嚼，一杯还可能装下两个橙子，糖吸收通常更快。\n水果可以吃，完整地吃更划算。" },
      { id: "B", label: "吃两个水煮蛋，配两片全麦吐司", effect: { bloodSugar: 6, mood: 0, energy: 19, satiety: 26 }, isPreferred: true, knowledgeTags: ["水果形态","混合餐搭配"], scienceTip: "鸡蛋、全麦吐司把蛋白质、主食和纤维放进同一餐，通常更耐饿。\n朴素的搭配，也能很能打。" },
    ],
  },
  {
    id: 3, group: "breakfast", title: "妈妈的爱", description: "妈妈特意起早冲了一碗黑芝麻核桃糊。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "把这碗黑芝麻核桃糊全部喝完", effect: { bloodSugar: 33, mood: 14, energy: -9, satiety: 29 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","碳水份量"], scienceTip: "细粉经过热冲更容易消化，一大碗又把份量叠了上去。\n芝麻核桃没做错，问题是粉得细、喝得多。" },
      { id: "B", label: "喝半碗芝麻核桃糊，再配一个水煮蛋", effect: { bloodSugar: 10, mood: 0, energy: 9, satiety: 19 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","碳水份量"], scienceTip: "半碗粉糊控制了份量，鸡蛋又补上蛋白质和饱腹感。\n喜欢的味道可以留，换个搭法就好。" },
    ],
  },
  {
    id: 4, group: "breakfast", title: "面包房", description: "路过面包房，橱窗里摆着各种各样的面包。",
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "选包装写着“无糖全麦”的面包，配咖啡", effect: { bloodSugar: 30, mood: 9, energy: -8, satiety: 20 }, isPreferred: false, knowledgeTags: ["食品标签","混合餐搭配"], scienceTip: "“无糖”不等于没有淀粉，“全麦”也要看配料表里的真实排位。\n别只看包装正面，它最会说漂亮话。" },
      { id: "B", label: "选全麦粉排第一的面包，配一枚鸡蛋", effect: { bloodSugar: 9, mood: 0, energy: 13, satiety: 28 }, isPreferred: true, knowledgeTags: ["食品标签","混合餐搭配"], scienceTip: "全麦粉排在配料表前面，通常比包装上的“无糖全麦”四个大字更有参考价值。\n再配一枚鸡蛋，蛋白质和饱腹感也补上了。" },
    ],
  },
  {
    id: 5, group: "breakfast", title: "传统摊位", description: "街边传统早餐摊，豆浆飘香，油条刚出锅。",
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "无糖豆浆配两根油条，经典组合", effect: { bloodSugar: 29, mood: 23, energy: -10, satiety: 39 }, isPreferred: false, knowledgeTags: ["糖脂组合","碳水份量"], scienceTip: "无糖豆浆不会抵消两根油条的淀粉、油脂和份量。\n油条不是禁品，只是“淀粉＋脂肪”组合更要留意量。" },
      { id: "B", label: "咸豆腐脑配一枚茶叶蛋，再吃半根油条", effect: { bloodSugar: 14, mood: 6, energy: 14, satiety: 34 }, isPreferred: true, knowledgeTags: ["糖脂组合","碳水份量"], scienceTip: "豆腐脑和茶叶蛋补蛋白质，半根油条保留口味也收住份量。\n控糖不是告别油条，是学会怎么搭。" },
    ],
  },
  {
    id: 6, group: "breakfast", title: "肠胃不适", description: "胃有点不舒服，需要吃点温和的。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "一大碗熬得软烂的白粥，配一点咸菜", effect: { bloodSugar: 33, mood: 14, energy: -13, satiety: 29 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","混合餐搭配"], scienceTip: "白粥熬得越软烂，淀粉糊化越充分；一大碗配咸菜，蛋白质又偏少。\n胃口不好也可以吃粥，把碗变小、配菜补齐。" },
      { id: "B", label: "小碗白粥，配一份蒸蛋和一小碟嫩青菜", effect: { bloodSugar: 9, mood: 0, energy: 9, satiety: 19 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","混合餐搭配"], scienceTip: "白粥越软烂，淀粉糊化越充分，通常消化得越快。\n把粥换成小碗，再用蒸蛋和青菜补齐这顿饭。" },
    ],
  },
  {
    id: 7, group: "breakfast", title: "酒店自助", description: "酒店自助早餐，各种食物摆满台面。", weekendOnly: true,
    image: "/images/s-breakfast.jpg",
    choices: [
      { id: "A", label: "水果富含纤维，先盛满一盘水果再吃别的", effect: { bloodSugar: 27, mood: 18, energy: -4, satiety: 14 }, isPreferred: false, knowledgeTags: ["进食顺序","水果形态"], scienceTip: "水果有纤维，但一大盘先下肚，仍会把不少碳水集中在餐前。\n健康食物也有份量，先别把水果盘当开胃菜。" },
      { id: "B", label: "这些水果糖分也要算进一餐，先吃蛋和蔬菜，最后留一小碟水果", effect: { bloodSugar: 14, mood: 6, energy: 19, satiety: 39 }, isPreferred: true, knowledgeTags: ["进食顺序","水果形态"], scienceTip: "先吃蛋和蔬菜，蛋白质和纤维能让后面的碳水吸收更平缓。\n水果留成餐后小份，不用戒，也不会一上来就吃掉一大盘。" },
    ],
  },
  {
    id: 8, group: "breakfast", title: "晨练", description: "想趁早晨运动，计划去跑步。",
    image: "/images/s-exercise.png",
    choices: [
      { id: "A", label: "空腹直接去跑步，控糖又燃脂", effect: { bloodSugar: 26, mood: 4, energy: -24, satiety: -15 }, isPreferred: false, knowledgeTags: ["运动与补能","规律进餐"], scienceTip: "空腹跑步不等于长期更减脂，饿着上强度反而更容易乏力、头晕。\n身体已经喊饿，就别把硬扛当自律。" },
      { id: "B", label: "喝半杯牛奶，吃两口苹果再出发", effect: { bloodSugar: 6, mood: 5, energy: 14, satiety: 10 }, isPreferred: true, knowledgeTags: ["运动与补能","规律进餐"], scienceTip: "少量牛奶和苹果补一点碳水、蛋白质，又不会变成沉重的一餐。\n先垫两口，跑起来更踏实。" },
    ],
  },
  {
    id: 9, group: "breakfast", title: "极简早餐", description: "想吃极简早餐，两个选择都看起来很健康。",
    image: "/images/s-breakfast.jpg",
    choices: [
      { id: "A", label: "燕麦富含膳食纤维，多泡一碗即食燕麦和蓝莓", effect: { bloodSugar: 32, mood: 14, energy: -7, satiety: 21 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","混合餐搭配"], scienceTip: "即食燕麦颗粒更细，淀粉通常消化更快；一大碗也未必有足够蛋白质。\n“看起来健康”还要接受整餐搭配的考验。" },
      { id: "B", label: "用黄油煎两个鸡蛋，配半个馒头", effect: { bloodSugar: 5, mood: 0, energy: 23, satiety: 34 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","混合餐搭配"], scienceTip: "即食燕麦颗粒越细，通常消化越快；“燕麦”两个字并不自动等于升糖慢。\n鸡蛋配半个馒头，蛋白质和主食反而更好掌握。" },
    ],
  },
  {
    id: 10, group: "breakfast", title: "晨起的心慌", description: "早上刚睁眼，你突然觉得心跳加速，身体有轻微的颤抖。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "先洗漱出门，打算到了公司再吃早餐", effect: { bloodSugar: -11, mood: -19, energy: -28, satiety: -10 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理"], lowSugarRisk: true, scienceTip: "心慌手抖时继续空腹赶路，会让不适和风险继续拖长。\n先坐下补少量易消化碳水；症状持续或加重，要测量或求助。" },
      { id: "B", label: "先坐下吃半根香蕉，缓过来再准备早餐", effect: { bloodSugar: 10, mood: 5, energy: 14, satiety: 10 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理"], scienceTip: "半根香蕉先补少量易利用的碳水，缓过来再吃正常早餐。\n心慌不一定就是低血糖，持续不适要及时测量或求助。" },
    ],
  },
  {
    id: 11, group: "breakfast", title: "嘴巴很寂寞", description: "刚吃完早饭不到 1 个半小时，坐在电脑前的你突然觉得嘴巴很寂寞，总想找点吃的。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "吃两块无糖苏打饼干，继续工作", effect: { bloodSugar: 19, mood: 9, energy: -5, satiety: 4 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理","饥饿觉察"], scienceTip: "无糖苏打饼干不甜，主体仍是精制淀粉；刚吃完早餐，嘴馋也不等于缺糖。\n先缓十分钟，真饿再认真加餐。" },
      { id: "B", label: "先喝杯水，十分钟后再判断要不要加餐", effect: { bloodSugar: 0, mood: 0, energy: 4, satiety: 9 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理","饥饿觉察"], scienceTip: "先喝水、等十分钟，是在分清嘴馋和饥饿，不是让自己一直忍。\n还饿就加酸奶、牛奶或坚果。" },
    ],
  },
]

const LUNCH_EVENTS: GameEvent[] = [
  {
    id: 12, group: "lunch", title: "减脂素食", description: "食堂里的「减脂素食」专区。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "土豆丝、藕片和南瓜各夹一份", effect: { bloodSugar: 34, mood: 14, energy: -14, satiety: 38 }, isPreferred: false, knowledgeTags: ["碳水识别","混合餐搭配"], scienceTip: "土豆、藕和南瓜都能贡献淀粉，三样各一份，主食就悄悄叠起来了。\n它们是好食物，但不能都假装成绿叶菜。" },
      { id: "B", label: "绿叶菜、卤蛋，再配半份杂粮饭", effect: { bloodSugar: 5, mood: 0, energy: 9, satiety: 29 }, isPreferred: true, knowledgeTags: ["碳水识别","混合餐搭配"], scienceTip: "土豆、藕和南瓜都含淀粉，吃进一餐时也要算进主食。\n换成绿叶菜、卤蛋和半份杂粮饭，三类食物就不会混在一起。" },
    ],
  },
  {
    id: 13, group: "lunch", title: "外卖盖饭", description: "外卖盖饭到了，香气扑鼻。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "盖饭已经荤素都有，直接拌匀大口吃更省时间", effect: { bloodSugar: 29, mood: 18, energy: -10, satiety: 39 }, isPreferred: false, knowledgeTags: ["进食顺序","碳水份量"], scienceTip: "盖饭拌匀后更顺口，也更容易大口、快速地吃下米饭和酱汁。\n赶时间没关系，先把菜肉吃几口再动米饭。" },
      { id: "B", label: "先吃配菜和肉，再把米饭分成两次慢慢吃", effect: { bloodSugar: 14, mood: 0, energy: 14, satiety: 39 }, isPreferred: true, knowledgeTags: ["进食顺序","碳水份量"], scienceTip: "先吃蔬菜和肉，纤维、蛋白质会让后面的淀粉吸收更平缓。\n盖饭不用戒，把米饭留到后面、慢一点吃就行。" },
    ],
  },
  {
    id: 14, group: "lunch", title: "汤泡饭", description: "米饭有点干，旁边有一大碗汤。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "米饭太干，用热汤泡软，觉得这样更好消化", effect: { bloodSugar: 31, mood: 18, energy: -14, satiety: 39 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","进食速度"], scienceTip: "米饭本来就已糊化，泡汤后继续吸水变软，更容易少嚼、吃快。\n汤可以喝，别把米饭变成一路滑下去的汤饭。" },
      { id: "B", label: "汤和饭分开，先吃菜和肉，再慢慢嚼米饭", effect: { bloodSugar: 15, mood: 0, energy: 14, satiety: 35 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","进食速度"], scienceTip: "汤饭分开，先菜肉再慢慢嚼米饭，能保留咀嚼和进食节奏。\n不用戒汤，只要别让它替你加速。" },
    ],
  },
  {
    id: 15, group: "lunch", title: "餐前饮品", description: "餐前，桌上有一瓶“0蔗糖”乳酸菌饮料，也有苹果醋和水。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "“0蔗糖”应该更稳，餐前喝完整瓶乳酸菌饮料", effect: { bloodSugar: 27, mood: 14, energy: -5, satiety: 9 }, isPreferred: false, knowledgeTags: ["食品标签","醋与餐后血糖"], scienceTip: "“0蔗糖”不等于零碳水，乳糖、葡萄糖和整瓶份量仍要看。\n包装少了一个糖字，不代表血糖也自动下线。" },
      { id: "B", label: "苹果醋听说能缓和餐后血糖，充分稀释后喝一小杯", effect: { bloodSugar: 9, mood: 0, energy: 9, satiety: 13 }, isPreferred: true, knowledgeTags: ["食品标签","醋与餐后血糖"], scienceTip: "少量苹果醋充分稀释后，可能让部分高GI餐的反应更平缓，但效果有限。\n它是小辅助，不是控糖快捷键，也要照顾胃和牙齿。" },
    ],
  },
  {
    id: 16, group: "lunch", title: "压力下的午餐", description: "上午被老板狠批了一顿，中午情绪跌入谷底，你需要吃点好的来拯救自己。", weekdayOnly: true,
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "果麦碗看起来轻盈，用蜂蜜脆燕麦和果泥奖励自己", effect: { bloodSugar: 27, mood: 18, energy: -4, satiety: 20 }, isPreferred: false, knowledgeTags: ["压力进食","混合餐搭配"], scienceTip: "果泥、蜂蜜和脆燕麦叠在一起，会集中多种碳水，蛋白质却可能不够。\n压力大也要吃主食，只是别让“轻盈感”骗了份量。" },
      { id: "B", label: "选单层牛肉汉堡，保留面包、少酱再加一份蔬菜", effect: { bloodSugar: 15, mood: 14, energy: 19, satiety: 34 }, isPreferred: true, knowledgeTags: ["压力进食","混合餐搭配"], scienceTip: "单层牛肉汉堡保留面包、少酱加菜，碳水、蛋白质和蔬菜都在。\n汉堡也能搭成一顿像样的午餐。" },
    ],
  },
  {
    id: 17, group: "lunch", title: "牛肉面", description: "面馆里，牛肉面可以加青菜和卤蛋。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "牛肉面有肉有汤，直接拌匀趁热吃完", effect: { bloodSugar: 31, mood: 19, energy: -14, satiety: 44 }, isPreferred: false, knowledgeTags: ["碳水份量","进食顺序"], scienceTip: "牛肉和汤不会改变一大碗面仍以精制淀粉为主；吃得又多又快，餐后更容易起伏。\n先别急着拌匀扫光。" },
      { id: "B", label: "先吃青菜、卤蛋和牛肉，再慢慢吃大半碗面", effect: { bloodSugar: 19, mood: 6, energy: 19, satiety: 47 }, isPreferred: true, knowledgeTags: ["碳水份量","进食顺序"], scienceTip: "青菜、蛋和牛肉先到场，纤维和蛋白质能放慢后面面条的消化吸收。\n面照样吃，慢一点、留一点，餐后起伏通常更小。" },
    ],
  },
  {
    id: 18, group: "lunch", title: "沙拉酱", description: "沙拉旁边放着两种酱汁。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "两种酱各来一勺，味道更丰富，单份都不算多", effect: { bloodSugar: 24, mood: 19, energy: -5, satiety: 29 }, isPreferred: false, knowledgeTags: ["隐藏糖与酱料","碳水份量"], scienceTip: "两种酱各一勺，看着都不多，加起来却可能带来额外糖、淀粉和脂肪。\n酱料最会“积少成多”。" },
      { id: "B", label: "只选一种酱，蘸着吃，吃到够味就停", effect: { bloodSugar: 10, mood: 0, energy: 14, satiety: 29 }, isPreferred: true, knowledgeTags: ["隐藏糖与酱料","碳水份量"], scienceTip: "只选一种酱、蘸着吃，既保留味道，也更容易看见实际用量。\n够味就停，不必让沙拉泡澡。" },
    ],
  },
  {
    id: 19, group: "lunch", title: "饿过头", description: "会议拖到下午一点半，你饿得手脚发软，胃也不舒服。", weekdayOnly: true,
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "先喝一杯甜豆浆，感觉来劲后再去吃午饭", effect: { bloodSugar: 38, mood: 23, energy: -19, satiety: 26 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理","规律进餐"], scienceTip: "甜豆浆能快速补糖，却不能替代一顿完整午饭。\n先坐下缓一缓，再正常吃饭；症状反复或加重，要及时求助。" },
      { id: "B", label: "先坐下，吃半根香蕉配小盒牛奶，缓过来再吃完整午饭", effect: { bloodSugar: 18, mood: 5, energy: 10, satiety: 8 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理","规律进餐"], scienceTip: "香蕉和牛奶先补少量碳水、蛋白质，再接上完整午饭，比靠甜饮硬拖更稳。\n饿到发软不一定是低血糖，持续不适要测量或求助。" },
    ],
  },
  {
    id: 20, group: "lunch", title: "便利店简餐", description: "便利店简餐，两种三明治。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "奶油果酱吐司份量不大，再配无糖咖啡平衡甜味", effect: { bloodSugar: 29, mood: 14, energy: -9, satiety: 20 }, isPreferred: false, knowledgeTags: ["食品标签","混合餐搭配"], scienceTip: "无糖咖啡只能不加糖，不能抵消吐司、奶油和果酱里的淀粉、糖和脂肪。\n咖啡负责醒脑，不负责“冲销”早餐。" },
      { id: "B", label: "选全麦金枪鱼三明治，配一杯无糖茶", effect: { bloodSugar: 14, mood: 1, energy: 14, satiety: 30 }, isPreferred: true, knowledgeTags: ["食品标签","混合餐搭配"], scienceTip: "金枪鱼补蛋白质，全麦面包留一份主食，通常比奶油果酱吐司更耐饿。\n买之前确认全麦粉排位，酱料少一点就好。" },
    ],
  },
  {
    id: 21, group: "lunch", title: "饭前状态", description: "脑子里还在想工作，到了饭点。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "边回工作消息边吃，省出一点午休时间", effect: { bloodSugar: 21, mood: 5, energy: -5, satiety: 30 }, isPreferred: false, knowledgeTags: ["进食速度","饥饿觉察"], scienceTip: "边回消息边吃不会直接升糖，却容易让速度和份量悄悄失去感觉。\n工作先暂停十分钟，饭不会因此跑掉。" },
      { id: "B", label: "先放下手机，做三次深呼吸再开吃", effect: { bloodSugar: 15, mood: 10, energy: 14, satiety: 30 }, isPreferred: true, knowledgeTags: ["进食速度","饥饿觉察"], scienceTip: "放下手机、做几次呼吸，是把注意力切回这顿饭，也更容易发现自己吃够了。\n这不是仪式感，是给饱腹信号一点时间。" },
    ],
  },
  {
    id: 22, group: "lunch", title: "减脂期的炒菜", description: "减脂期，在想午饭怎么吃。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "水煮鸡胸和蔬菜，配低脂沙拉汁，尽量不碰油和主食", effect: { bloodSugar: 10, mood: -18, energy: -13, satiety: 12 }, isPreferred: false, knowledgeTags: ["混合餐搭配","可持续饮食"], scienceTip: "水煮、低脂、无主食看着很克制，却可能把能量、口感和完整度一起削掉。\n控糖餐也得像一顿能长期吃的饭。" },
      { id: "B", label: "少量油炒青菜和瘦肉，配半份杂粮饭", effect: { bloodSugar: 10, mood: 10, energy: 14, satiety: 30 }, isPreferred: true, knowledgeTags: ["混合餐搭配","可持续饮食"], scienceTip: "少量油、瘦肉、青菜和半份杂粮饭都在场，四大角色终于到齐。\n比极端清淡更完整，也更容易坚持。" },
    ],
  },
  {
    id: 23, group: "lunch", title: "轻食店沙拉", description: "轻食店，选什么好？",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "蔬菜越多越顶饱，选超大碗田园沙拉加面包丁", effect: { bloodSugar: 18, mood: -9, energy: -9, satiety: 16 }, isPreferred: false, knowledgeTags: ["混合餐搭配","碳水份量"], scienceTip: "超大碗蔬菜体积很大，但缺少蛋白质，面包丁也不是稳定饱腹的主角。\n菜堆得高，不等于下午一定扛得住。" },
      { id: "B", label: "选中碗沙拉，加鸡胸、鸡蛋和半根玉米", effect: { bloodSugar: 10, mood: 8, energy: 18, satiety: 35 }, isPreferred: true, knowledgeTags: ["混合餐搭配","碳水份量"], scienceTip: "蔬菜负责体积，鸡胸和鸡蛋补蛋白质，半根玉米提供适量主食。\n真正持久的饱腹感，不只靠把菜堆成最大碗。" },
    ],
  },
  {
    id: 24, group: "lunch", title: "纯素网红餐", description: "打卡网红素食，两种选择。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "水果和燕麦都很健康，选香蕉、燕麦脆铺满的巴西莓果碗", effect: { bloodSugar: 33, mood: 31, energy: -18, satiety: 20 }, isPreferred: false, knowledgeTags: ["隐藏糖与酱料","混合餐搭配"], scienceTip: "果泥、香蕉和燕麦脆单看都不错，铺满一碗后，碳水总量却会悄悄变大。\n健康光环不能替你计算叠加量。" },
      { id: "B", label: "选有天贝、毛豆、牛油果和糙米的佛陀碗", effect: { bloodSugar: 12, mood: 5, energy: 16, satiety: 35 }, isPreferred: true, knowledgeTags: ["隐藏糖与酱料","混合餐搭配"], scienceTip: "天贝、毛豆、牛油果和糙米，把蛋白质、脂肪、纤维和主食都安排上了。\n酱汁和糙米留意份量，这碗就更完整。" },
    ],
  },
  {
    id: 25, group: "lunch", title: "碳水阻断茶", description: "饭前喝了一大杯号称「阻断碳水吸收」的白芸豆减肥茶，然后只吃了一份蔬菜沙拉。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "阻断茶已经挡住碳水，午餐只吃一份蔬菜沙拉", effect: { bloodSugar: -13, mood: -14, energy: -19, satiety: -10 }, isPreferred: false, knowledgeTags: ["碳水阻断误区","规律进餐"], lowSugarRisk: true, scienceTip: "“碳水阻断”至多影响部分淀粉消化，不能替代一顿饭。\n只吃蔬菜会让主食、蛋白质和能量都掉线。" },
      { id: "B", label: "不把阻断茶算成正餐，沙拉外加半碗杂粮饭和豆腐", effect: { bloodSugar: 14, mood: 1, energy: 10, satiety: 20 }, isPreferred: true, knowledgeTags: ["碳水阻断误区","规律进餐"], scienceTip: "半碗杂粮饭补主食，豆腐补蛋白质，阻断茶终于回到“饮品”的位置。\n真实食物，才是这顿饭的主角。" },
    ],
  },
]

const AFTERNOON_EVENTS: GameEvent[] = [
  {
    id: 26, group: "afternoon", title: "水果选择", description: "下午有点饿，看见水果和坚果。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "完整苹果有纤维，吃一个就能扛到晚饭", effect: { bloodSugar: 20, mood: 14, energy: 5, satiety: 14 }, isPreferred: false, knowledgeTags: ["水果形态","混合餐搭配"], scienceTip: "完整苹果是不错的水果，但已经很饿时，单靠它未必能撑到晚饭。\n水果不是万能加餐，还要看看缺不缺蛋白质。" },
      { id: "B", label: "选一杯无糖酸奶，配一小把巴旦木", effect: { bloodSugar: 10, mood: 6, energy: 18, satiety: 23 }, isPreferred: true, knowledgeTags: ["水果形态","混合餐搭配"], scienceTip: "无糖酸奶加一小把坚果，补上蛋白质和脂肪，通常比单吃水果更耐饿。\n一小份就够，不用把加餐吃成正餐。" },
    ],
  },
  {
    id: 27, group: "afternoon", title: "下午发晕", description: "下午头晕眼花，包里只有一根香蕉。",
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "香蕉升糖快，先吃几口再坐下观察", effect: { bloodSugar: 10, mood: 5, energy: 18, satiety: 5 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理","运动与补能"], scienceTip: "头晕时先坐稳，几口香蕉能补少量易利用的碳水。\n头晕不等于确诊低血糖；持续或加重，要尽快测量或求助。" },
      { id: "B", label: "担心香蕉糖多，先喝水休息，把香蕉留到晚餐", effect: { bloodSugar: -11, mood: -14, energy: -23, satiety: -10 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理","运动与补能"], lowSugarRisk: true, scienceTip: "只喝水不能提供能量，也会把已经出现的不适继续拖长。\n先坐稳补少量碳水；症状持续或加重，要测量或求助。" },
    ],
  },
  {
    id: 28, group: "afternoon", title: "奶茶社交", description: "同事说请客喝奶茶。", weekdayOnly: true,
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "选中杯三分糖，把珍珠换成看起来更清爽的椰果", effect: { bloodSugar: 34, mood: 32, energy: -18, satiety: 18 }, isPreferred: false, knowledgeTags: ["含糖饮料","社交选择"], scienceTip: "中杯三分糖加椰果，杯量、饮料糖和小料糖浆仍会一起叠加。\n点奶茶不能只看甜度，小料也要算账。" },
      { id: "B", label: "选小杯五分糖，不加任何小料", effect: { bloodSugar: 10, mood: 12, energy: 5, satiety: 5 }, isPreferred: true, knowledgeTags: ["含糖饮料","社交选择"], scienceTip: "小杯五分糖听着更甜，但少了杯量和小料，总碳水反而可能更少。\n甜度只是一个数字，杯型和加料同样重要。" },
    ],
  },
  {
    id: 29, group: "afternoon", title: "办公室零食", description: "同事递过来一包综合果蔬干。",
    image: "/images/s-tea.png",
    choices: [
      { id: "A", label: "果蔬脆保留了蔬菜营养，吃一小包解馋", effect: { bloodSugar: 27, mood: 18, energy: -9, satiety: 14 }, isPreferred: false, knowledgeTags: ["食品加工","混合餐搭配"], scienceTip: "果蔬脆脱水后，糖和能量更集中，有些还经过油炸或额外加糖。\n“果蔬”两个字很健康，配料表才说真话。" },
      { id: "B", label: "即食毛豆也是植物零食，吃一小袋", effect: { bloodSugar: 5, mood: 1, energy: 14, satiety: 19 }, isPreferred: true, knowledgeTags: ["食品加工","混合餐搭配"], scienceTip: "毛豆有蛋白质和纤维，比脆片更能接住真实饥饿。\n即食也可以很靠谱，顺手看看盐和份量。" },
    ],
  },
  {
    id: 30, group: "afternoon", title: "下午犯困", description: "下午三点，困意袭来。", weekdayOnly: true,
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "燕麦奶是植物奶，点一杯风味燕麦拿铁提神", effect: { bloodSugar: 30, mood: 14, energy: 18, satiety: 4 }, isPreferred: false, knowledgeTags: ["含糖饮料","咖啡因"], scienceTip: "风味燕麦拿铁里的燕麦饮本身含碳水，还可能叠加风味糖。\n植物奶不是免检标签，咖啡也不能替代睡眠。" },
      { id: "B", label: "点小杯不加糖鲜奶拿铁，再去接水走一圈", effect: { bloodSugar: 0, mood: 0, energy: 14, satiety: 4 }, isPreferred: true, knowledgeTags: ["含糖饮料","咖啡因"], scienceTip: "小杯无糖鲜奶拿铁先减掉添加糖，走一圈还能让肌肉参与葡萄糖利用。\n提神可以，别把咖啡当成睡眠替身。" },
    ],
  },
  {
    id: 31, group: "afternoon", title: "朋友的甜品", description: "朋友递来一块抹茶慕斯，期待你一起尝尝。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "朋友很期待，完整吃完再配黑咖啡解腻", effect: { bloodSugar: 33, mood: 27, energy: -9, satiety: 19 }, isPreferred: false, knowledgeTags: ["甜品份量","餐后活动"], scienceTip: "黑咖啡只能解腻，不能减少已经吃下的糖和脂肪。\n真想轻一点，直接把甜品分一半更有效。" },
      { id: "B", label: "邀请朋友分一半，吃完一起散步十分钟", effect: { bloodSugar: 10, mood: 8, energy: -3, satiety: 10 }, isPreferred: true, knowledgeTags: ["甜品份量","餐后活动"], scienceTip: "甜品分一半直接减少份量，饭后轻松走走还能让肌肉参与葡萄糖利用。\n开心没有减半，负担先减了一点。" },
    ],
  },
  {
    id: 32, group: "afternoon", title: "想喝汽水", description: "想喝点有味道的东西。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "100%果汁没有额外加糖，选一瓶果汁气泡饮", effect: { bloodSugar: 25, mood: 12, energy: 0, satiety: 3 }, isPreferred: false, knowledgeTags: ["含糖饮料","食品标签"], scienceTip: "100%果汁可以没有额外加糖，但水果本身的糖仍在，榨汁后也更容易喝快。\n“没有添加”不等于“没有”。" },
      { id: "B", label: "想喝气泡口感，选一瓶无糖柠檬苏打水", effect: { bloodSugar: 0, mood: 0, energy: 8, satiety: 4 }, isPreferred: true, knowledgeTags: ["含糖饮料","食品标签"], scienceTip: "无糖柠檬苏打水保留味道和气泡，却没有再叠加一瓶果汁的糖。\n想喝点有趣的，气泡不一定要带糖。" },
    ],
  },
  {
    id: 33, group: "afternoon", title: "嘴馋", description: "嘴巴很馋，又没到饭点。",
    image: "/images/s-tea.png",
    choices: [
      { id: "A", label: "苏打饼干清淡不甜，拿三片垫一垫", effect: { bloodSugar: 24, mood: 18, energy: -5, satiety: 10 }, isPreferred: false, knowledgeTags: ["精制淀粉","饥饿觉察"], scienceTip: "苏打饼干清淡不甜，主体仍是精制面粉和油脂。\n先给冲动十分钟；还真饿，就吃一份有蛋白质的加餐。" },
      { id: "B", label: "早餐刚吃过，先喝水离开工位十分钟，还饿再加餐", effect: { bloodSugar: 0, mood: 0, energy: 4, satiety: 12 }, isPreferred: true, knowledgeTags: ["精制淀粉","饥饿觉察"], scienceTip: "早餐刚吃过，先换个环境等十分钟，能帮你分清饥饿和习惯。\n还饿就正常加餐，不需要一直忍。" },
    ],
  },
  {
    id: 34, group: "afternoon", title: "压力爆发", description: "压力太大，情绪快绷不住了。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "低糖冰淇淋份量不大，边吃边把工作做完", effect: { bloodSugar: 30, mood: 27, energy: -13, satiety: 10 }, isPreferred: false, knowledgeTags: ["压力进食","含糖食物"], scienceTip: "“低糖”冰淇淋仍可能含糖和脂肪，边工作边吃也容易忽略份量。\n冰淇淋不是坏人，压力一来就自动开盒才值得留意。" },
      { id: "B", label: "下楼买杯无糖茶，走十分钟换换脑子", effect: { bloodSugar: 0, mood: 10, energy: 13, satiety: 0 }, isPreferred: true, knowledgeTags: ["压力进食","含糖食物"], scienceTip: "先走十分钟，是把压力和进食暂时分开，也不会增加糖负荷。\n回来还想吃，就坐下来认真吃一小份。" },
    ],
  },
  {
    id: 35, group: "afternoon", title: "饥饿救急", description: "肚子在抗议，需要点东西救急。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "胡萝卜和芹菜低卡又有纤维，吃一盒撑到晚饭", effect: { bloodSugar: 5, mood: 16, energy: -4, satiety: 10 }, isPreferred: false, knowledgeTags: ["饥饿觉察","混合餐搭配"], scienceTip: "蔬菜条适合轻微嘴馋，真饿时却缺少足够蛋白质和能量。\n别让“低卡”把下午的饥饿越拖越大。" },
      { id: "B", label: "吃一杯无糖酸奶，配一小把坚果", effect: { bloodSugar: 5, mood: 8, energy: 12, satiety: 20 }, isPreferred: true, knowledgeTags: ["饥饿觉察","混合餐搭配"], scienceTip: "无糖酸奶和少量坚果补上蛋白质与脂肪，通常比只啃蔬菜更耐饿。\n小小一份，足够把晚饭前接住。" },
    ],
  },
  {
    id: 36, group: "afternoon", title: "饭后两小时", description: "中午吃完大碗牛肉面两小时后，你突然心慌、饥饿、犯困，手机里能查看这一餐的 CGM 曲线。",
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "凭感觉判断是血糖低了，先吃两块夹心饼干", effect: { bloodSugar: 29, mood: 18, energy: -14, satiety: 10 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理","餐后反应"], scienceTip: "大碗面后心慌犯困，可能来自吃多、疲劳或快速波动，不等于低血糖。\n先看CGM再补糖，别给原有曲线再叠一层。" },
      { id: "B", label: "先坐下看 CGM 数值和趋势，再决定是否补糖", effect: { bloodSugar: 0, mood: 0, energy: 13, satiety: 18 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理","餐后反应"], scienceTip: "先看CGM数值和趋势，才能判断是否真的需要补糖。\n身体感受很重要，但这一次让数据帮忙分辨。" },
    ],
  },
  {
    id: 37, group: "afternoon", title: "CGM 报警", description: "你的 CGM 报警，显示 3.8 mmol/L，同时出现强烈眩晕。",
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "坚果更健康，抓一把花生和核桃慢慢补", effect: { bloodSugar: -13, mood: -10, energy: -10, satiety: 14 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理"], lowSugarRisk: true, scienceTip: "确认低血糖并眩晕时，坚果里的脂肪、蛋白质会让补糖来得太慢。\n应补约15克快速碳水，15分钟后复测；意识异常立即急救。" },
      { id: "B", label: "按“15-15 法则”补约 15 克快速碳水，再复测", effect: { bloodSugar: 16, mood: 5, energy: 14, satiety: 0 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理"], scienceTip: "已测到3.8 mmol/L并眩晕，应按“15-15法则”补快速碳水。\n15分钟后复测，仍低再重复；不能吞咽或意识异常时立即急救。" },
    ],
  },
  {
    id: 38, group: "afternoon", title: "补糖十五分钟后", description: "（接上题）补糖 15 分钟后，眩晕感消失了，但胃里仍觉得空。",
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "症状没了但胃还空，吃一根全麦能量棒预防再低", effect: { bloodSugar: 20, mood: 8, energy: 0, satiety: 15 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理"], scienceTip: "症状缓解不等于数值已经恢复，直接加能量棒可能补多了。\n先复测：仍低继续快速补糖；已恢复且离正餐远，再加小份慢碳水和蛋白质。" },
      { id: "B", label: "先看复测结果，再决定是否补第二轮或正常加餐", effect: { bloodSugar: 1, mood: 5, energy: 10, satiety: 19 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理"], scienceTip: "先复测，才能分清“仍然低”和“已经恢复但需要续航”。\n仍低继续快速补糖；已恢复且离正餐远，再补一份小加餐。" },
    ],
  },
  {
    id: 39, group: "afternoon", title: "逛街的隐形消耗", description: "周末逛街走了整整 15000 步，下午 4 点，你感到腿肚子发软，脾气异常暴躁。",
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "走了一万五千步该补能，选少糖燕麦奶茶加芋圆", effect: { bloodSugar: 33, mood: 28, energy: -11, satiety: 22 }, isPreferred: false, knowledgeTags: ["运动与补能","含糖饮料"], scienceTip: "少糖奶茶加芋圆，把饮料糖、小料淀粉和杯量叠到了一起。\n走累了当然要补能量，只是别让一杯饮料变成隐藏大餐。" },
      { id: "B", label: "香蕉配原味酸奶，碳水和蛋白质都补一点", effect: { bloodSugar: 12, mood: 14, energy: 19, satiety: 20 }, isPreferred: true, knowledgeTags: ["运动与补能","含糖饮料"], scienceTip: "香蕉补容易利用的碳水，原味酸奶补蛋白质，份量也更容易掌握。\n逛街后的饿，用一份正常加餐接住就好。" },
    ],
  },
]

const DINNER_EVENTS: GameEvent[] = [
  {
    id: 40, group: "dinner", title: "晚餐主食", description: "晚餐想选个主食。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "糯玉米口感扎实，觉得会更耐饿", effect: { bloodSugar: 33, mood: 14, energy: -13, satiety: 33 }, isPreferred: false, knowledgeTags: ["淀粉类型","碳水份量"], scienceTip: "糯玉米的黏糯口感来自较多支链淀粉，通常比甜玉米消化得快，餐后血糖反应也更明显。\n记住：同类主食里，越黏糯的一般越容易升糖。" },
      { id: "B", label: "甜玉米水分更多，选一根配晚餐", effect: { bloodSugar: 15, mood: 1, energy: 10, satiety: 24 }, isPreferred: true, knowledgeTags: ["淀粉类型","碳水份量"], scienceTip: "甜玉米水分更多、淀粉相对更少，餐后血糖反应通常比糯玉米温和。\n想吃玉米可以优先选甜玉米，但它仍然要算作主食。" },
    ],
  },
  {
    id: 41, group: "dinner", title: "周末大餐", description: "周末大餐，朋友点了芝士烤饼。", weekendOnly: true,
    image: "/images/s-dinner-party.png",
    choices: [
      { id: "A", label: "烤饼里有肉和芝士，吃三小块就不再点别的主食", effect: { bloodSugar: 27, mood: 32, energy: -23, satiety: 49 }, isPreferred: false, knowledgeTags: ["糖脂组合","碳水份量"], scienceTip: "没配米饭，不等于饼皮不是主食；芝士、饼皮和肉馅还是高脂高碳水组合。\n先来一块，别让“没吃饭”放大份量。" },
      { id: "B", label: "先吃一块烤饼配蔬菜，仍饿再加第二块", effect: { bloodSugar: 9, mood: 0, energy: 4, satiety: 20 }, isPreferred: true, knowledgeTags: ["糖脂组合","碳水份量"], scienceTip: "先吃一块配蔬菜，仍饿再加，让份量跟着饥饿走。\n芝士烤饼的峰值可能来得晚，不能只看当下感觉。" },
    ],
  },
  {
    id: 42, group: "dinner", title: "饭后的消食", description: "晚上吃了一顿丰盛的碳水大餐，决定做点什么补救一下。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "跑三公里把这顿碳水尽快消耗掉", effect: { bloodSugar: 22, mood: -10, energy: -24, satiety: -19 }, isPreferred: false, knowledgeTags: ["餐后活动","运动强度"], scienceTip: "刚吃饱就跑三公里，胃部不适可能先来，高强度还可能让血糖短暂上升。\n这顿饭不用马上“赎罪”，先轻轻动起来。" },
      { id: "B", label: "刚吃饱先洗碗拖地十分钟，晚点再正常运动", effect: { bloodSugar: 0, mood: 4, energy: -4, satiety: -5 }, isPreferred: true, knowledgeTags: ["餐后活动","运动强度"], scienceTip: "洗碗拖地属于饭后轻活动，能让肌肉参与葡萄糖利用，又不必顶着饱腹硬跑。\n家务这回真的算运动。" },
    ],
  },
  {
    id: 43, group: "dinner", title: "减肥晚餐", description: "想「少吃点」来减肥。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "西瓜热量低，吃一大盘再配坚果当晚餐", effect: { bloodSugar: 30, mood: 23, energy: -13, satiety: 19 }, isPreferred: false, knowledgeTags: ["水果代餐误区","混合餐搭配"], scienceTip: "一大盘西瓜仍是大量水果，坚果能补脂肪，却补不上完整正餐所需的蛋白质。\n晚餐只吃水果，看着轻，结构却偏科。" },
      { id: "B", label: "小碗杂粮饭配蔬菜和肉，水果留一小份餐后吃", effect: { bloodSugar: 14, mood: 0, energy: 14, satiety: 34 }, isPreferred: true, knowledgeTags: ["水果代餐误区","混合餐搭配"], scienceTip: "杂粮饭、蔬菜和肉组成正餐，水果留一小份餐后吃，碳水和蛋白质更清楚。\n水果不用下桌，只要别独挑大梁。" },
    ],
  },
  {
    id: 44, group: "dinner", title: "长辈的爱", description: "长辈坚持要你把一大碗白米饭吃完。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "不想浪费长辈心意，按盛好的份量把白米饭吃完", effect: { bloodSugar: 34, mood: 9, energy: -19, satiety: 53 }, isPreferred: false, knowledgeTags: ["碳水份量","饱腹觉察"], overfull: true, scienceTip: "把大碗米饭全部吃完，也等于把这份米饭的碳水全部接下。\n长辈的爱可以收下，吃到舒服就停也不失礼。" },
      { id: "B", label: "先吃菜和肉，米饭吃到舒服，剩下请长辈打包", effect: { bloodSugar: 14, mood: 0, energy: 10, satiety: 38 }, isPreferred: true, knowledgeTags: ["碳水份量","饱腹觉察"], scienceTip: "先菜肉、米饭吃到舒服再打包，纤维和蛋白质先到场，份量也回到自己手里。\n爱没有浪费，饭留到下一顿。" },
    ],
  },
  {
    id: 45, group: "dinner", title: "饭局饮酒", description: "饭局上，大家在举杯。", weekendOnly: true,
    image: "/images/s-dinner-party.png",
    choices: [
      { id: "A", label: "先吃菜垫胃，觉得这样慢喝两杯啤酒问题不大", effect: { bloodSugar: 27, mood: 23, energy: -14, satiety: 18 }, isPreferred: false, knowledgeTags: ["酒精与血糖","社交选择"], scienceTip: "先吃菜比空腹好，却抵消不了两杯啤酒的酒精和碳水。\n酒精还可能带来延迟性低血糖，用药人群尤其要谨慎。" },
      { id: "B", label: "正常吃饭，只喝一小杯低度酒，其余换无糖苏打水", effect: { bloodSugar: 6, mood: 8, energy: 0, satiety: 4 }, isPreferred: true, knowledgeTags: ["酒精与血糖","社交选择"], scienceTip: "正常吃饭、酒留一小杯，再换无糖苏打水，真正减少了总酒量。\n能碰杯，也别把安全感全交给“先吃菜”。" },
    ],
  },
  {
    id: 46, group: "dinner", title: "厨房炒菜", description: "自己下厨炒菜。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "加两勺水淀粉收成浓汁，少放油也能好吃", effect: { bloodSugar: 23, mood: 18, energy: -4, satiety: 25 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","隐藏淀粉"], scienceTip: "水淀粉受热会糊化，浓芡会把更多淀粉和酱汁裹在每口菜上。\n少油不等于少碳水，芡也有自己的存在感。" },
      { id: "B", label: "只用半勺水淀粉做薄芡，让汁刚好挂住菜", effect: { bloodSugar: 7, mood: 0, energy: 10, satiety: 25 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","隐藏淀粉"], scienceTip: "半勺水淀粉做薄芡，既保留挂汁口感，也把额外淀粉控制在小份量。\n够亮、够味，就不用厚厚一层。" },
    ],
  },
  {
    id: 47, group: "dinner", title: "煲汤配菜", description: "一锅煲汤，配菜要怎么选？",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "山药、莲藕和芋头都是天然食材，每样夹一点", effect: { bloodSugar: 29, mood: 14, energy: -9, satiety: 34 }, isPreferred: false, knowledgeTags: ["碳水识别","混合餐搭配"], scienceTip: "山药、莲藕和芋头都含淀粉，炖软后糊化更充分，三样一起夹会叠出多份主食。\n天然食物也会“组团加量”。" },
      { id: "B", label: "选一种根茎当主食，再配排骨和绿叶菜", effect: { bloodSugar: 7, mood: 0, energy: 14, satiety: 34 }, isPreferred: true, knowledgeTags: ["碳水识别","混合餐搭配"], scienceTip: "山药、莲藕和芋头都含淀粉，炖软后也更容易消化，不能全当蔬菜。\n选一种当主食，再配排骨和绿叶菜就够了。" },
    ],
  },
  {
    id: 48, group: "dinner", title: "减脂晚餐", description: "减脂期的晚饭，严格还是放一点松？",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "水煮鸡胸和西兰花，配零脂酱，尽量把热量压低", effect: { bloodSugar: 5, mood: -27, energy: -13, satiety: 21 }, isPreferred: false, knowledgeTags: ["可持续饮食","混合餐搭配"], scienceTip: "水煮鸡胸、西兰花和零脂酱很清淡，却可能让晚餐很快又饿。\n控糖不是把油和主食全部请出门。" },
      { id: "B", label: "少量橄榄油调味，配一小份杂粮，把它当正常晚饭", effect: { bloodSugar: 10, mood: 10, energy: 14, satiety: 30 }, isPreferred: true, knowledgeTags: ["可持续饮食","混合餐搭配"], scienceTip: "少量橄榄油改善口感，小份杂粮补适量碳水，鸡胸和西兰花负责蛋白质、纤维。\n完整的一餐，反而更容易坚持。" },
    ],
  },
  {
    id: 49, group: "dinner", title: "火锅局", description: "吃火锅，锅里沸腾着。",
    image: "/images/s-dinner-party.png",
    choices: [
      { id: "A", label: "蔬菜多就不点主食，再夹炸腐竹和鱼丸增加饱腹", effect: { bloodSugar: 24, mood: 14, energy: -5, satiety: 26 }, isPreferred: false, knowledgeTags: ["火锅搭配","隐藏糖与油脂"], scienceTip: "不点米饭不等于没有碳水，炸腐竹、鱼丸和蘸料里仍可能藏着淀粉和糖。\n火锅最会藏东西，先把主食摆到明面上。" },
      { id: "B", label: "蔬菜菌菇、瘦肉豆腐，再加半份主食", effect: { bloodSugar: 10, mood: 8, energy: 15, satiety: 35 }, isPreferred: true, knowledgeTags: ["火锅搭配","隐藏糖与油脂"], scienceTip: "炸腐竹、鱼丸和甜蘸料可能藏着淀粉、糖和脂肪，没点米饭也不等于没有碳水。\n多选蔬菜和瘦肉，再把主食留成明确的半份。" },
    ],
  },
  {
    id: 50, group: "dinner", title: "晚间动感单车", description: "晚上 8 点你还没吃晚饭，但预定的高强度动感单车课要开始了。",
    image: "/images/s-exercise.png",
    choices: [
      { id: "A", label: "空腹训练能多燃脂，先上完课再吃晚饭", effect: { bloodSugar: -17, mood: -19, energy: -29, satiety: -19 }, isPreferred: false, knowledgeTags: ["运动与补能","规律进餐"], lowSugarRisk: true, scienceTip: "错过晚饭再空腹上高强度课，可能先换来没力气和动作不稳。\n多燃一点脂肪的想象，不值得拿训练安全去赌。" },
      { id: "B", label: "怕训练时没力气，课前吃一根香蕉稍作消化", effect: { bloodSugar: 10, mood: 10, energy: 23, satiety: 10 }, isPreferred: true, knowledgeTags: ["运动与补能","规律进餐"], scienceTip: "课前香蕉补一点容易利用的碳水，不是正式晚饭，也不会吃得太撑。\n稍微垫一下，再按身体感受开练。" },
    ],
  },
  {
    id: 51, group: "dinner", title: "极寒的考验", description: "冬天在户外等了半小时公交车，被冻得瑟瑟发抖，身体热量大量流失。",
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "先到室内取暖，再吃一个热红薯补能量", effect: { bloodSugar: 19, mood: 19, energy: 14, satiety: 20 }, isPreferred: true, knowledgeTags: ["寒冷与补能","碳水作用"], scienceTip: "先避风取暖，再吃热红薯补碳水，能接住发抖时增加的能量消耗。\n若持续剧烈发抖、动作笨拙或反应变慢，要警惕失温并求助。" },
      { id: "B", label: "担心晚餐前再加碳水，先喝温水等回家", effect: { bloodSugar: -11, mood: -14, energy: -18, satiety: 4 }, isPreferred: false, knowledgeTags: ["寒冷与补能","碳水作用"], lowSugarRisk: true, scienceTip: "温水能让身体舒服，却不能提供冷到发抖时需要的能量。\n先取暖并补碳水；持续剧烈发抖、动作笨拙或反应变慢，要及时求助。" },
    ],
  },
]

const EVENING_EVENTS: GameEvent[] = [
  {
    id: 52, group: "evening", title: "夜间运动", description: "晚上想打羽毛球锻炼。",
    image: "/images/s-exercise.png",
    choices: [
      { id: "A", label: "空腹打球身体更轻，结束后再和大家吃夜宵", effect: { bloodSugar: -15, mood: 8, energy: -27, satiety: -10 }, isPreferred: false, knowledgeTags: ["运动与补能","规律进餐"], lowSugarRisk: true, scienceTip: "离上一餐很久还空腹打球，精力和动作稳定可能先受影响。\n轻装上阵不是空着油箱，运动前可以小补一点。" },
      { id: "B", label: "上场前吃香蕉配原味酸奶，稍作消化再开始", effect: { bloodSugar: 10, mood: 14, energy: 27, satiety: 5 }, isPreferred: true, knowledgeTags: ["运动与补能","规律进餐"], scienceTip: "香蕉补碳水、原味酸奶补蛋白质，是一份容易掌握的运动前加餐。\n不用吃到饱，给球局一点燃料就够。" },
    ],
  },
  {
    id: 53, group: "evening", title: "睡前饿了", description: "午夜，真的饿得睡不着。",
    image: "/images/s-bedtime.png",
    choices: [
      { id: "A", label: "一小碗阳春面不算多，再喝半杯果汁助消化", effect: { bloodSugar: 27, mood: 26, energy: -8, satiety: 37 }, isPreferred: false, knowledgeTags: ["夜间加餐","混合餐搭配"], scienceTip: "阳春面已经有精制淀粉，再配果汁，会把两路快速碳水叠在睡前。\n夜宵不是不能吃，别一口气开两条碳水通道。" },
      { id: "B", label: "吃一小杯原味酸奶，配半片全麦面包", effect: { bloodSugar: 8, mood: 5, energy: 10, satiety: 15 }, isPreferred: true, knowledgeTags: ["夜间加餐","混合餐搭配"], scienceTip: "小杯原味酸奶配半片全麦面包，有蛋白质和适量碳水，也不必吃撑。\n真饿得睡不着，小份夜宵比硬忍更实际。" },
    ],
  },
  {
    id: 54, group: "evening", title: "打球后", description: "打完球，满身大汗。",
    image: "/images/s-exercise.png",
    choices: [
      { id: "A", label: "球局结束就坐车回家，打算洗完澡再喝水", effect: { bloodSugar: 4, mood: 4, energy: -6, satiety: -5 }, isPreferred: false, knowledgeTags: ["运动恢复","餐后活动"], scienceTip: "运动后立刻坐车、晚些再补水，会错过观察头晕、心慌等反应的缓冲。\n先别急着走，给身体五分钟收尾。" },
      { id: "B", label: "先慢走五分钟并补水，确认身体舒服再回家", effect: { bloodSugar: 0, mood: 6, energy: 5, satiety: -5 }, isPreferred: true, knowledgeTags: ["运动恢复","餐后活动"], scienceTip: "慢走五分钟并补水，让心率逐步下来，也方便确认身体状态。\n这段冷却不是拖延，是训练的最后一步。" },
    ],
  },
  {
    id: 55, group: "evening", title: "练后加餐", description: "刚举完铁，想补充营养。",
    image: "/images/s-bedtime.png",
    choices: [
      { id: "A", label: "训练后有“黄金窗口”，马上喝一份香草增肌粉", effect: { bloodSugar: 29, mood: 14, energy: -6, satiety: 19 }, isPreferred: false, knowledgeTags: ["运动营养","快速碳水"], scienceTip: "训练后补蛋白质有价值，但没有窄到几分钟内必须喝粉的“黄金窗口”。\n先看配料和全天摄入，别被倒计时催着下单。" },
      { id: "B", label: "先看配料和全天蛋白，需要时再选无糖奶或配料简单的蛋白粉", effect: { bloodSugar: 5, mood: 0, energy: 18, satiety: 24 }, isPreferred: true, knowledgeTags: ["运动营养","快速碳水"], scienceTip: "先看全天蛋白和配料，再决定是否补充，比盲追“黄金窗口”更可靠。\n需要时选无糖奶或配料简单的蛋白粉。" },
    ],
  },
  {
    id: 56, group: "evening", title: "补剂选择", description: "睡前要不要补点什么？",
    image: "/images/s-bedtime.png",
    choices: [
      { id: "A", label: "先把镁片吃了，再刷半小时手机放松", effect: { bloodSugar: 0, mood: 5, energy: -12, satiety: 0 }, isPreferred: false, knowledgeTags: ["睡眠与血糖","补剂误区"], scienceTip: "镁片不能替你睡掉接下来的半小时，补剂和晚睡处理的不是同一件事。\n先关屏睡觉，通常比边刷手机边找补剂更直接。" },
      { id: "B", label: "今晚先不加补剂，按原计划关灯睡觉", effect: { bloodSugar: 0, mood: 8, energy: 15, satiety: 0 }, isPreferred: true, knowledgeTags: ["睡眠与血糖","补剂误区"], scienceTip: "按计划关灯，直接保护了睡眠时长和节律；它们也会影响第二天的血糖和食欲。\n今晚最朴素的选择，反而最有效。" },
    ],
  },
  {
    id: 57, group: "evening", title: "睡前奶制品", description: "睡前有点饿，想来一份奶制品。",
    image: "/images/s-bedtime.png",
    choices: [
      { id: "A", label: "低脂调味奶脂肪少，热一大杯当夜宵", effect: { bloodSugar: 25, mood: 10, energy: -5, satiety: 12 }, isPreferred: false, knowledgeTags: ["乳制品","食品标签"], scienceTip: "低脂调味奶少了脂肪，一大杯里的乳糖、添加糖和总碳水却仍要计算。\n“低脂”只回答了一个问题，别让它替整瓶作答。" },
      { id: "B", label: "吃一小杯无添加糖原味酸奶解饿", effect: { bloodSugar: 5, mood: 0, energy: 14, satiety: 23 }, isPreferred: true, knowledgeTags: ["乳制品","食品标签"], scienceTip: "原味酸奶也含乳糖，但没有额外叠加游离糖，小杯份量也更清楚。\n睡前选奶制品，先看添加糖和实际份量。" },
    ],
  },
  {
    id: 58, group: "evening", title: "回家路上", description: "周五应酬没吃主食，空腹喝了几杯白酒。回家路上突然直冒冷汗，手抖得拿不住手机。", weekendOnly: true,
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "先吃一碗热肥肠粉，感觉缓和就自己回家睡", effect: { bloodSugar: -9, mood: 14, energy: -9, satiety: 38 }, isPreferred: false, knowledgeTags: ["酒精与血糖","低血糖识别与处理"], lowSugarRisk: true, scienceTip: "空腹饮酒后冷汗手抖，要警惕酒精抑制肝脏输出葡萄糖；肥肠粉又会让补糖来得慢。\n别独自睡下，应补快速碳水并测量；意识异常立即急救。" },
      { id: "B", label: "先联系朋友陪同，补快速碳水并尽快测量或求助", effect: { bloodSugar: 18, mood: 5, energy: 10, satiety: 5 }, isPreferred: true, knowledgeTags: ["酒精与血糖","低血糖识别与处理"], scienceTip: "先找人陪同、补快速碳水并尽快测量，比独自回家睡更安全。\n不能吞咽或意识异常时不要强喂，应立即呼叫急救。" },
    ],
  },
]

// All events pool grouped
export const EVENT_POOL = {
  breakfast: BREAKFAST_EVENTS,
  lunch: LUNCH_EVENTS,
  afternoon: AFTERNOON_EVENTS,
  dinner: DINNER_EVENTS,
  evening: EVENING_EVENTS,
}

/** 按 id 从当前事件池取最新事件（用于读档时刷新 image 等字段） */
export function getEventById(id: number): GameEvent | null {
  for (const group of (["breakfast", "lunch", "afternoon", "dinner", "evening"] as const)) {
    const found = EVENT_POOL[group].find((e) => e.id === id)
    if (found) return found
  }
  return null
}

// 在第 2～7 天中随机选择一天，把更容易走向低血糖的事件集中在那一天。
const LOW_SUGAR_DAY_EVENT_IDS: Record<EventGroup, number[]> = {
  breakfast: [1, 10, 11],
  lunch: [19, 25],
  afternoon: [27, 36, 37, 38, 39],
  dinner: [50, 51],
  evening: [53, 58],
}

export function createSpecialLowSugarDay(): number {
  return Math.floor(Math.random() * 6) + 2
}

export function isLowSugarFocusDay(dayNumber: number, specialLowSugarDay: number): boolean {
  return dayNumber === specialLowSugarDay
}

const GROUP_ORDER: EventGroup[] = ["breakfast", "lunch", "afternoon", "dinner", "evening"]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleChoicesForEvent(event: GameEvent): GameEvent {
  // 50% 交换 AB 顺序，使「更优选项」出现在 A 或 B 的概率相当，避免选 B 更优概率偏高
  const [a, b] = event.choices
  return Math.random() < 0.5 ? event : { ...event, choices: [b, a] }
}

/** Draw one from pool without replacement; reshuffle pool when exhausted. Respects weekday/weekend flags. */
function pickOne(
  pool: GameEvent[],
  usedIds: Set<number>,
  isWeekend: boolean,
  usedImagesForDay?: Set<string>
): GameEvent {
  const filterByDay = (events: GameEvent[]): GameEvent[] =>
    events.filter((e) => {
      if (usedIds.has(e.id)) return false
      if (isWeekend && e.weekdayOnly) return false
      if (!isWeekend && e.weekendOnly) return false
      return true
    })

  const filterByImage = (events: GameEvent[]): GameEvent[] => {
    if (!usedImagesForDay) return events
    return events.filter((e) => !usedImagesForDay.has(e.image))
  }

  let available = filterByDay(pool)
  let candidates = filterByImage(available)

  if (candidates.length === 0) {
    // 如果因为图片去重导致没有可选事件，则允许同图但仍遵守日期/已用ID规则
    candidates = available
  }

  if (candidates.length === 0) {
    // 所有事件都用完了，重置 usedIds 后再来一轮
    pool.forEach((e) => usedIds.delete(e.id))
    available = filterByDay(pool)
    candidates = filterByImage(available)
    if (candidates.length === 0) {
      // Fallback: ignore usedIds/day flags to avoid硬崩溃，理论上不会走到这里
      candidates = [...pool]
    }
  }

  const event = shuffle(candidates)[0]
  usedIds.add(event.id)
  if (usedImagesForDay) usedImagesForDay.add(event.image)
  return shuffleChoicesForEvent(event)
}

function pickOneForGroup(
  group: EventGroup,
  usedIds: Set<number>,
  isWeekend: boolean,
  isLowSugarFocusDay: boolean,
  usedImagesForDay: Set<string>
): GameEvent {
  const basePool = EVENT_POOL[group]
  const lowSugarIds = LOW_SUGAR_DAY_EVENT_IDS[group] ?? []

  let poolToUse: GameEvent[]

  if (isLowSugarFocusDay) {
    // 低血糖集中日：优先使用低血糖相关事件
    const focused = basePool.filter((e) => lowSugarIds.includes(e.id))
    poolToUse = focused.length > 0 ? focused : basePool
  } else {
    // 非低血糖日：优先使用非低血糖事件，避免到处都在低血糖
    const nonLow = basePool.filter((e) => !lowSugarIds.includes(e.id))
    poolToUse = nonLow.length > 0 ? nonLow : basePool
  }

  return pickOne(poolToUse, usedIds, isWeekend, usedImagesForDay)
}

/** Day queue: 5 slots [breakfast, lunch, afternoon?, dinner, evening?]. Afternoon/evening 50% null. */
export function generateDayQueue(usedIds: Set<number>, dayNumber: number, specialLowSugarDay: number): {
  queue: (GameEvent | null)[]
  eveningSkipped: boolean
} {
  const isWeekend = dayNumber >= 6
  const isLowSugarFocusDay = dayNumber === specialLowSugarDay
  const queue: (GameEvent | null)[] = []
  const usedImagesForDay = new Set<string>()

  // 早餐也完全走统一的随机逻辑，不再强制周一固定为事件 1
  queue[0] = pickOneForGroup("breakfast", usedIds, isWeekend, isLowSugarFocusDay, usedImagesForDay)

  queue[1] = pickOneForGroup("lunch", usedIds, isWeekend, isLowSugarFocusDay, usedImagesForDay)
  queue[2] =
    Math.random() < 0.5
      ? pickOneForGroup("afternoon", usedIds, isWeekend, isLowSugarFocusDay, usedImagesForDay)
      : null
  if (queue[2]) usedImagesForDay.add(queue[2]!.image)

  queue[3] = pickOneForGroup("dinner", usedIds, isWeekend, isLowSugarFocusDay, usedImagesForDay)
  queue[4] =
    Math.random() < 0.5
      ? pickOneForGroup("evening", usedIds, isWeekend, isLowSugarFocusDay, usedImagesForDay)
      : null
  const eveningSkipped = queue[4] === null
  return { queue, eveningSkipped }
}

// ==========================================
// v2.3 Nightly Settlement (4-tier)
// ==========================================

export interface NightlyReport {
  tier: "perfect" | "hangover" | "normal"
  hungerInsomnia: boolean
  energyDelta: number
  moodDelta: number
  sleepBloodSugar: number
  notes: string[]
}

export function computeNightlyReport(stats: GameStats): NightlyReport {
  const sleepBs = stats.bloodSugar
  const sleepSatiety = stats.satiety

  let energyResult = stats.energy
  let moodDelta = 0
  const notes: string[] = []
  let tier: "perfect" | "hangover" | "normal" = "normal"

  if (sleepBs >= 80) {
    tier = "hangover"
    energyResult = Math.min(100, stats.energy + 15)
    moodDelta += -15
    notes.push("糖宿醉! 今晚可能睡得不够安稳")
  } else if (sleepBs >= 40 && sleepBs <= 60) {
    tier = "perfect"
    energyResult = 100
    moodDelta += 15
    notes.push("完美控糖! 血糖完美入眠，神清气爽")
  } else {
    tier = "normal"
    energyResult = Math.min(100, stats.energy + 40)
    moodDelta += -5
    notes.push("常规恢复，打工人的普通一夜")
  }

  const hungerInsomnia = sleepSatiety <= 20
  if (hungerInsomnia) {
    moodDelta += -15
    notes.push("饥饿失眠! 空着肚子根本睡不着")
  }

  return {
    tier,
    hungerInsomnia,
    energyDelta: energyResult - stats.energy,
    moodDelta,
    sleepBloodSugar: sleepBs,
    notes,
  }
}

export function applyDayEndDecay(stats: GameStats): GameStats {
  const report = computeNightlyReport(stats)

  return {
    bloodSugar: 45,   // reset to 45
    satiety: 20,      // reset to 20
    energy: Math.max(0, Math.min(100, stats.energy + report.energyDelta)),
    mood: Math.max(0, Math.min(100, stats.mood + report.moodDelta)),
  }
}

// Legacy export
export const GAME_EVENTS = BREAKFAST_EVENTS

// v2.3 death messages
export type GameOverReason = "bloodSugarHigh" | "bloodSugarLow" | "moodZero" | "energyZero"

export const GAME_OVER_MESSAGES: Record<GameOverReason, { title: string; subtitle: string }> = {
  bloodSugarHigh: { title: "高糖危机", subtitle: "模拟状态彻底失控，这一局到此结束" },
  bloodSugarLow:  { title: "低糖危机", subtitle: "模拟状态跌破安全线，这一局到此结束" },
  moodZero:       { title: "精神崩溃", subtitle: "极度压抑后的报复性暴食，身体和心灵同时举白旗" },
  energyZero:     { title: "过劳晕倒", subtitle: "身体发出了最后的警报，你倒在了去便利店的路上" },
}

// v2.3 Death: blood sugar > 100 (NOT >=100), blood sugar <= LOW_BS_DEATH, energy <= 0, mood <= 0
// 普通日与低血糖日使用不同的低血糖死亡线
const LOW_BS_DEATH_NORMAL = 22
const LOW_BS_DEATH_FOCUS = 29

function getLowBsDeathThreshold(isLowSugarFocusDay: boolean): number {
  return isLowSugarFocusDay ? LOW_BS_DEATH_FOCUS : LOW_BS_DEATH_NORMAL
}

export function checkGameOver(
  stats: GameStats,
  opts?: { isLowSugarFocusDay?: boolean }
): { isOver: boolean; reason: GameOverReason } | null {
  const isLowSugar = opts?.isLowSugarFocusDay ?? false
  const threshold = getLowBsDeathThreshold(isLowSugar)
  if (stats.bloodSugar > 100) return { isOver: true, reason: "bloodSugarHigh" }
  if (stats.bloodSugar <= threshold) return { isOver: true, reason: "bloodSugarLow" }
  if (stats.mood <= 0) return { isOver: true, reason: "moodZero" }
  if (stats.energy <= 0) return { isOver: true, reason: "energyZero" }
  return null
}

export const BALANCE_POLICY = {
  firstDayGraceCount: 1,
  firstDayHighRescueTo: 90,
  firstDayLowRescueTo: 35,
  firstDayEnergyRescueTo: 15,
  firstDayMoodRescueTo: 15,
  lowSugarDeathMinRiskActions: 2,
  nonRiskLowRescueTo: 35,
} as const

export function canTriggerLowSugarDeath(lowSugarRiskCount: number): boolean {
  return lowSugarRiskCount >= BALANCE_POLICY.lowSugarDeathMinRiskActions
}

export function rescueFromBoundary(
  rawStats: GameStats,
  reason: GameOverReason,
  mode: "firstDay" | "nonRiskLow"
): GameStats {
  const rescued = { ...rawStats }
  if (reason === "bloodSugarHigh") rescued.bloodSugar = BALANCE_POLICY.firstDayHighRescueTo
  if (reason === "bloodSugarLow") {
    rescued.bloodSugar = mode === "firstDay"
      ? BALANCE_POLICY.firstDayLowRescueTo
      : BALANCE_POLICY.nonRiskLowRescueTo
  }
  if (reason === "energyZero") rescued.energy = BALANCE_POLICY.firstDayEnergyRescueTo
  if (reason === "moodZero") rescued.mood = BALANCE_POLICY.firstDayMoodRescueTo
  return {
    bloodSugar: clamp(rescued.bloodSugar),
    mood: clamp(rescued.mood),
    energy: clamp(rescued.energy),
    satiety: clamp(rescued.satiety),
  }
}

// Pure function: compute full next state from choice. Death uses raw values before clamp.
export interface ChoiceResultSuccess {
  nextStats: GameStats
  nextTrackers: GameTrackers
  pendingTip: { choiceLabel: string; scienceTip: string; effect: Effect; penalty: PostChoicePenalty }
  penaltyFloaty?: string
}

export interface ChoiceResultDeath {
  deathReason: GameOverReason
  rawStats: GameStats
}

export function computeChoiceResult(
  prevStats: GameStats,
  prevTrackers: GameTrackers,
  choice: Pick<Choice, "label" | "effect" | "scienceTip" | "overfull">,
  preEffect?: Effect,
  opts?: { isLowSugarFocusDay?: boolean }
): ChoiceResultSuccess | ChoiceResultDeath {
  const isLowSugar = opts?.isLowSugarFocusDay ?? false
  const threshold = getLowBsDeathThreshold(isLowSugar)
  let raw = applyEffectRaw(prevStats, preEffect ?? {})
  raw = applyEffectRaw(raw, choice.effect)

  if (raw.bloodSugar > 100) return { deathReason: "bloodSugarHigh", rawStats: raw }
  if (raw.bloodSugar <= threshold) return { deathReason: "bloodSugarLow", rawStats: raw }
  if (raw.energy <= 0) return { deathReason: "energyZero", rawStats: raw }
  if (raw.mood <= 0) return { deathReason: "moodZero", rawStats: raw }

  let s = { ...raw }
  const penalty: PostChoicePenalty = { foodComa: false, starvation: false }
  let penaltyFloaty: string | undefined

  // 普通高蛋白/高纤维餐只代表“更耐饿”，不应自动等同于吃撑。
  // 只有文案明确表达硬撑，或累计饱腹真的溢出 100，才触发轻度过饱反馈。
  if (choice.overfull || s.satiety > 100) {
    penalty.foodComa = true
    penalty.penaltyFloaty = "😮‍💨 吃得有点撑，状态打了折扣"
    penaltyFloaty = penalty.penaltyFloaty
    s.satiety = Math.min(95, s.satiety)
    s.energy -= 8
    s.mood -= 5
  }
  if (s.satiety <= 0) {
    penalty.starvation = true
    penalty.penaltyFloaty = "😵 饿过头，状态开始失控！"
    penaltyFloaty = penalty.penaltyFloaty
    s.satiety = 10
    s.bloodSugar -= 5
    s.energy -= 10
    s.mood -= 8
  }

  const nextStats: GameStats = {
    bloodSugar: clamp(s.bloodSugar),
    energy: clamp(s.energy),
    mood: clamp(s.mood),
    satiety: clamp(s.satiety),
  }

  const nextTrackers: GameTrackers = {
    peakBsCount: prevTrackers.peakBsCount + (raw.bloodSugar >= 80 ? 1 : 0),
    foodComaCount: prevTrackers.foodComaCount + (penalty.foodComa ? 1 : 0),
    hangoverFreeDays: prevTrackers.hangoverFreeDays,
  }

  return {
    nextStats,
    nextTrackers,
    pendingTip: { choiceLabel: choice.label, scienceTip: choice.scienceTip, effect: choice.effect, penalty },
    penaltyFloaty,
  }
}

function clamp(v: number): number { return Math.max(0, Math.min(100, v)) }

/** Apply effect without clamping (for raw death check). */
export function applyEffectRaw(stats: GameStats, effect: Effect): GameStats {
  return {
    bloodSugar: stats.bloodSugar + (effect.bloodSugar ?? 0),
    mood: stats.mood + (effect.mood ?? 0),
    energy: stats.energy + (effect.energy ?? 0),
    satiety: stats.satiety + (effect.satiety ?? 0),
  }
}

export function applyEffect(stats: GameStats, effect: Effect): GameStats {
  return {
    bloodSugar: clamp(stats.bloodSugar + (effect.bloodSugar ?? 0)),
    mood: clamp(stats.mood + (effect.mood ?? 0)),
    energy: clamp(stats.energy + (effect.energy ?? 0)),
    satiety: clamp(stats.satiety + (effect.satiety ?? 0)),
  }
}

// 过饱 / 过饿的兜底规则。主流程会优先结合选项的 overfull 语义判断。
export interface PostChoicePenalty {
  foodComa: boolean
  starvation: boolean
  penaltyFloaty?: string
}

export function applyPostChoicePenalties(stats: GameStats): { stats: GameStats; penalty: PostChoicePenalty } {
  let s = { ...stats }
  const penalty: PostChoicePenalty = { foodComa: false, starvation: false }

  if (s.satiety > 100) {
    penalty.foodComa = true
    penalty.penaltyFloaty = "😮‍💨 吃得有点撑，状态打了折扣"
    s.satiety = 95
    s.energy = s.energy - 8
    s.mood = s.mood - 5
  }

  if (s.satiety <= 0) {
    penalty.starvation = true
    penalty.penaltyFloaty = "😵 饿过头，状态开始失控！"
    s.satiety = 10
    s.bloodSugar = s.bloodSugar - 5
    s.energy = s.energy - 10
    s.mood = s.mood - 8
  }

  s.bloodSugar = clamp(s.bloodSugar)
  s.energy = clamp(s.energy)
  s.mood = clamp(s.mood)
  s.satiety = clamp(s.satiety)
  return { stats: s, penalty }
}

// Inter-meal metabolism: blood sugar toward 45 (40% of gap, max 12).
// 普通日 vs 低血糖日使用不同的拉回/漂移参数。
export function applyInterMealMetabolism(
  stats: GameStats,
  opts?: { isLowSugarFocusDay?: boolean }
): GameStats {
  const CENTER = 45
  const isLowSugar = opts?.isLowSugarFocusDay ?? false
  let bsDelta: number
  if (stats.bloodSugar > CENTER) {
    bsDelta = -Math.min(12, Math.floor((stats.bloodSugar - CENTER) * 0.4))
  } else if (stats.bloodSugar >= 30) {
    if (isLowSugar) {
      // 低血糖日：回拉更弱，让轻度低血糖更容易持续
      bsDelta = Math.min(4, Math.floor((CENTER - stats.bloodSugar) * 0.15))
    } else {
      // 普通日：原先的较温和回拉
      bsDelta = Math.min(6, Math.floor((CENTER - stats.bloodSugar) * 0.2))
    }
  } else {
    if (isLowSugar) {
      // 低血糖日：<30 每步 -4，比普通日明显更容易跨过死亡线
      bsDelta = -4
    } else {
      // 普通日：<30 每步 -3，仍有危险，但相对温和
      bsDelta = -3
    }
  }

  return {
    bloodSugar: clamp(stats.bloodSugar + bsDelta),
    mood: stats.mood,
    energy: clamp(stats.energy - 4),
    satiety: clamp(stats.satiety - 12),
  }
}

export const STAT_CONFIG = [
  { key: "bloodSugar" as const, label: "血糖", emoji: "\u{1FA78}", color: "#e05a5a", bg: "#fde8e8" },
  { key: "mood" as const, label: "心情", emoji: "\u{1F60A}", color: "#f5c542", bg: "#fef6d4" },
  { key: "energy" as const, label: "精力", emoji: "\u{26A1}", color: "#5a9a6e", bg: "#e0f0e4" },
  { key: "satiety" as const, label: "饱腹", emoji: "\u{1F34A}", color: "#e8824a", bg: "#fdecd8" },
] as const
