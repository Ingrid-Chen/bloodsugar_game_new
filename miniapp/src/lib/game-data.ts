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
export const GAME_DATA_VERSION = "2026-09-04-v9"

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
      { id: "A", label: "当做轻断食，今天就不吃早餐啦", effect: { bloodSugar: -9, mood: -5, energy: -23, satiety: -19 }, isPreferred: false, knowledgeTags: ["规律进餐","混合餐搭配"], lowSugarRisk: true, scienceTip: "空腹拖到中午不会自动让血糖更稳，还可能让人饿得发急，下一餐吃得更多。\n赶时间也尽量补一点主食和蛋白质。" },
      { id: "B", label: "路上买根玉米，再带一盒牛奶", effect: { bloodSugar: 19, mood: 9, energy: 14, satiety: 20 }, isPreferred: true, knowledgeTags: ["规律进餐","混合餐搭配"], scienceTip: "玉米提供适量碳水，牛奶补蛋白质，能避免空腹过久，也让血糖上升更平缓。\n简单两样，就能把早餐接上。" },
    ],
  },
  {
    id: 2, group: "breakfast", title: "周末早餐", description: "难得周末，认真吃顿早饭。", weekendOnly: true,
    image: "/images/s-breakfast.jpg",
    choices: [
      { id: "A", label: "用两个橙子榨一杯鲜果汁，营养又健康", effect: { bloodSugar: 33, mood: 18, energy: -13, satiety: 9 }, isPreferred: false, knowledgeTags: ["水果形态","混合餐搭配"], scienceTip: "橙子榨汁后，原有的食物结构被破坏，又容易在短时间内喝下更多糖。\n糖吸收得更集中，餐后血糖也更容易快速上升。" },
      { id: "B", label: "吃两个水煮蛋，配两片全麦吐司", effect: { bloodSugar: 6, mood: 0, energy: 19, satiety: 26 }, isPreferred: true, knowledgeTags: ["水果形态","混合餐搭配"], scienceTip: "全麦吐司会提供碳水，鸡蛋的蛋白质和吐司里的纤维能让血糖上升慢一些。\n这顿不花哨，但更耐饿。" },
    ],
  },
  {
    id: 3, group: "breakfast", title: "妈妈的爱", description: "妈妈特意起早冲了一碗黑芝麻核桃糊。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "把这碗黑芝麻核桃糊全部喝完", effect: { bloodSugar: 33, mood: 14, energy: -9, satiety: 29 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","碳水份量"], scienceTip: "食物磨成细粉后，消化酶更容易接触淀粉，让它更快分解成葡萄糖。\n粉越细、喝得越多，餐后血糖越容易快速上升。" },
      { id: "B", label: "喝半碗芝麻核桃糊，再配一个水煮蛋", effect: { bloodSugar: 10, mood: 0, energy: 9, satiety: 19 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","碳水份量"], scienceTip: "粉糊减到半碗，直接减少了碳水；鸡蛋补蛋白质，也能让血糖上升更平缓。\n味道留下，份量换一下。" },
    ],
  },
  {
    id: 4, group: "breakfast", title: "面包房", description: "路过面包房，橱窗里摆着各种各样的面包。",
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "选包装写着“无糖全麦”的面包，配咖啡", effect: { bloodSugar: 30, mood: 9, energy: -8, satiety: 20 }, isPreferred: false, knowledgeTags: ["食品标签","混合餐搭配"], scienceTip: "“无糖”不等于没有淀粉，面包里的淀粉仍会分解成葡萄糖，让血糖上升。\n别只看包装大字，还要看配料表。" },
      { id: "B", label: "选全麦粉排第一的面包，配一枚鸡蛋", effect: { bloodSugar: 9, mood: 0, energy: 13, satiety: 28 }, isPreferred: true, knowledgeTags: ["食品标签","混合餐搭配"], scienceTip: "全麦粉排在配料表前面，通常纤维更多；配上鸡蛋，也能减缓餐后血糖上升。\n配料排位，比“无糖全麦”四个字靠谱。" },
    ],
  },
  {
    id: 5, group: "breakfast", title: "传统摊位", description: "街边传统早餐摊，豆浆飘香，油条刚出锅。",
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "无糖豆浆配两根油条，经典组合", effect: { bloodSugar: 29, mood: 23, energy: -10, satiety: 39 }, isPreferred: false, knowledgeTags: ["糖脂组合","碳水份量"], scienceTip: "两根油条是较大份的“精制淀粉＋油脂”，无糖豆浆不能抵消它带来的血糖负担。\n油条可以吃，别一次吃两根。" },
      { id: "B", label: "咸豆腐脑配一枚茶叶蛋，再吃半根油条", effect: { bloodSugar: 14, mood: 6, energy: 14, satiety: 34 }, isPreferred: true, knowledgeTags: ["糖脂组合","碳水份量"], scienceTip: "油条减到半根，碳水量先降下来；豆腐脑和鸡蛋补蛋白质，血糖也更平稳。\n传统早餐，换个比例就好。" },
    ],
  },
  {
    id: 6, group: "breakfast", title: "肠胃不适", description: "胃有点不舒服，需要吃点温和的。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "一大碗熬得软烂的白粥，配一点咸菜", effect: { bloodSugar: 33, mood: 14, energy: -13, satiety: 29 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","混合餐搭配"], scienceTip: "白粥越软烂，淀粉糊化越充分，越容易被分解成葡萄糖。\n消化越快，餐后血糖通常升得越快。" },
      { id: "B", label: "小碗白粥，配一份蒸蛋和一小碟嫩青菜", effect: { bloodSugar: 9, mood: 0, energy: 9, satiety: 19 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","混合餐搭配"], scienceTip: "小碗白粥先控制碳水量，蒸蛋和青菜再补蛋白质、纤维，让血糖上升慢一些。\n胃口和血糖都能照顾到。" },
    ],
  },
  {
    id: 7, group: "breakfast", title: "酒店自助", description: "酒店自助早餐，各种食物摆满台面。", weekendOnly: true,
    image: "/images/s-breakfast.jpg",
    choices: [
      { id: "A", label: "水果富含纤维，先盛满一盘水果再吃别的", effect: { bloodSugar: 27, mood: 18, energy: -4, satiety: 14 }, isPreferred: false, knowledgeTags: ["进食顺序","水果形态"], scienceTip: "水果也含糖，一大盘空腹吃下去，会让碳水集中，餐后血糖更容易快速上升。\n水果健康，也不是无限量。" },
      { id: "B", label: "这些水果糖分也要算进一餐，先吃蛋和蔬菜，最后留一小碟水果", effect: { bloodSugar: 14, mood: 6, energy: 19, satiety: 39 }, isPreferred: true, knowledgeTags: ["进食顺序","水果形态"], scienceTip: "先吃蛋和蔬菜，蛋白质和纤维能减缓后续糖的吸收，让餐后血糖更平缓。\n水果留成餐后小份就好。" },
    ],
  },
  {
    id: 8, group: "breakfast", title: "晨练", description: "想趁早晨运动，计划去跑步。",
    image: "/images/s-exercise.png",
    choices: [
      { id: "A", label: "空腹直接去跑步，控糖又燃脂", effect: { bloodSugar: 26, mood: 4, energy: -24, satiety: -15 }, isPreferred: false, knowledgeTags: ["运动与补能","规律进餐"], scienceTip: "饿着做高强度运动，血糖可能过低，也可能因压力激素短暂升高，状态并不一定更稳。\n身体已经喊饿，就别硬扛。" },
      { id: "B", label: "喝半杯牛奶，吃两口苹果再出发", effect: { bloodSugar: 6, mood: 5, energy: 14, satiety: 10 }, isPreferred: true, knowledgeTags: ["运动与补能","规律进餐"], scienceTip: "少量苹果补碳水，牛奶补蛋白质，能降低空腹运动时血糖过低和乏力的风险。\n垫几口，再安心出发。" },
    ],
  },
  {
    id: 9, group: "breakfast", title: "极简早餐", description: "想吃极简早餐，两个选择都看起来很健康。",
    image: "/images/s-breakfast.jpg",
    choices: [
      { id: "A", label: "燕麦富含膳食纤维，多泡一碗即食燕麦和蓝莓", effect: { bloodSugar: 32, mood: 14, energy: -7, satiety: 21 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","混合餐搭配"], scienceTip: "即食燕麦颗粒细、消化快，一大碗又把碳水集中起来，餐后血糖可能升得更快。\n“燕麦”两个字不是免检标签。" },
      { id: "B", label: "用黄油煎两个鸡蛋，配半个馒头", effect: { bloodSugar: 5, mood: 0, energy: 23, satiety: 34 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","混合餐搭配"], scienceTip: "半个馒头把碳水控制在一小份，鸡蛋补蛋白质，餐后血糖不容易猛冲。\n少量黄油主要负责口感。" },
    ],
  },
  {
    id: 10, group: "breakfast", title: "晨起的心慌", description: "早上刚睁眼，你突然觉得心跳加速，身体有轻微的颤抖。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "先洗漱出门，打算到了公司再吃早餐", effect: { bloodSugar: -11, mood: -19, energy: -28, satiety: -10 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理"], lowSugarRisk: true, scienceTip: "心慌手抖时继续空腹赶路，可能让血糖继续下降，也会把其他不适拖得更久。\n先坐下补少量碳水，持续不适要测量或求助。" },
      { id: "B", label: "先坐下吃半根香蕉，缓过来再准备早餐", effect: { bloodSugar: 10, mood: 5, energy: 14, satiety: 10 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理"], scienceTip: "半根香蕉能快速补一点碳水，帮助血糖回升，缓过来后还要接上正常早餐。\n心慌不一定就是低血糖，持续不适要测量。" },
    ],
  },
  {
    id: 11, group: "breakfast", title: "嘴巴很寂寞", description: "刚吃完早饭不到 1 个半小时，坐在电脑前的你突然觉得嘴巴很寂寞，总想找点吃的。",
    image: "/images/s-morning.png",
    choices: [
      { id: "A", label: "吃两块无糖苏打饼干，继续工作", effect: { bloodSugar: 19, mood: 9, energy: -5, satiety: 4 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理","饥饿觉察"], scienceTip: "无糖苏打饼干仍是精制淀粉，会让血糖上升；刚吃完早餐，嘴馋也不一定是缺糖。\n先等十分钟，真饿再加餐。" },
      { id: "B", label: "先喝杯水，十分钟后再判断要不要加餐", effect: { bloodSugar: 0, mood: 0, energy: 4, satiety: 9 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理","饥饿觉察"], scienceTip: "先喝水等十分钟，不会额外推高血糖，也能分清嘴馋和真正饥饿。\n如果还饿，再选酸奶、牛奶或坚果。" },
    ],
  },
]

const LUNCH_EVENTS: GameEvent[] = [
  {
    id: 12, group: "lunch", title: "减脂素食", description: "食堂里的「减脂素食」专区。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "土豆丝、藕片和南瓜各夹一份", effect: { bloodSugar: 34, mood: 14, energy: -14, satiety: 38 }, isPreferred: false, knowledgeTags: ["碳水识别","混合餐搭配"], scienceTip: "土豆、藕和南瓜属于淀粉类蔬菜，碳水明显高于绿叶菜，也要计入主食。\n三样一起夹，餐后血糖更容易升高。" },
      { id: "B", label: "绿叶菜、卤蛋，再配半份杂粮饭", effect: { bloodSugar: 5, mood: 0, energy: 9, satiety: 29 }, isPreferred: true, knowledgeTags: ["碳水识别","混合餐搭配"], scienceTip: "绿叶菜、鸡蛋配半份杂粮饭，碳水量更清楚，餐后血糖也更容易平稳。\n土豆、藕和南瓜则要算进主食。" },
    ],
  },
  {
    id: 13, group: "lunch", title: "外卖盖饭", description: "外卖盖饭到了，香气扑鼻。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "盖饭已经荤素都有，直接拌匀大口吃更省时间", effect: { bloodSugar: 29, mood: 18, energy: -10, satiety: 39 }, isPreferred: false, knowledgeTags: ["进食顺序","碳水份量"], scienceTip: "盖饭拌匀后更容易吃得又快又多，米饭和酱汁集中下肚，餐后血糖可能冲得更高。\n赶时间，也别一口气扫光。" },
      { id: "B", label: "先吃配菜和肉，再把米饭分成两次慢慢吃", effect: { bloodSugar: 14, mood: 0, energy: 14, satiety: 39 }, isPreferred: true, knowledgeTags: ["进食顺序","碳水份量"], scienceTip: "这叫“碳水后置”：先吃蔬菜和蛋白质，再吃米饭。\n同样一顿饭，餐后血糖峰值通常会更低。" },
    ],
  },
  {
    id: 14, group: "lunch", title: "汤泡饭", description: "米饭有点干，旁边有一大碗汤。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "米饭太干，用热汤泡软，觉得这样更好消化", effect: { bloodSugar: 31, mood: 18, energy: -14, satiety: 39 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","进食速度"], scienceTip: "米饭泡汤后吸水变软，更容易少嚼、吃快；大量淀粉快速下肚，血糖也更容易猛升。\n汤可以喝，别把饭变成一路滑下去的汤饭。" },
      { id: "B", label: "汤和饭分开，先吃菜和肉，再慢慢嚼米饭", effect: { bloodSugar: 15, mood: 0, energy: 14, satiety: 35 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","进食速度"], scienceTip: "汤饭分开、先吃菜肉再嚼米饭，能放慢进食和淀粉吸收，让餐后血糖更平缓。\n不用戒汤，分开喝就好。" },
    ],
  },
  {
    id: 15, group: "lunch", title: "餐前饮品", description: "餐前，桌上有一瓶“0蔗糖”乳酸菌饮料，也有苹果醋和水。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "“0蔗糖”应该更稳，餐前喝完整瓶乳酸菌饮料", effect: { bloodSugar: 27, mood: 14, energy: -5, satiety: 9 }, isPreferred: false, knowledgeTags: ["食品标签","醋与餐后血糖"], scienceTip: "“0蔗糖”不等于零碳水，乳糖、葡萄糖等仍可能让血糖上升，整瓶喝完量也不小。\n标签少一个糖字，不等于真的没糖。" },
      { id: "B", label: "苹果醋听说能缓和餐后血糖，充分稀释后喝一小杯", effect: { bloodSugar: 9, mood: 0, energy: 9, satiety: 13 }, isPreferred: true, knowledgeTags: ["食品标签","醋与餐后血糖"], scienceTip: "少量苹果醋可能轻微减缓部分高 GI 餐的血糖上升，但作用有限。\n它不能抵消一顿饭的碳水，也要充分稀释。" },
    ],
  },
  {
    id: 16, group: "lunch", title: "压力下的午餐", description: "上午被老板狠批了一顿，中午情绪跌入谷底，你需要吃点好的来拯救自己。", weekdayOnly: true,
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "果麦碗看起来轻盈，用蜂蜜脆燕麦和果泥奖励自己", effect: { bloodSugar: 27, mood: 18, energy: -4, satiety: 20 }, isPreferred: false, knowledgeTags: ["压力进食","混合餐搭配"], scienceTip: "果泥、蜂蜜和脆燕麦会叠加多种碳水，蛋白质又少，血糖容易升得快、落得也快。\n看着轻盈，不代表血糖负担轻。" },
      { id: "B", label: "选单层牛肉汉堡，保留面包、少酱再加一份蔬菜", effect: { bloodSugar: 15, mood: 14, energy: 19, satiety: 34 }, isPreferred: true, knowledgeTags: ["压力进食","混合餐搭配"], scienceTip: "保留面包能避免完全不吃主食，牛肉和蔬菜又能减缓吸收，让血糖不至于大起大落。\n单层、少酱就够了。" },
    ],
  },
  {
    id: 17, group: "lunch", title: "牛肉面", description: "面馆里，牛肉面可以加青菜和卤蛋。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "牛肉面有肉有汤，直接拌匀趁热吃完", effect: { bloodSugar: 31, mood: 19, energy: -14, satiety: 44 }, isPreferred: false, knowledgeTags: ["碳水份量","进食顺序"], scienceTip: "一大碗精制面条碳水多，拌匀后又容易吃快，餐后血糖可能快速升高。\n牛肉和汤不能抵消整碗面。" },
      { id: "B", label: "先吃青菜、卤蛋和牛肉，再慢慢吃大半碗面", effect: { bloodSugar: 19, mood: 6, energy: 19, satiety: 47 }, isPreferred: true, knowledgeTags: ["碳水份量","进食顺序"], scienceTip: "先吃青菜、蛋和牛肉，再慢慢吃面，蛋白质和纤维能让餐后血糖升得慢一些。\n面照样吃，留一点就好。" },
    ],
  },
  {
    id: 18, group: "lunch", title: "沙拉酱", description: "沙拉旁边放着两种酱汁。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "两种酱各来一勺，味道更丰富，单份都不算多", effect: { bloodSugar: 24, mood: 19, energy: -5, satiety: 29 }, isPreferred: false, knowledgeTags: ["隐藏糖与酱料","碳水份量"], scienceTip: "沙拉酱可能含糖和淀粉，两种各一勺会悄悄叠加，血糖和总能量负担都会增加。\n酱料也要算进这顿饭。" },
      { id: "B", label: "只选一种酱，蘸着吃，吃到够味就停", effect: { bloodSugar: 10, mood: 0, energy: 14, satiety: 29 }, isPreferred: true, knowledgeTags: ["隐藏糖与酱料","碳水份量"], scienceTip: "只选一种酱并蘸着吃，能减少隐藏糖和淀粉，避免餐后血糖被酱料偷偷推高。\n够味就停，不用让沙拉泡澡。" },
    ],
  },
  {
    id: 19, group: "lunch", title: "饿过头", description: "会议拖到下午一点半，你饿得手脚发软，胃也不舒服。", weekdayOnly: true,
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "先喝一杯甜豆浆，感觉来劲后再去吃午饭", effect: { bloodSugar: 38, mood: 23, energy: -19, satiety: 26 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理","规律进餐"], scienceTip: "甜豆浆能让血糖快速上升，却缺少完整午饭的蛋白质和纤维，之后还可能很快又饿。\n先缓一缓，仍要正常吃饭。" },
      { id: "B", label: "先坐下，吃半根香蕉配小盒牛奶，缓过来再吃完整午饭", effect: { bloodSugar: 18, mood: 5, energy: 10, satiety: 8 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理","规律进餐"], scienceTip: "香蕉先补少量碳水，牛奶补蛋白质，能让血糖回升得更平稳，再接上完整午饭。\n症状持续或加重，要及时测量或求助。" },
    ],
  },
  {
    id: 20, group: "lunch", title: "便利店简餐", description: "便利店简餐，两种三明治。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "奶油果酱吐司份量不大，再配无糖咖啡平衡甜味", effect: { bloodSugar: 29, mood: 14, energy: -9, satiety: 20 }, isPreferred: false, knowledgeTags: ["食品标签","混合餐搭配"], scienceTip: "吐司和果酱里的淀粉、糖都会让血糖上升，旁边的无糖咖啡并不能把它们抵消。\n咖啡负责醒脑，不负责冲销早餐。" },
      { id: "B", label: "选全麦金枪鱼三明治，配一杯无糖茶", effect: { bloodSugar: 14, mood: 1, energy: 14, satiety: 30 }, isPreferred: true, knowledgeTags: ["食品标签","混合餐搭配"], scienceTip: "全麦面包的纤维和金枪鱼的蛋白质能减缓碳水吸收，让餐后血糖更平缓、也更耐饿。\n再留意酱料就好。" },
    ],
  },
  {
    id: 21, group: "lunch", title: "饭前状态", description: "脑子里还在想工作，到了饭点。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "边回工作消息边吃，省出一点午休时间", effect: { bloodSugar: 21, mood: 5, energy: -5, satiety: 30 }, isPreferred: false, knowledgeTags: ["进食速度","饥饿觉察"], scienceTip: "回消息本身不会升血糖，但分心时更容易吃快、吃多，让更多碳水集中下肚，血糖随之升高。\n手机先放十分钟。" },
      { id: "B", label: "先放下手机，做三次深呼吸再开吃", effect: { bloodSugar: 15, mood: 10, energy: 14, satiety: 30 }, isPreferred: true, knowledgeTags: ["进食速度","饥饿觉察"], scienceTip: "专心吃饭更容易放慢速度、及时感到饱，避免碳水吃过量，餐后血糖也更好控制。\n三次呼吸，先把注意力拉回来。" },
    ],
  },
  {
    id: 22, group: "lunch", title: "减脂期的炒菜", description: "减脂期，在想午饭怎么吃。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "水煮鸡胸和蔬菜，配低脂沙拉汁，尽量不碰油和主食", effect: { bloodSugar: 10, mood: -18, energy: -13, satiety: 12 }, isPreferred: false, knowledgeTags: ["混合餐搭配","可持续饮食"], scienceTip: "完全不吃主食，血糖可能偏低、精力下降；之后饿得太狠，又容易报复性进食。\n控糖不是把碳水和油都删掉。" },
      { id: "B", label: "少量油炒青菜和瘦肉，配半份杂粮饭", effect: { bloodSugar: 10, mood: 10, energy: 14, satiety: 30 }, isPreferred: true, knowledgeTags: ["混合餐搭配","可持续饮食"], scienceTip: "半份杂粮提供适量碳水，肉和蔬菜减缓吸收，能让血糖和精力都更平稳。\n这才是一顿能长期吃的饭。" },
    ],
  },
  {
    id: 23, group: "lunch", title: "轻食店沙拉", description: "轻食店，选什么好？",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "蔬菜越多越顶饱，选超大碗田园沙拉加面包丁", effect: { bloodSugar: 18, mood: -9, energy: -9, satiety: 16 }, isPreferred: false, knowledgeTags: ["混合餐搭配","碳水份量"], scienceTip: "超大碗蔬菜不等于更稳：缺少蛋白质和正常主食，血糖与饱腹感都可能撑不到下午。\n菜堆得高，也会营养偏科。" },
      { id: "B", label: "选中碗沙拉，加鸡胸、鸡蛋和半根玉米", effect: { bloodSugar: 10, mood: 8, energy: 18, satiety: 35 }, isPreferred: true, knowledgeTags: ["混合餐搭配","碳水份量"], scienceTip: "鸡胸、鸡蛋能减缓玉米中碳水的吸收，让餐后血糖更平缓，也比单吃蔬菜更耐饿。\n中碗蔬菜已经够用。" },
    ],
  },
  {
    id: 24, group: "lunch", title: "纯素网红餐", description: "打卡网红素食，两种选择。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { id: "A", label: "水果和燕麦都很健康，选香蕉、燕麦脆铺满的巴西莓果碗", effect: { bloodSugar: 33, mood: 31, energy: -18, satiety: 20 }, isPreferred: false, knowledgeTags: ["隐藏糖与酱料","混合餐搭配"], scienceTip: "果泥、香蕉和燕麦脆铺满一碗，会叠加大量碳水，让血糖快速上升。\n每样都健康，不代表加在一起仍是小份。" },
      { id: "B", label: "选有天贝、毛豆、牛油果和糙米的佛陀碗", effect: { bloodSugar: 12, mood: 5, energy: 16, satiety: 35 }, isPreferred: true, knowledgeTags: ["隐藏糖与酱料","混合餐搭配"], scienceTip: "天贝、毛豆的蛋白质和牛油果的脂肪能减缓糙米吸收，让餐后血糖更平缓。\n糙米和酱汁仍要留意份量。" },
    ],
  },
  {
    id: 25, group: "lunch", title: "碳水阻断茶", description: "饭前喝了一大杯号称「阻断碳水吸收」的白芸豆减肥茶，然后只吃了一份蔬菜沙拉。",
    image: "/images/s-lunch.png",
    choices: [
      { id: "A", label: "阻断茶已经挡住碳水，午餐只吃一份蔬菜沙拉", effect: { bloodSugar: -13, mood: -14, energy: -19, satiety: -10 }, isPreferred: false, knowledgeTags: ["碳水阻断误区","规律进餐"], lowSugarRisk: true, scienceTip: "所谓碳水阻断只能影响部分淀粉，不能代替主食；只吃蔬菜可能让血糖和精力都偏低。\n一杯茶，不能顶一顿饭。" },
      { id: "B", label: "不把阻断茶算成正餐，沙拉外加半碗杂粮饭和豆腐", effect: { bloodSugar: 14, mood: 1, energy: 10, satiety: 20 }, isPreferred: true, knowledgeTags: ["碳水阻断误区","规律进餐"], scienceTip: "杂粮饭补适量碳水，豆腐补蛋白质，能避免餐后血糖猛升，也不会因吃得太少而没力气。\n阻断茶只是饮品。" },
    ],
  },
]

const AFTERNOON_EVENTS: GameEvent[] = [
  {
    id: 26, group: "afternoon", title: "水果选择", description: "下午有点饿，看见水果和坚果。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "完整苹果有纤维，吃一个就能扛到晚饭", effect: { bloodSugar: 20, mood: 14, energy: 5, satiety: 14 }, isPreferred: false, knowledgeTags: ["水果形态","混合餐搭配"], scienceTip: "苹果会让血糖温和上升，但只有碳水和少量纤维，真饿时可能很快又饿。\n加餐想更持久，还要补蛋白质。" },
      { id: "B", label: "选一杯无糖酸奶，配一小把巴旦木", effect: { bloodSugar: 10, mood: 6, energy: 18, satiety: 23 }, isPreferred: true, knowledgeTags: ["水果形态","混合餐搭配"], scienceTip: "酸奶的蛋白质和坚果的脂肪能减缓碳水吸收，让血糖更平缓，也更耐饿。\n一小杯、一小把就够。" },
    ],
  },
  {
    id: 27, group: "afternoon", title: "下午发晕", description: "下午头晕眼花，包里只有一根香蕉。",
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "香蕉升糖快，先吃几口再坐下观察", effect: { bloodSugar: 10, mood: 5, energy: 18, satiety: 5 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理","运动与补能"], scienceTip: "头晕时几口香蕉能补少量快速碳水，帮助血糖回升。\n但头晕不一定是低血糖，持续或加重时要测量或求助。" },
      { id: "B", label: "担心香蕉糖多，先喝水休息，把香蕉留到晚餐", effect: { bloodSugar: -11, mood: -14, energy: -23, satiety: -10 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理","运动与补能"], lowSugarRisk: true, scienceTip: "只喝水不能补充葡萄糖，如果确实是低血糖，症状可能继续加重。\n先坐稳补少量碳水，持续不适要测量或求助。" },
    ],
  },
  {
    id: 28, group: "afternoon", title: "奶茶社交", description: "同事说请客喝奶茶。", weekdayOnly: true,
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "选中杯三分糖，把珍珠换成看起来更清爽的椰果", effect: { bloodSugar: 34, mood: 32, energy: -18, satiety: 18 }, isPreferred: false, knowledgeTags: ["含糖饮料","社交选择"], scienceTip: "奶茶不能只看“几分糖”，杯型和椰果糖浆都会增加碳水，让血糖负担叠加。\n甜度低，不等于总糖少。" },
      { id: "B", label: "选小杯五分糖，不加任何小料", effect: { bloodSugar: 10, mood: 12, energy: 5, satiety: 5 }, isPreferred: true, knowledgeTags: ["含糖饮料","社交选择"], scienceTip: "小杯虽然甜度更高，但没有小料、总碳水可能更少，血糖也不容易被额外推高。\n点奶茶要把杯型和小料一起算。" },
    ],
  },
  {
    id: 29, group: "afternoon", title: "办公室零食", description: "同事递过来一包综合果蔬干。",
    image: "/images/s-tea.png",
    choices: [
      { id: "A", label: "果蔬脆保留了蔬菜营养，吃一小包解馋", effect: { bloodSugar: 27, mood: 18, energy: -9, satiety: 14 }, isPreferred: false, knowledgeTags: ["食品加工","混合餐搭配"], scienceTip: "果蔬脆脱水后糖和淀粉更集中，有些还会油炸、加糖，血糖并不一定比普通零食平缓。\n先看配料表。" },
      { id: "B", label: "即食毛豆也是植物零食，吃一小袋", effect: { bloodSugar: 5, mood: 1, energy: 14, satiety: 19 }, isPreferred: true, knowledgeTags: ["食品加工","混合餐搭配"], scienceTip: "毛豆含蛋白质和纤维，碳水较少，对血糖的影响通常比果蔬脆温和。\n即食也可以，留意盐和份量。" },
    ],
  },
  {
    id: 30, group: "afternoon", title: "下午犯困", description: "下午三点，困意袭来。", weekdayOnly: true,
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "燕麦奶是植物奶，点一杯风味燕麦拿铁提神", effect: { bloodSugar: 30, mood: 14, energy: 18, satiety: 4 }, isPreferred: false, knowledgeTags: ["含糖饮料","咖啡因"], scienceTip: "风味燕麦拿铁里的燕麦碳水和风味糖会一起进入血糖，“植物奶”不代表低糖。\n咖啡也不能替代睡眠。" },
      { id: "B", label: "点小杯不加糖鲜奶拿铁，再去接水走一圈", effect: { bloodSugar: 0, mood: 0, energy: 14, satiety: 4 }, isPreferred: true, knowledgeTags: ["含糖饮料","咖啡因"], scienceTip: "不加糖先减少游离糖，走一圈又让肌肉利用葡萄糖，能减缓餐后血糖上升。\n鲜奶仍含乳糖，并不是零糖。" },
    ],
  },
  {
    id: 31, group: "afternoon", title: "朋友的甜品", description: "朋友递来一块抹茶慕斯，期待你一起尝尝。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "朋友很期待，完整吃完再配黑咖啡解腻", effect: { bloodSugar: 33, mood: 27, energy: -9, satiety: 19 }, isPreferred: false, knowledgeTags: ["甜品份量","餐后活动"], scienceTip: "整块慕斯里的糖和精制淀粉会让血糖上升，黑咖啡只能解腻，不能抵消它们。\n真想轻一点，直接分一半。" },
      { id: "B", label: "邀请朋友分一半，吃完一起散步十分钟", effect: { bloodSugar: 10, mood: 8, energy: -3, satiety: 10 }, isPreferred: true, knowledgeTags: ["甜品份量","餐后活动"], scienceTip: "甜品分一半先减少糖量，饭后散步又让肌肉利用葡萄糖，餐后血糖更容易平缓。\n开心不用跟着减半。" },
    ],
  },
  {
    id: 32, group: "afternoon", title: "想喝汽水", description: "想喝点有味道的东西。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "100%果汁没有额外加糖，选一瓶果汁气泡饮", effect: { bloodSugar: 25, mood: 12, energy: 0, satiety: 3 }, isPreferred: false, knowledgeTags: ["含糖饮料","食品标签"], scienceTip: "“100%果汁、无添加糖”不等于无糖；果汁里的糖属于游离糖，仍会让血糖上升。\n看标签时，要把“无添加”和“总糖”分开。" },
      { id: "B", label: "想喝气泡口感，选一瓶无糖柠檬苏打水", effect: { bloodSugar: 0, mood: 0, energy: 8, satiety: 4 }, isPreferred: true, knowledgeTags: ["含糖饮料","食品标签"], scienceTip: "无糖苏打水没有额外碳水，通常不会明显推高血糖。\n想喝气泡感，不一定要顺便喝下一瓶果汁。" },
    ],
  },
  {
    id: 33, group: "afternoon", title: "嘴馋", description: "嘴巴很馋，又没到饭点。",
    image: "/images/s-tea.png",
    choices: [
      { id: "A", label: "苏打饼干清淡不甜，拿三片垫一垫", effect: { bloodSugar: 24, mood: 18, energy: -5, satiety: 10 }, isPreferred: false, knowledgeTags: ["精制淀粉","饥饿觉察"], scienceTip: "苏打饼干不甜，精制淀粉仍会变成葡萄糖；刚吃完早餐又吃，血糖会继续叠加。\n清淡口感不等于低升糖。" },
      { id: "B", label: "早餐刚吃过，先喝水离开工位十分钟，还饿再加餐", effect: { bloodSugar: 0, mood: 0, energy: 4, satiety: 12 }, isPreferred: true, knowledgeTags: ["精制淀粉","饥饿觉察"], scienceTip: "先等十分钟不会额外推高血糖，也能确认这是饥饿还是习惯。\n如果还饿，再吃有蛋白质的加餐。" },
    ],
  },
  {
    id: 34, group: "afternoon", title: "压力爆发", description: "压力太大，情绪快绷不住了。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "低糖冰淇淋份量不大，边吃边把工作做完", effect: { bloodSugar: 30, mood: 27, energy: -13, satiety: 10 }, isPreferred: false, knowledgeTags: ["压力进食","含糖食物"], scienceTip: "低糖冰淇淋仍含糖和脂肪，边工作边吃容易过量，血糖还可能升高并维持更久。\n问题不只在一口，而在自动吃完整盒。" },
      { id: "B", label: "下楼买杯无糖茶，走十分钟换换脑子", effect: { bloodSugar: 0, mood: 10, energy: 13, satiety: 0 }, isPreferred: true, knowledgeTags: ["压力进食","含糖食物"], scienceTip: "先走一圈不会增加糖负荷，肌肉活动还能帮助利用葡萄糖。\n回来仍想吃，就坐下来认真吃一小份。" },
    ],
  },
  {
    id: 35, group: "afternoon", title: "饥饿救急", description: "肚子在抗议，需要点东西救急。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { id: "A", label: "胡萝卜和芹菜低卡又有纤维，吃一盒撑到晚饭", effect: { bloodSugar: 5, mood: 16, energy: -4, satiety: 10 }, isPreferred: false, knowledgeTags: ["饥饿觉察","混合餐搭配"], scienceTip: "蔬菜条碳水少、对血糖影响小，但真饿时缺少蛋白质和能量，很难撑到晚饭。\n低升糖不等于适合单独扛饿。" },
      { id: "B", label: "吃一杯无糖酸奶，配一小把坚果", effect: { bloodSugar: 5, mood: 8, energy: 12, satiety: 20 }, isPreferred: true, knowledgeTags: ["饥饿觉察","混合餐搭配"], scienceTip: "酸奶和坚果能减缓碳水吸收，让血糖保持平缓，也比只吃蔬菜更耐饿。\n小小一份，就能接到晚饭。" },
    ],
  },
  {
    id: 36, group: "afternoon", title: "饭后两小时", description: "中午吃完大碗牛肉面两小时后，你突然心慌、饥饿、犯困，手机里能查看这一餐的 CGM 曲线。",
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "凭感觉判断是血糖低了，先吃两块夹心饼干", effect: { bloodSugar: 29, mood: 18, energy: -14, satiety: 10 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理","餐后反应"], scienceTip: "心慌、犯困不是低血糖特有的表现；没看数值就吃饼干，可能让血糖再升一轮。\n先看 CGM，再决定是否补糖。" },
      { id: "B", label: "先坐下看 CGM 数值和趋势，再决定是否补糖", effect: { bloodSugar: 0, mood: 0, energy: 13, satiety: 18 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理","餐后反应"], scienceTip: "CGM 能连续显示葡萄糖数值和趋势，帮助判断是偏低、偏高，还是吃多和疲劳。\n身体感受重要，数据能帮你判断。" },
    ],
  },
  {
    id: 37, group: "afternoon", title: "CGM 报警", description: "你的 CGM 报警，显示 3.8 mmol/L，同时出现强烈眩晕。",
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "坚果更健康，抓一把花生和核桃慢慢补", effect: { bloodSugar: -13, mood: -10, energy: -10, satiety: 14 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理"], lowSugarRisk: true, scienceTip: "已经确认低血糖时，坚果里的脂肪和蛋白质会拖慢糖的吸收，血糖回升不够快。\n应按 15-15 法则补快速碳水并复测。" },
      { id: "B", label: "按“15-15 法则”补约 15 克快速碳水，再复测", effect: { bloodSugar: 16, mood: 5, energy: 14, satiety: 0 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理"], scienceTip: "测到 3.8 mmol/L 并眩晕，应按 15-15 法则补快速碳水，让血糖尽快回升。\n不能吞咽或意识异常时立即急救。" },
    ],
  },
  {
    id: 38, group: "afternoon", title: "补糖十五分钟后", description: "（接上题）补糖 15 分钟后，眩晕感消失了，但胃里仍觉得空。",
    image: "/images/s-low-sugar.png",
    choices: [
      { id: "A", label: "症状没了但胃还空，吃一根全麦能量棒预防再低", effect: { bloodSugar: 20, mood: 8, energy: 0, satiety: 15 }, isPreferred: false, knowledgeTags: ["低血糖识别与处理"], scienceTip: "症状缓解不代表血糖已经恢复，直接吃能量棒可能补过量，让血糖反弹。\n先复测，再决定补糖还是吃小加餐。" },
      { id: "B", label: "先看复测结果，再决定是否补第二轮或正常加餐", effect: { bloodSugar: 1, mood: 5, energy: 10, satiety: 19 }, isPreferred: true, knowledgeTags: ["低血糖识别与处理"], scienceTip: "先复测血糖：仍低就继续补快速碳水；已经恢复且离正餐远，再吃小份慢碳水和蛋白质。\n这样不多补，也不少补。" },
    ],
  },
  {
    id: 39, group: "afternoon", title: "逛街的隐形消耗", description: "周末逛街走了整整 15000 步，下午 4 点，你感到腿肚子发软，脾气异常暴躁。",
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "走了一万五千步该补能，选少糖燕麦奶茶加芋圆", effect: { bloodSugar: 33, mood: 28, energy: -11, satiety: 22 }, isPreferred: false, knowledgeTags: ["运动与补能","含糖饮料"], scienceTip: "少糖奶茶和芋圆会叠加液体糖、淀粉与杯量，让血糖快速上升。\n走累了该补能量，但别让饮料变成隐藏大餐。" },
      { id: "B", label: "香蕉配原味酸奶，碳水和蛋白质都补一点", effect: { bloodSugar: 12, mood: 14, energy: 19, satiety: 20 }, isPreferred: true, knowledgeTags: ["运动与补能","含糖饮料"], scienceTip: "香蕉补碳水，酸奶的蛋白质减缓吸收，能让血糖回升得更平稳。\n逛街后的饿，一份正常加餐就能接住。" },
    ],
  },
]

const DINNER_EVENTS: GameEvent[] = [
  {
    id: 40, group: "dinner", title: "晚餐主食", description: "晚餐想选个主食。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "糯玉米口感扎实，觉得会更耐饿", effect: { bloodSugar: 33, mood: 14, energy: -13, satiety: 33 }, isPreferred: false, knowledgeTags: ["淀粉类型","碳水份量"], scienceTip: "糯玉米含有较多支链淀粉，通常更容易被消化。\n同类主食中，口感越黏越糯，一般 GI 越高、升糖越快，越需要留意份量。" },
      { id: "B", label: "甜玉米水分更多，选一根配晚餐", effect: { bloodSugar: 15, mood: 1, energy: 10, satiety: 24 }, isPreferred: true, knowledgeTags: ["淀粉类型","碳水份量"], scienceTip: "甜玉米的 GI 通常低于糯玉米，水分更多、淀粉更少，血糖上升也更慢。\n想吃玉米，可优先选甜玉米，但仍算一份主食。" },
    ],
  },
  {
    id: 41, group: "dinner", title: "周末大餐", description: "周末大餐，朋友点了芝士烤饼。", weekendOnly: true,
    image: "/images/s-dinner-party.png",
    choices: [
      { id: "A", label: "烤饼里有肉和芝士，吃三小块就不再点别的主食", effect: { bloodSugar: 27, mood: 32, energy: -23, satiety: 49 }, isPreferred: false, knowledgeTags: ["糖脂组合","碳水份量"], scienceTip: "芝士烤饼是典型的高脂高碳水组合，脂肪可能让血糖峰值来得更晚、持续更久。\n当下没升高，也别急着继续加量。" },
      { id: "B", label: "先吃一块烤饼配蔬菜，仍饿再加第二块", effect: { bloodSugar: 9, mood: 0, energy: 4, satiety: 20 }, isPreferred: true, knowledgeTags: ["糖脂组合","碳水份量"], scienceTip: "先吃一块配蔬菜，能减少一次吃下的碳水；仍饿再加，血糖负担也更容易控制。\n别用“没吃饭”给第二块通行证。" },
    ],
  },
  {
    id: 42, group: "dinner", title: "饭后的消食", description: "晚上吃了一顿丰盛的碳水大餐，决定做点什么补救一下。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "跑三公里把这顿碳水尽快消耗掉", effect: { bloodSugar: 22, mood: -10, energy: -24, satiety: -19 }, isPreferred: false, knowledgeTags: ["餐后活动","运动强度"], scienceTip: "刚吃饱就跑步，压力激素可能让血糖暂时升高，胃部也容易不舒服。\n这顿饭不需要立刻用高强度运动抵消。" },
      { id: "B", label: "刚吃饱先洗碗拖地十分钟，晚点再正常运动", effect: { bloodSugar: 0, mood: 4, energy: -4, satiety: -5 }, isPreferred: true, knowledgeTags: ["餐后活动","运动强度"], scienceTip: "饭后轻活动能让骨骼肌多利用一些葡萄糖，帮助降低餐后血糖峰值。\n不用马上跑步，散步、洗碗和拖地都算。" },
    ],
  },
  {
    id: 43, group: "dinner", title: "减肥晚餐", description: "想「少吃点」来减肥。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "西瓜热量低，吃一大盘再配坚果当晚餐", effect: { bloodSugar: 30, mood: 23, energy: -13, satiety: 19 }, isPreferred: false, knowledgeTags: ["水果代餐误区","混合餐搭配"], scienceTip: "西瓜的 GI 不算低，说明升糖较快；一次吃多少，还会影响这顿的 GL。\n小份可以，一大盘仍可能让血糖升得又快又高。" },
      { id: "B", label: "小碗杂粮饭配蔬菜和肉，水果留一小份餐后吃", effect: { bloodSugar: 14, mood: 0, energy: 14, satiety: 34 }, isPreferred: true, knowledgeTags: ["水果代餐误区","混合餐搭配"], scienceTip: "杂粮饭提供适量碳水，蔬菜和肉减缓吸收，能让餐后血糖更平缓。\n西瓜留成餐后小份，不用完全戒掉。" },
    ],
  },
  {
    id: 44, group: "dinner", title: "长辈的爱", description: "长辈坚持要你把一大碗白米饭吃完。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "不想浪费长辈心意，按盛好的份量把白米饭吃完", effect: { bloodSugar: 34, mood: 9, energy: -19, satiety: 53 }, isPreferred: false, knowledgeTags: ["碳水份量","饱腹觉察"], overfull: true, scienceTip: "一大碗白米饭含有较多淀粉，全部吃完会让大量葡萄糖进入血液，餐后血糖明显上升。\n长辈的爱收下，饭不用硬撑完。" },
      { id: "B", label: "先吃菜和肉，米饭吃到舒服，剩下请长辈打包", effect: { bloodSugar: 14, mood: 0, energy: 10, satiety: 38 }, isPreferred: true, knowledgeTags: ["碳水份量","饱腹觉察"], scienceTip: "先吃菜和肉，再按饥饿吃米饭，能减缓碳水吸收，让餐后血糖更平缓。\n吃不完打包，也没有浪费心意。" },
    ],
  },
  {
    id: 45, group: "dinner", title: "饭局饮酒", description: "饭局上，大家在举杯。", weekendOnly: true,
    image: "/images/s-dinner-party.png",
    choices: [
      { id: "A", label: "先吃菜垫胃，觉得这样慢喝两杯啤酒问题不大", effect: { bloodSugar: 27, mood: 23, energy: -14, satiety: 18 }, isPreferred: false, knowledgeTags: ["酒精与血糖","社交选择"], scienceTip: "酒精会影响肝脏制造和释放葡萄糖，啤酒本身又含碳水，血糖可能先升后降。\n只吃菜，不能消除延迟性低血糖风险。" },
      { id: "B", label: "正常吃饭，只喝一小杯低度酒，其余换无糖苏打水", effect: { bloodSugar: 6, mood: 8, energy: 0, satiety: 4 }, isPreferred: true, knowledgeTags: ["酒精与血糖","社交选择"], scienceTip: "正常吃饭、只喝一小杯，能减少酒精对肝糖输出的影响，降低血糖延迟下降的风险。\n后面换无糖苏打水就好。" },
    ],
  },
  {
    id: 46, group: "dinner", title: "厨房炒菜", description: "自己下厨炒菜。",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "加两勺水淀粉收成浓汁，少放油也能好吃", effect: { bloodSugar: 23, mood: 18, energy: -4, satiety: 25 }, isPreferred: false, knowledgeTags: ["食物结构与糊化","隐藏淀粉"], scienceTip: "水淀粉受热会糊化，浓芡会让每口菜裹上更多淀粉，吃下后同样会变成葡萄糖。\n少油不等于少碳水。" },
      { id: "B", label: "只用半勺水淀粉做薄芡，让汁刚好挂住菜", effect: { bloodSugar: 7, mood: 0, energy: 10, satiety: 25 }, isPreferred: true, knowledgeTags: ["食物结构与糊化","隐藏淀粉"], scienceTip: "薄芡只用少量水淀粉，附着在菜上的碳水更少，对餐后血糖的影响也更小。\n够亮、够味就行。" },
    ],
  },
  {
    id: 47, group: "dinner", title: "煲汤配菜", description: "一锅煲汤，配菜要怎么选？",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "山药、莲藕和芋头都是天然食材，每样夹一点", effect: { bloodSugar: 29, mood: 14, energy: -9, satiety: 34 }, isPreferred: false, knowledgeTags: ["碳水识别","混合餐搭配"], scienceTip: "山药、莲藕和芋头都含淀粉，炖软后更易消化，三样叠加会让餐后血糖明显上升。\n天然食物也会组团加量。" },
      { id: "B", label: "选一种根茎当主食，再配排骨和绿叶菜", effect: { bloodSugar: 7, mood: 0, energy: 14, satiety: 34 }, isPreferred: true, knowledgeTags: ["碳水识别","混合餐搭配"], scienceTip: "只选一种根茎当主食，能避免淀粉叠加；排骨和绿叶菜又能减缓血糖上升。\n它们不能全当蔬菜。" },
    ],
  },
  {
    id: 48, group: "dinner", title: "减脂晚餐", description: "减脂期的晚饭，严格还是放一点松？",
    image: "/images/s-dinner.png",
    choices: [
      { id: "A", label: "水煮鸡胸和西兰花，配零脂酱，尽量把热量压低", effect: { bloodSugar: 5, mood: -27, energy: -13, satiety: 21 }, isPreferred: false, knowledgeTags: ["可持续饮食","混合餐搭配"], scienceTip: "完全不吃主食，血糖和精力可能偏低，也容易很快又饿，之后反而吃得更多。\n控糖不是只剩水煮菜。" },
      { id: "B", label: "少量橄榄油调味，配一小份杂粮，把它当正常晚饭", effect: { bloodSugar: 10, mood: 10, energy: 14, satiety: 30 }, isPreferred: true, knowledgeTags: ["可持续饮食","混合餐搭配"], scienceTip: "小份杂粮补适量碳水，鸡胸、蔬菜和橄榄油减缓吸收，让血糖更平缓。\n正常晚饭比极端节食更容易坚持。" },
    ],
  },
  {
    id: 49, group: "dinner", title: "火锅局", description: "吃火锅，锅里沸腾着。",
    image: "/images/s-dinner-party.png",
    choices: [
      { id: "A", label: "蔬菜多就不点主食，再夹炸腐竹和鱼丸增加饱腹", effect: { bloodSugar: 24, mood: 14, energy: -5, satiety: 26 }, isPreferred: false, knowledgeTags: ["火锅搭配","隐藏糖与油脂"], scienceTip: "没点米饭也可能吃进碳水：炸腐竹、鱼丸和甜蘸料都会让血糖上升。\n火锅里的主食，最会偷偷藏起来。" },
      { id: "B", label: "蔬菜菌菇、瘦肉豆腐，再加半份主食", effect: { bloodSugar: 10, mood: 8, energy: 15, satiety: 35 }, isPreferred: true, knowledgeTags: ["火锅搭配","隐藏糖与油脂"], scienceTip: "蔬菜、瘦肉能减缓半份主食的吸收，避开炸腐竹和甜蘸料，餐后血糖更容易平缓。\n火锅照样吃，碳水摆到明面上。" },
    ],
  },
  {
    id: 50, group: "dinner", title: "晚间动感单车", description: "晚上 8 点你还没吃晚饭，但预定的高强度动感单车课要开始了。",
    image: "/images/s-exercise.png",
    choices: [
      { id: "A", label: "空腹训练能多燃脂，先上完课再吃晚饭", effect: { bloodSugar: -17, mood: -19, energy: -29, satiety: -19 }, isPreferred: false, knowledgeTags: ["运动与补能","规律进餐"], lowSugarRisk: true, scienceTip: "错过晚饭再做高强度运动，血糖可能过低，精力和动作稳定都会受影响。\n多燃一点脂肪，不值得拿训练安全去赌。" },
      { id: "B", label: "怕训练时没力气，课前吃一根香蕉稍作消化", effect: { bloodSugar: 10, mood: 10, energy: 23, satiety: 10 }, isPreferred: true, knowledgeTags: ["运动与补能","规律进餐"], scienceTip: "课前香蕉补少量快速碳水，能降低运动中血糖过低和突然没力气的风险。\n稍微消化一下再开练。" },
    ],
  },
  {
    id: 51, group: "dinner", title: "极寒的考验", description: "冬天在户外等了半小时公交车，被冻得瑟瑟发抖，身体热量大量流失。",
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "先到室内取暖，再吃一个热红薯补能量", effect: { bloodSugar: 19, mood: 19, energy: 14, satiety: 20 }, isPreferred: true, knowledgeTags: ["寒冷与补能","碳水作用"], scienceTip: "冷到发抖时身体耗能增加，红薯能补碳水、帮助血糖和体力回升，但取暖仍是第一步。\n反应变慢或动作笨拙要及时求助。" },
      { id: "B", label: "担心晚餐前再加碳水，先喝温水等回家", effect: { bloodSugar: -11, mood: -14, energy: -18, satiety: 4 }, isPreferred: false, knowledgeTags: ["寒冷与补能","碳水作用"], lowSugarRisk: true, scienceTip: "温水不能提供葡萄糖，冷到发抖时只喝水，血糖和体力可能继续下降。\n先避风取暖并补碳水，症状加重及时求助。" },
    ],
  },
]

const EVENING_EVENTS: GameEvent[] = [
  {
    id: 52, group: "evening", title: "夜间运动", description: "晚上想打羽毛球锻炼。",
    image: "/images/s-exercise.png",
    choices: [
      { id: "A", label: "空腹打球身体更轻，结束后再和大家吃夜宵", effect: { bloodSugar: -15, mood: 8, energy: -27, satiety: -10 }, isPreferred: false, knowledgeTags: ["运动与补能","规律进餐"], lowSugarRisk: true, scienceTip: "离上一餐很久还空腹打球，运动会继续消耗葡萄糖，血糖可能过低，动作也容易变形。\n轻装上阵，不等于空着油箱。" },
      { id: "B", label: "上场前吃香蕉配原味酸奶，稍作消化再开始", effect: { bloodSugar: 10, mood: 14, energy: 27, satiety: 5 }, isPreferred: true, knowledgeTags: ["运动与补能","规律进餐"], scienceTip: "香蕉补碳水，酸奶补蛋白质，能降低运动中血糖过低和乏力的风险。\n不用吃到饱，给球局一点燃料。" },
    ],
  },
  {
    id: 53, group: "evening", title: "睡前饿了", description: "午夜，真的饿得睡不着。",
    image: "/images/s-bedtime.png",
    choices: [
      { id: "A", label: "一小碗阳春面不算多，再喝半杯果汁助消化", effect: { bloodSugar: 27, mood: 26, energy: -8, satiety: 37 }, isPreferred: false, knowledgeTags: ["夜间加餐","混合餐搭配"], scienceTip: "面条和果汁会叠加精制淀粉与液体糖，让睡前血糖快速上升。\n夜宵可以吃，别同时打开两条快速碳水通道。" },
      { id: "B", label: "吃一小杯原味酸奶，配半片全麦面包", effect: { bloodSugar: 8, mood: 5, energy: 10, satiety: 15 }, isPreferred: true, knowledgeTags: ["夜间加餐","混合餐搭配"], scienceTip: "半片全麦面包补少量碳水，酸奶蛋白质减缓吸收，睡前血糖不会一下冲高。\n真饿时，小份夜宵比硬忍实际。" },
    ],
  },
  {
    id: 54, group: "evening", title: "打球后", description: "打完球，满身大汗。",
    image: "/images/s-exercise.png",
    choices: [
      { id: "A", label: "球局结束就坐车回家，打算洗完澡再喝水", effect: { bloodSugar: 4, mood: 4, energy: -6, satiety: -5 }, isPreferred: false, knowledgeTags: ["运动恢复","餐后活动"], scienceTip: "运动后立刻坐车、又不补水，容易错过头晕心慌等低血糖信号，也不方便及时处理。\n先给身体五分钟收尾。" },
      { id: "B", label: "先慢走五分钟并补水，确认身体舒服再回家", effect: { bloodSugar: 0, mood: 6, energy: 5, satiety: -5 }, isPreferred: true, knowledgeTags: ["运动恢复","餐后活动"], scienceTip: "慢走能让肌肉继续平稳利用葡萄糖，补水和观察也便于发现低血糖征兆。\n这五分钟是训练的最后一步。" },
    ],
  },
  {
    id: 55, group: "evening", title: "练后加餐", description: "刚举完铁，想补充营养。",
    image: "/images/s-bedtime.png",
    choices: [
      { id: "A", label: "训练后有“黄金窗口”，马上喝一份香草增肌粉", effect: { bloodSugar: 29, mood: 14, energy: -6, satiety: 19 }, isPreferred: false, knowledgeTags: ["运动营养","快速碳水"], scienceTip: "麦芽糊精属于高 GI 碳水，一些增肌粉会因此让血糖快速上升。\n别只看蛋白质，也要检查配料表。" },
      { id: "B", label: "先看配料和全天蛋白，需要时再选无糖奶或配料简单的蛋白粉", effect: { bloodSugar: 5, mood: 0, energy: 18, satiety: 24 }, isPreferred: true, knowledgeTags: ["运动营养","快速碳水"], scienceTip: "先看配料能避开不需要的快速碳水，减少训练后血糖突然上升。\n需要时选无糖奶或配料简单的蛋白粉。" },
    ],
  },
  {
    id: 56, group: "evening", title: "补剂选择", description: "睡前要不要补点什么？",
    image: "/images/s-bedtime.png",
    choices: [
      { id: "A", label: "先把镁片吃了，再刷半小时手机放松", effect: { bloodSugar: 0, mood: 5, energy: -12, satiety: 0 }, isPreferred: false, knowledgeTags: ["睡眠与血糖","补剂误区"], scienceTip: "睡眠不足可能降低胰岛素敏感性，让同样一顿饭带来更明显的血糖反应。\n镁片不能抵消晚睡，先按时关灯。" },
      { id: "B", label: "今晚先不加补剂，按原计划关灯睡觉", effect: { bloodSugar: 0, mood: 8, energy: 15, satiety: 0 }, isPreferred: true, knowledgeTags: ["睡眠与血糖","补剂误区"], scienceTip: "按时睡觉有助于维持胰岛素敏感性，让第二天血糖和食欲更稳定。\n这次最朴素的选择，反而最有效。" },
    ],
  },
  {
    id: 57, group: "evening", title: "睡前奶制品", description: "睡前有点饿，想来一份奶制品。",
    image: "/images/s-bedtime.png",
    choices: [
      { id: "A", label: "低脂调味奶脂肪少，热一大杯当夜宵", effect: { bloodSugar: 25, mood: 10, energy: -5, satiety: 12 }, isPreferred: false, knowledgeTags: ["乳制品","食品标签"], scienceTip: "低脂调味奶仍含乳糖和添加糖，一大杯会让较多糖进入血液，睡前血糖随之上升。\n“低脂”不等于“低糖”。" },
      { id: "B", label: "吃一小杯无添加糖原味酸奶解饿", effect: { bloodSugar: 5, mood: 0, energy: 14, satiety: 23 }, isPreferred: true, knowledgeTags: ["乳制品","食品标签"], scienceTip: "原味酸奶也含乳糖，但没有额外添加糖，小杯份量让睡前血糖负担更小。\n买奶制品，低糖比低脂更值得先看。" },
    ],
  },
  {
    id: 58, group: "evening", title: "回家路上", description: "周五应酬没吃主食，空腹喝了几杯白酒。回家路上突然直冒冷汗，手抖得拿不住手机。", weekendOnly: true,
    image: "/images/s-outside.png",
    choices: [
      { id: "A", label: "先吃一碗热肥肠粉，感觉缓和就自己回家睡", effect: { bloodSugar: -9, mood: 14, energy: -9, satiety: 38 }, isPreferred: false, knowledgeTags: ["酒精与血糖","低血糖识别与处理"], lowSugarRisk: true, scienceTip: "空腹饮酒会抑制肝脏释放葡萄糖，冷汗手抖可能是低血糖；肥肠粉含脂肪，补糖又不够快。\n别独自睡下，应快速补糖并测量。" },
      { id: "B", label: "先联系朋友陪同，补快速碳水并尽快测量或求助", effect: { bloodSugar: 18, mood: 5, energy: 10, satiety: 5 }, isPreferred: true, knowledgeTags: ["酒精与血糖","低血糖识别与处理"], scienceTip: "快速碳水能让低血糖尽快回升，有人陪同也方便观察和测量。\n不能吞咽或意识异常时不要强喂，应立即急救。" },
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
