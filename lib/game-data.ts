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

export interface Choice {
  label: string
  tip?: string
  effect: Effect
  scienceTip: string
  /** 仅用于选项文字已经明确表达“硬撑/过量”的场景，避免普通高饱腹餐误判为吃撑。 */
  overfull?: boolean
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
      { label: "当做轻断食，今天就不吃早餐啦", effect: { bloodSugar: 0, energy: -15, satiety: -15, mood: -5 }, scienceTip: "把迟到顺便包装成轻断食，听起来很聪明，但这次其实只是被动漏掉早餐。空腹继续拉长，上午的饥饿和注意力更容易受影响，午餐也可能吃得又快又多；来不及坐下吃，也可以用鸡蛋、无糖豆浆加一小份主食快速开局。" },
      { label: "随便买根热甜玉米边走边啃", effect: { bloodSugar: 15, energy: 10, satiety: 20, mood: 5 }, scienceTip: "玉米救场成功：它保留了颗粒结构和一部分膳食纤维，通常比精制面包更耐嚼、消化更慢。不过单独一根玉米的蛋白质不多，下次顺手配个鸡蛋、牛奶或无糖豆浆，会更扛饿。" },
    ],
  },
  {
    id: 2, group: "breakfast", title: "周末早餐", description: "难得周末，认真吃顿早饭。", weekendOnly: true,
    image: "/images/s-breakfast.jpg",
    choices: [
      { label: "榨一杯现打鲜橙汁，营养又健康", effect: { bloodSugar: 25, energy: -5, satiety: 5, mood: 10 }, scienceTip: "橙子一变成果汁，果肉的细胞结构被打散，咀嚼感和饱腹感也跟着下线；同样几口，往往还能喝进比吃整果更多的量。想让这份水果更耐饿、吸收更平缓，直接剥一个完整橙子会更合适。" },
      { label: "煮两个水煮蛋，配全麦吐司", effect: { bloodSugar: 12, energy: 15, satiety: 30, mood: 5 }, scienceTip: "朴素，但很能打。鸡蛋补上蛋白质，全麦吐司提供碳水和纤维，混合餐的消化节奏通常比单喝果汁更平缓；再看一眼配料表，确认“全麦粉”不是只来客串。" },
    ],
  },
  {
    id: 3, group: "breakfast", title: "妈妈的爱", description: "妈妈特意起早冲了一碗黑芝麻核桃糊。",
    image: "/images/s-morning.png",
    choices: [
      { label: "感动地全部喝完", effect: { bloodSugar: 25, energy: -5, satiety: 25, mood: 10 }, scienceTip: "打成粉糊状的五谷失去颗粒结构，淀粉酶能快速分解，升糖速度比完整谷物明显更快。" },
      { label: "喝一半，说胃口不好", effect: { bloodSugar: 12, energy: 5, satiety: 15, mood: 0 }, scienceTip: "喝一半，先把这顿的碳水总量和血糖负荷降下来；核桃、芝麻里的脂肪和蛋白质也会放慢整体消化节奏。给自己留到舒服的份量，妈妈的心意不用靠清空大碗来证明。" },
    ],
  },
  {
    id: 4, group: "breakfast", title: "面包房", description: "路过面包房，橱窗里摆着「无糖全麦」面包。",
    image: "/images/s-outside.png",
    choices: [
      { label: "买一个「无糖全麦」面包", effect: { bloodSugar: 22, energy: 0, satiety: 20, mood: 5 }, scienceTip: "“无糖”和“全麦”很会抢镜，但真正的答案藏在配料表里。“无糖”通常只说明没有额外添加某类糖，面包里的淀粉和总碳水依然在。看全麦粉排位、膳食纤维和每份碳水，比只看包装正面更靠谱。" },
      { label: "买两个纯肉包，吃肉馅", effect: { bloodSugar: 5, energy: 5, satiety: 20, mood: -5 }, scienceTip: "只吃肉馅确实少了面皮里的精制淀粉，但蛋白质也会刺激一定的胰岛素反应，脂肪还可能让餐后血糖来得更晚。更现实的玩法是吃一个完整肉包，再配无糖饮品或蔬菜，既不浪费也不用走极端。" },
    ],
  },
  {
    id: 5, group: "breakfast", title: "传统摊位", description: "街边传统早餐摊，豆浆飘香，油条刚出锅。",
    image: "/images/s-outside.png",
    choices: [
      { label: "豆浆配两根油条，经典组合", effect: { bloodSugar: 25, energy: -10, satiety: 35, mood: 15 }, scienceTip: "油条是精制面糊经过高温油炸形成的“淀粉＋脂肪”组合，两根下去，碳水和能量密度都不低。豆浆油条不用从人生里删除，把油条减到半根或一根、豆浆选无糖，经典组合就轻松多了。" },
      { label: "咸豆腐脑，外加一小块蒸红薯", effect: { bloodSugar: 12, energy: 12, satiety: 30, mood: 8 }, scienceTip: "豆腐脑提供大豆蛋白，小块红薯补上主食；红薯的血糖反应会随品种、烹调方式和份量变化。咸口豆腐脑少糖少重卤，再把红薯控制在一小块，这份早餐就很扎实。" },
    ],
  },
  {
    id: 6, group: "breakfast", title: "肠胃不适", description: "胃有点不舒服，需要吃点温和的。",
    image: "/images/s-morning.png",
    choices: [
      { label: "喝碗熬得极软烂的白米粥养胃", effect: { bloodSugar: 25, energy: -5, satiety: 25, mood: 10 }, scienceTip: "白粥看着清淡，血糖反应却未必清淡。米粒熬得越软烂，淀粉糊化越充分，淀粉酶通常越容易把它分解。少盛一点，再配蒸蛋或豆腐，清淡和耐饿就能同时保住。" },
      { label: "勉强吃几口蒸蛋和清炒嫩青菜", effect: { bloodSugar: 5, energy: 5, satiety: 15, mood: -5 }, scienceTip: "蒸蛋和嫩青菜对不少人来说更清爽，也补进了蛋白质和低淀粉蔬菜。肠胃不舒服时，先以身体能接受为准；持续疼痛、呕吐或明显不适，就别靠菜单硬扛，及时就医。" },
    ],
  },
  {
    id: 7, group: "breakfast", title: "酒店自助", description: "酒店自助早餐，各种食物摆满台面。", weekendOnly: true,
    image: "/images/s-breakfast.jpg",
    choices: [
      { label: "先来一大盘西瓜和哈密瓜开胃", effect: { bloodSugar: 20, energy: 0, satiety: 10, mood: 10 }, scienceTip: "水果没做错什么，一大盘才是这局的隐藏变量。西瓜水分多，单份碳水不算夸张；空腹开吃却很容易越吃越多，把正餐前的小水果吃成了主食份量。先取一小碟，吃完再去拿正餐。" },
      { label: "先取蔬菜、蛋和肉，最后才吃水果", effect: { bloodSugar: 12, energy: 15, satiety: 35, mood: 8 }, scienceTip: "先吃蔬菜和蛋白质，就像先给这顿饭铺了一层“减速网”：纤维、蛋白质和脂肪会改变胃排空及后续碳水的吸收节奏，餐后曲线往往更平缓。顺序加成之后，水果和主食的份量依然要算进这顿饭。" },
    ],
  },
  {
    id: 8, group: "breakfast", title: "晨练", description: "想趁早晨运动，计划去跑步。",
    image: "/images/s-exercise.png",
    choices: [
      { label: "空腹直接去跑步，控糖又燃脂", effect: { bloodSugar: 10, energy: -20, satiety: -15, mood: 0 }, scienceTip: "空腹跑步会增加当次脂肪氧化，长期减脂则更看整体能量和能否持续。运动强度上来后，肝糖原和压力激素也会参与供能；一旦头晕、发抖或乏力，就该停下来补给。" },
      { label: "喝半杯牛奶，吃两口苹果再出发", effect: { bloodSugar: 8, energy: 12, satiety: 8, mood: 5 }, scienceTip: "半杯牛奶和两口苹果像给晨跑加了个软启动，补进少量碳水和蛋白质，尤其适合已经有点饿的人。重点是让你胃里舒服、有力气完成训练；份量不大，也不会变成沉重的一餐。" },
    ],
  },
  {
    id: 9, group: "breakfast", title: "极简早餐", description: "想吃极简早餐，两个选择都看起来很健康。",
    image: "/images/s-breakfast.jpg",
    choices: [
      { label: "泡一碗无糖纯燕麦片，加一把蓝莓", effect: { bloodSugar: 18, energy: 8, satiety: 25, mood: 8 }, scienceTip: "燕麦里的β-葡聚糖能增加黏度、延缓消化；即食燕麦被切得更碎、加工更充分，血糖反应通常又比完整燕麦粒更快。若吃完很快又饿，再加无糖酸奶或坚果，把蛋白质和脂肪补上。" },
      { label: "用黄油煎两个鸡蛋，配半个牛油果", effect: { bloodSugar: 3, energy: 12, satiety: 30, mood: 3 }, scienceTip: "鸡蛋和牛油果提供蛋白质、脂肪和纤维，确实很扛饿，但这顿几乎没有主食。按当天的活动量补一点全谷物或水果，通常会更均衡，也更容易把精力接到中午。" },
    ],
  },
  {
    id: 10, group: "breakfast", title: "晨起的心慌", description: "早上刚睁眼，你突然觉得心跳加速，身体有轻微的颤抖。",
    image: "/images/s-morning.png",
    choices: [
      { label: "不管它，忍着洗漱，到了公司再吃早饭", effect: { bloodSugar: 0, energy: -20, satiety: -10, mood: -15 }, scienceTip: "晨起心慌可能来自低血糖，也可能与脱水、焦虑、心律问题或其他状况有关。先坐下，有条件就测量；症状持续、加重，或伴随胸痛、呼吸困难和晕厥感时，别硬挤通勤，及时求助。" },
      { label: "在床头柜摸出一小罐纯牛奶喝掉，再起床", effect: { bloodSugar: 8, energy: 10, satiety: 10, mood: 5 }, scienceTip: "牛奶里的乳糖能提供一些碳水，蛋白质和液体也可能让空腹的胃舒服一点。喝完仍不舒服，就别继续猜血糖；测量、记录症状，必要时求助更靠谱。" },
    ],
  },
  {
    id: 11, group: "breakfast", title: "嘴巴很寂寞", description: "刚吃完早饭不到 1 个半小时，坐在电脑前的你突然觉得嘴巴很寂寞，总想找点吃的。",
    image: "/images/s-morning.png",
    choices: [
      { label: "吃一颗糖，防患于未然", effect: { bloodSugar: 15, energy: -3, satiety: 2, mood: 5 }, scienceTip: "饭后一个多小时突然想吃糖，可能是嘴馋、压力、习惯，也可能是真饿；光凭感觉还分不清是不是低血糖。先停一下感受身体，有条件就测量，再决定要不要补糖。" },
      { label: "接一杯温水，一饮而尽", effect: { bloodSugar: 0, energy: 2, satiety: 2, mood: 0 }, scienceTip: "一杯水可以给嘴馋按下暂停键。十几分钟后如果仍然确实饿，就安排一份正常加餐；真正的饥饿需要食物，不需要继续靠喝水硬压。" },
    ],
  },
]

const LUNCH_EVENTS: GameEvent[] = [
  {
    id: 12, group: "lunch", title: "减脂素食", description: "食堂里的「减脂素食」专区。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { label: "清炒土豆丝、凉拌藕片、蒸南瓜", effect: { bloodSugar: 28, energy: -8, satiety: 30, mood: 10 }, scienceTip: "土豆、莲藕、南瓜均为高淀粉根茎类，三者同吃等于摄入了大量升糖碳水，被「蔬菜」标签误导是最常见的控糖陷阱。" },
      { label: "蒜蓉西兰花和炒小白菜，外加卤蛋", effect: { bloodSugar: 5, energy: 5, satiety: 25, mood: 0 }, scienceTip: "西兰花、小白菜和鸡蛋把低淀粉蔬菜与蛋白质配齐了，主食却还缺席。根据下午的活动量加一点杂粮饭或豆类，让这顿饭既稳，也有足够能量。" },
    ],
  },
  {
    id: 13, group: "lunch", title: "外卖盖饭", description: "外卖盖饭到了，香气扑鼻。",
    image: "/images/s-lunch.png",
    choices: [
      { label: "饭菜拌在一起，大口大口吃", effect: { bloodSugar: 22, energy: -8, satiety: 35, mood: 10 }, scienceTip: "饭菜和酱汁拌在一起，很容易几大口就吃掉比预想更多的米饭。先分出一部分米饭，再慢一点嚼，既看得见份量，也能给饱腹感一点赶上来的时间。" },
      { label: "先把配菜和肉吃完，最后再吃米饭", effect: { bloodSugar: 12, energy: 12, satiety: 35, mood: 5 }, scienceTip: "先菜和肉、后米饭，是个简单好用的顺序加成。纤维、蛋白质和脂肪会改变胃排空及碳水吸收节奏，餐后血糖和胰岛素反应往往更平缓；实际效果会随这顿饭和个人状态变化。" },
    ],
  },
  {
    id: 14, group: "lunch", title: "汤泡饭", description: "米饭有点干，旁边有一大碗汤。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { label: "一口饭配一口汤顺下去", effect: { bloodSugar: 24, energy: -8, satiety: 35, mood: 10 }, scienceTip: "米饭在蒸煮时已经完成了大部分糊化，泡汤后会继续吸水变软，几口就能顺下去。一项小型随机交叉试验中，白米饭配液体喝或泡着吃时，胃排空更快、餐后血糖反应也更高；食物形态和进食速度都是关键。" },
      { label: "吃干饭，饭后40分钟再喝汤", effect: { bloodSugar: 14, energy: 10, satiety: 35, mood: 5 }, scienceTip: "干饭慢慢嚼，保留颗粒和咀嚼过程，在这道题里是更稳的选择。喝汤不用死守40分钟；如果你的CGM反复显示餐后一小时内喝水会出现二次上升，就把饮水时间当成个人变量，用同一顿饭重复比较。" },
    ],
  },
  {
    id: 15, group: "lunch", title: "餐前饮品", description: "餐前看到了一瓶「0蔗糖」乳酸菌饮料。",
    image: "/images/s-lunch.png",
    choices: [
      { label: "喝一瓶，顺手饭前来一瓶益生菌", effect: { bloodSugar: 20, energy: -3, satiety: 3, mood: 8 }, scienceTip: "“0蔗糖”只说明没有添加蔗糖，乳糖、葡萄糖浆或其他碳水仍可能在配方里。直接看营养成分表的“碳水化合物”和整瓶份量，最容易判断这瓶饮料会带来多少碳水。" },
      { label: "喝一杯温水加几滴苹果醋", effect: { bloodSugar: 2, energy: 2, satiety: 2, mood: 0 }, scienceTip: "醋酸可能减慢部分淀粉消化，让某些餐食的餐后反应更平缓；实际效果会随剂量、食物和个人状态变化。喜欢就充分稀释、随餐少量用，同时照顾胃和牙齿。" },
    ],
  },
  {
    id: 16, group: "lunch", title: "压力下的午餐", description: "上午被老板狠批了一顿，中午情绪跌入谷底，你需要吃点好的来拯救自己。", weekdayOnly: true,
    image: "/images/s-lunch-3.jpg",
    choices: [
      { label: "点一份「健康」果麦碗（蜂蜜脆燕麦＋果泥）", effect: { bloodSugar: 22, energy: 0, satiety: 20, mood: 10 }, scienceTip: "压力大时不需要把主食拿掉，但也别让“轻食”两个字替你看配方。果泥、蜂蜜和脆燕麦叠在一起，碳水不少，蛋白质却可能不够；甜味能短暂安慰情绪，这顿饭的结构却未必接得住整个下午。" },
      { label: "点一个单层牛肉汉堡，保留面包，少酱再加蔬菜", effect: { bloodSugar: 15, energy: 12, satiety: 30, mood: 10 }, scienceTip: "压力大的这顿，主食不用缺席。单层牛肉提供蛋白质，保留面包补上适量碳水，再加蔬菜、少点酱，比“双层肉、不吃主食”更像一顿完整的饭：有满足感，也更能把下午的状态接住。" },
    ],
  },
  {
    id: 17, group: "lunch", title: "牛肉面", description: "来一碗牛肉面吧。",
    image: "/images/s-lunch.png",
    choices: [
      { label: "呼噜噜连汤带面，好吃又暖胃", effect: { bloodSugar: 25, energy: -10, satiety: 38, mood: 15 }, scienceTip: "精制面条提供较快消化的淀粉，油多盐高的汤底又把这碗面的能量密度往上推；吃得太快、太撑，也容易让下午状态发沉。少喝汤、留一点面，再加份青菜，满足感和结构都保住了。" },
      { label: "先加烫菜和煎蛋，吃完配菜再动面", effect: { bloodSugar: 15, energy: 12, satiety: 35, mood: 8 }, scienceTip: "先吃蔬菜、蛋和牛肉，再慢慢动面，纤维与蛋白质会改变胃排空和后续淀粉的吸收节奏。这样一调，整碗面的结构更完整，餐后曲线也通常更友好。" },
    ],
  },
  {
    id: 18, group: "lunch", title: "沙拉酱", description: "沙拉旁边放着两种酱汁。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { label: "焙煎芝麻酱和千岛酱全倒进去拌匀", effect: { bloodSugar: 18, energy: -5, satiety: 25, mood: 12 }, scienceTip: "两包商业沙拉酱会把添加糖、脂肪和总能量一起倒进这碗菜里。先放一小勺，拌匀尝过再续，让酱汁负责提味，不要从配角变成主角。" },
      { label: "什么酱都不用，或只用一勺橄榄油", effect: { bloodSugar: 8, energy: 8, satiety: 25, mood: 0 }, scienceTip: "少酱或用一点橄榄油都可以，脂肪会帮助脂溶性维生素吸收，也可能增加满足感。一勺负责提味就够了，份量和整顿饭的搭配仍然算数。" },
    ],
  },
  {
    id: 19, group: "lunch", title: "饿过头", description: "开会拖堂到下午一点半，你现在饿得手脚发软，胃部痉挛。", weekdayOnly: true,
    image: "/images/s-low-sugar.png",
    choices: [
      { label: "买一杯热腾腾的甜豆浆或奶茶，先喝下垫胃", effect: { bloodSugar: 28, energy: -12, satiety: 10, mood: 15 }, scienceTip: "饿到发软时，大杯甜饮不需要咀嚼，往往喝得又快又多，糖分也容易迅速吸收。先坐稳，尽快吃一顿有主食、有蛋白质的正常饭，比拿奶茶当急救包更可靠。" },
      { label: "从抽屉里翻出一小把巴旦木干嚼，强忍15分钟", effect: { bloodSugar: 3, energy: 5, satiety: 12, mood: -5 }, scienceTip: "一小把巴旦木含脂肪、蛋白质和纤维，能先把“饿急眼”的速度降下来，后续正餐也更容易慢慢吃。不过不用强忍15分钟完成仪式，缓过来后还是要好好吃饭。" },
    ],
  },
  {
    id: 20, group: "lunch", title: "便利店简餐", description: "便利店简餐，两种三明治。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { label: "买一个奶油果酱夹心吐司三明治", effect: { bloodSugar: 22, energy: -5, satiety: 20, mood: 10 }, scienceTip: "白面包和果酱是精制淀粉加游离糖的组合，质地又软，很容易几口就吃完，蛋白质却不多。偶尔吃没关系，配牛奶、鸡蛋或无糖酸奶，会更像一顿完整早餐。" },
      { label: "买一个全麦金枪鱼三明治", effect: { bloodSugar: 12, energy: 10, satiety: 28, mood: 5 }, scienceTip: "全麦面包的纤维配上金枪鱼蛋白质，通常比奶油果酱吐司更耐饿、血糖反应也更平缓。再看一眼全麦原料排位和酱料，别让蛋黄酱悄悄接管整份三明治。" },
    ],
  },
  {
    id: 21, group: "lunch", title: "饭前状态", description: "脑子里还在想工作，到了饭点。",
    image: "/images/s-lunch.png",
    choices: [
      { label: "边刷手机边吃，多任务处理", effect: { bloodSugar: 18, energy: -5, satiety: 30, mood: 5 }, scienceTip: "边刷手机边吃，注意力被切走，更容易吃得快，也可能让你记不清自己已经吃了多少。把手机放下、慢一点吃，更容易及时感觉到饱。" },
      { label: "放下手机，做三个深呼吸，专心吃饭", effect: { bloodSugar: 15, energy: 8, satiety: 30, mood: 8 }, scienceTip: "三个深呼吸，正好让人从工作频道切回吃饭频道。慢一点、尝到味道，也更容易觉察自己什么时候饱；不需要复杂仪式，这个短暂停顿就很实用。" },
    ],
  },
  {
    id: 22, group: "lunch", title: "减脂期的炒菜", description: "减脂期，在想午饭怎么吃。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { label: "要求「纯水煮，一滴油不许放」", effect: { bloodSugar: 8, energy: -5, satiety: 20, mood: -10 }, scienceTip: "一滴油都不放，看起来很自律，长期极低脂却会影响脂溶性维生素A、D、E、K的吸收，饭也更难吃得满足。用一点油，把菜做得好吃、让饮食能坚持，通常比追求“绝对无油”更重要。" },
      { label: "用橄榄油猛火炒一盘小白菜，加一份肉", effect: { bloodSugar: 5, energy: 10, satiety: 30, mood: 8 }, scienceTip: "蔬菜、肉和适量橄榄油是很稳的组合：脂肪能帮助脂溶性维生素吸收，也会改变胃排空和饱腹感。油量绕一小圈就够了，既好吃，也给整顿饭留出合适的能量空间。" },
    ],
  },
  {
    id: 23, group: "lunch", title: "轻食店沙拉", description: "轻食店，选什么好？",
    image: "/images/s-lunch.png",
    choices: [
      { label: "来一份超大碗的全素田园沙拉", effect: { bloodSugar: 10, energy: -5, satiety: 20, mood: -5 }, scienceTip: "超大碗全素沙拉看着很多，但如果只有低能量蔬菜，蛋白质和主食可能不够，真饿时顶不了多久。加豆类、豆腐、鸡蛋或其他蛋白质，再留一小份主食，才更像一顿完整的饭。" },
      { label: "沙拉减量，额外加烤鸡胸和溏心蛋", effect: { bloodSugar: 5, energy: 12, satiety: 30, mood: 8 }, scienceTip: "把沙拉缩到正常份量，再补上鸡胸和蛋，蛋白质、蔬菜和满足感终于都在线。这份搭配比一大盆纯蔬菜更完整，也更容易在减脂期长期坚持。" },
    ],
  },
  {
    id: 24, group: "lunch", title: "纯素网红餐", description: "打卡网红素食，两种选择。",
    image: "/images/s-lunch-3.jpg",
    choices: [
      { label: "铺满香蕉和燕麦脆的巴西莓果碗", effect: { bloodSugar: 25, energy: -8, satiety: 18, mood: 15 }, scienceTip: "巴西莓果碗很上镜，果泥、香蕉、脆燕麦、果干和蜂蜜叠起来，也很容易变成一份甜点。食物打碎后咀嚼减少，再加上层层堆料和大份量，这碗的碳水会比看起来高得多。" },
      { label: "含天贝、毛豆、牛油果的佛陀碗", effect: { bloodSugar: 10, energy: 12, satiety: 32, mood: 8 }, scienceTip: "天贝和毛豆补上植物蛋白与纤维，牛油果提供脂肪，这些搭配会让混合餐的消化节奏更慢。再留意酱汁和主食份量，这碗就更完整、更耐饿。" },
    ],
  },
  {
    id: 25, group: "lunch", title: "减肥茶的背刺", description: "饭前喝了一大杯号称「阻断碳水吸收」的白芸豆减肥茶，然后只吃了一份蔬菜沙拉。",
    image: "/images/s-lunch.png",
    choices: [
      { label: "感觉非常健康，继续保持饿肚子的状态", effect: { bloodSugar: 0, energy: -15, satiety: -12, mood: -10 }, scienceTip: "白芸豆提取物只能影响一部分淀粉消化，接不住一顿缺席的正餐。只靠一盘菜继续饿着，能量、蛋白质和主食都可能不够；保健品不该成为不吃饭的通行证。" },
      { label: "察觉不对，赶紧去补吃了一小碗粗粮饭", effect: { bloodSugar: 12, energy: 8, satiety: 20, mood: 5 }, scienceTip: "补一小碗粗粮饭，是把缺席的主食重新拼回这顿饭。碳水和蔬菜、蛋白质一起出现时，结构更均衡，也比继续依赖减肥茶更能长期执行。" },
    ],
  },
]

const AFTERNOON_EVENTS: GameEvent[] = [
  {
    id: 26, group: "afternoon", title: "水果选择", description: "下午有点饿，看见水果和坚果。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { label: "坚果热量高，直接吃一个苹果", effect: { bloodSugar: 12, energy: 5, satiety: 10, mood: 8 }, scienceTip: "完整苹果保留了细胞结构、纤维和咀嚼感，单独当加餐也完全可以。只是如果你已经很饿，一只苹果的蛋白质和脂肪很少，可能不够扛到下一餐。" },
      { label: "苹果和巴旦木一起吃", effect: { bloodSugar: 8, energy: 10, satiety: 15, mood: 8 }, scienceTip: "苹果负责清甜和纤维，巴旦木补上脂肪与蛋白质，这对组合通常比单吃水果更有满足感。坚果会放慢整体消化，一小把就够，既耐饿也不会让加餐变成一顿饭。" },
    ],
  },
  {
    id: 27, group: "afternoon", title: "脑雾", description: "下午头晕眼花，包里只有一根香蕉。",
    image: "/images/s-low-sugar.png",
    choices: [
      { label: "立刻咬两小口香蕉垫一垫", effect: { bloodSugar: 8, energy: 10, satiety: 3, mood: 3 }, scienceTip: "两口香蕉能补一点碳水，却无法保证把任何人的血糖精准拉回安全线。头晕时先停下来、坐稳并观察；症状明显或反复出现时，有条件就测量，别只靠“像低血糖”来诊断。" },
      { label: "香蕉太升糖，坚决不碰", effect: { bloodSugar: 0, energy: -12, satiety: -8, mood: -8 }, scienceTip: "香蕉含有容易利用的碳水，身体已经不舒服时，一味拒绝食物只会让补给继续缺席。先坐稳、适量进食并观察；情况持续或加重，就测量血糖或及时求助。" },
    ],
  },
  {
    id: 28, group: "afternoon", title: "奶茶社交", description: "同事说请客喝奶茶。", weekdayOnly: true,
    image: "/images/s-tea-4.jpg",
    choices: [
      { label: "点一杯常规七分糖珍珠奶茶", effect: { bloodSugar: 28, energy: -10, satiety: 8, mood: 18 }, scienceTip: "七分糖加珍珠，游离糖和淀粉小料会一起进入这只大杯；品牌、杯型和配方不同，含糖量也会差很多。换小杯、少糖、少小料，社交快乐照样保留。" },
      { label: "婉拒，自己泡一杯无糖绿茶", effect: { bloodSugar: 0, energy: 3, satiety: 0, mood: -5 }, scienceTip: "无糖绿茶省掉了饮料里的游离糖，清爽又不抢戏。照样碰杯、照样聊天，饮料只是社交道具；真正让你合群的是一起参与，不是杯子里必须装甜饮。" },
    ],
  },
  {
    id: 29, group: "afternoon", title: "办公室零食", description: "同事递过来一包综合果蔬干。",
    image: "/images/s-tea.png",
    choices: [
      { label: "吃几片，反正是蔬菜水果做的", effect: { bloodSugar: 20, energy: -5, satiety: 8, mood: 10 }, scienceTip: "“果蔬做的”也可能把天然糖和能量浓缩在小小几片里，部分产品还会油炸或额外加糖。先看配料表，再倒一小份出来吃，比对着包装想象自己在吃蔬菜更靠谱。" },
      { label: "掏出自己带的一小袋毛豆", effect: { bloodSugar: 5, energy: 8, satiety: 15, mood: 5 }, scienceTip: "毛豆（未成熟大豆）富含优质蛋白、膳食纤维和镁，GI值极低，是下午零食中少见的「真正健康」选项。" },
    ],
  },
  {
    id: 30, group: "afternoon", title: "下午犯困", description: "下午三点，困意袭来。", weekdayOnly: true,
    image: "/images/s-tea-4.jpg",
    choices: [
      { label: "开一罐红牛或喝杯加糖咖啡", effect: { bloodSugar: 22, energy: 8, satiety: 0, mood: 8 }, scienceTip: "糖和咖啡因能暂时提高警觉，但下午摄入较多咖啡因可能推迟入睡，把今天的困意滚进明天。真要喝，选小份、少糖，也别把它安排得离睡觉太近。" },
      { label: "喝一杯黑咖啡，站起来拉伸5分钟", effect: { bloodSugar: 0, energy: 8, satiety: 0, mood: 5 }, scienceTip: "黑咖啡能提高警觉，起身活动也能让身体从久坐里醒过来。咖啡因作用时长因人而异，敏感的人看好时间，别用下午的咖啡透支晚上的睡眠。" },
    ],
  },
  {
    id: 31, group: "afternoon", title: "无法逃避的甜品", description: "朋友拿着一块昂贵的抹茶慕斯热情地看着你吃下去。（你必须吃）",
    image: "/images/s-tea-4.jpg",
    choices: [
      { label: "吃完后配一杯黑咖啡，认为能刮油降糖", effect: { bloodSugar: 25, energy: -5, satiety: 12, mood: 12 }, scienceTip: "咖啡可以提神，却不会替这块蛋糕“刮油”。咖啡因还可能让部分人短时间内的胰岛素敏感性下降；想吃甜点就认真享受一小块，别指望再加一杯咖啡把它抵消。" },
      { label: "吃完后借口去洗手间，在隔间做40个深蹲", effect: { bloodSugar: 18, energy: -8, satiety: 10, mood: -5 }, scienceTip: "大肌肉群收缩时，GLUT4会向肌细胞膜转位，帮助肌肉摄取葡萄糖；餐后走动或几组轻深蹲，确实可能让餐后曲线更平缓。舒服地动起来就有价值，甜品不需要变成一场偷偷受罚的运动。" },
    ],
  },
  {
    id: 32, group: "afternoon", title: "想喝汽水", description: "想喝点有味道的东西。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { label: "买一瓶「0卡代糖」气泡水", effect: { bloodSugar: 0, energy: 0, satiety: 0, mood: 8 }, scienceTip: "主流非糖甜味剂对血糖的直接影响通常远小于含糖汽水，偶尔用它替换甜饮很实用。把它当作一个过渡选项即可，日常主力仍然可以是水、茶和无糖饮品。" },
      { label: "切几片柠檬泡在无味苏打水里", effect: { bloodSugar: 0, energy: 0, satiety: 0, mood: 3 }, scienceTip: "柠檬苏打水省掉了额外糖，清爽也简单；少量柠檬酸可能影响某些餐食的消化节奏。它最大的优点其实很朴素：让一杯无糖饮料更好喝，也让你更愿意补水。" },
    ],
  },
  {
    id: 33, group: "afternoon", title: "嘴馋", description: "嘴巴很馋，又没到饭点。",
    image: "/images/s-tea.png",
    choices: [
      { label: "拆开一包苏打饼干嚼几块", effect: { bloodSugar: 18, energy: -3, satiety: 8, mood: 8 }, scienceTip: "苏打饼干名字清淡，本质上仍以精制面粉和油脂为主，干脆的口感又很容易让人一块接一块。真饿就装几块出来，配牛奶或奶酪，别抱着整包边工作边消失。" },
      { label: "喝一大杯水，等15分钟再决定", effect: { bloodSugar: 0, energy: 0, satiety: 0, mood: 0 }, scienceTip: "喝水再等等，能给嘴馋一个冷静期。十几分钟后如果肚子仍在认真抗议，就吃一份计划内加餐；水适合暂停冲动，不适合压住真正的饥饿。" },
    ],
  },
  {
    id: 34, group: "afternoon", title: "压力爆发", description: "压力太大，情绪快绷不住了。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { label: "去买个冰淇淋安慰一下自己", effect: { bloodSugar: 22, energy: -5, satiety: 8, mood: 15 }, scienceTip: "冰淇淋的甜味和绵密口感会让人短暂放松，但压力还在那里，下一次想吃的冲动也可能很快回来。想吃可以认真吃一小份，同时给情绪再找一个出口：离开工位走一圈、和朋友聊两句，或者先把让你崩溃的事写下来。" },
      { label: "闭眼深呼吸3分钟，出门吹吹风", effect: { bloodSugar: 0, energy: 5, satiety: 0, mood: 8 }, scienceTip: "先离开现场、慢慢呼吸、出去走几分钟，相当于给情绪加了一个缓冲区。三分钟足够让冲动慢一点，也给你机会分清：现在更需要的是食物，还是喘口气。" },
    ],
  },
  {
    id: 35, group: "afternoon", title: "饥饿救急", description: "肚子在抗议，需要点东西救急。",
    image: "/images/s-tea-4.jpg",
    choices: [
      { label: "啃几根生芹菜和胡萝卜条", effect: { bloodSugar: 5, energy: 0, satiety: 8, mood: -3 }, scienceTip: "蔬菜条保留了纤维、体积和咀嚼感，适合只是嘴巴想忙一下的时候。如果是真饿，它提供的蛋白质和能量不够；加酸奶、奶酪或一小把坚果，才更像能接住饥饿的加餐。" },
      { label: "吃一块原味全脂奶酪或几片牛肉干", effect: { bloodSugar: 2, energy: 8, satiety: 15, mood: 5 }, scienceTip: "奶酪或牛肉干的蛋白质与脂肪更扛饿，适合给真饿的下午垫一垫。选小份、看盐分，再配点蔬菜或完整水果，会吃得更舒服也更完整。" },
    ],
  },
  {
    id: 36, group: "afternoon", title: "反应性低血糖的死循环", description: "中午吃完大碗牛肉面后 2 小时，你突然感到极度的心慌、饥饿和犯困。",
    image: "/images/s-low-sugar.png",
    choices: [
      { label: "赶紧吃两块巧克力夹心饼干补充能量", effect: { bloodSugar: 22, energy: -8, satiety: 8, mood: 10 }, scienceTip: "牛肉面后心慌、手抖或犯困，可能和血糖有关，也可能来自吃太快、疲劳或其他原因。先停下来，有条件就测量；如果只是嘴馋，再塞甜饼干反而可能继续增加波动。" },
      { label: "忍住饥饿，喝一大杯水，吃一颗水煮蛋", effect: { bloodSugar: 2, energy: 5, satiety: 10, mood: 0 }, scienceTip: "水煮蛋能增加饱腹感，适合普通饥饿时加餐；已经出现明显低血糖症状或测值偏低时，则需要优先补快速碳水，再按低血糖流程复测和处理。" },
    ],
  },
  {
    id: 37, group: "afternoon", title: "15克法则", description: "你的动态血糖仪突然疯狂报警，显示血糖跌到了 3.8 mmol/L，强烈的眩晕袭来。",
    image: "/images/s-low-sugar.png",
    choices: [
      { label: "抓起手边的一把花生和核桃狂吃", effect: { bloodSugar: 0, energy: -12, satiety: 12, mood: -8 }, scienceTip: "如果已经测得血糖低、本人清醒且能吞咽，坚果的脂肪和蛋白质会让消化速度太慢，不适合当第一轮纠正。先补约15克快速碳水，15分钟后复测；意识异常或不能吞咽时不要强喂，立即呼叫急救。" },
      { label: "吃 3 块硬糖（约15g碳水），静坐等待 15 分钟", effect: { bloodSugar: 18, energy: 12, satiety: 2, mood: 5 }, scienceTip: "“15-15法则”适用于测得低血糖且能够安全吞咽时：补约15克快速碳水，15分钟后复测，仍低再重复。三块糖是否正好15克要看包装；意识异常、不能吞咽或情况加重时，直接呼叫急救。" },
    ],
  },
  {
    id: 38, group: "afternoon", title: "救急后的反弹", description: "(接上题) 吃完糖 15 分钟后，眩晕感消失了，但胃里依然觉得空荡荡的。",
    image: "/images/s-low-sugar.png",
    choices: [
      { label: "趁热打铁，再吃一块小蛋糕彻底吃饱", effect: { bloodSugar: 28, energy: -8, satiety: 18, mood: 10 }, scienceTip: "症状缓解后，第一步还是复测，而不是顺着空腹感继续塞蛋糕。再补一轮甜食可能把血糖推得更高；确认已经恢复后，再根据离下一餐还有多久决定要不要加餐。" },
      { label: "拿出一小袋无糖纯肉肠或一小块奶酪吃下", effect: { bloodSugar: 3, energy: 8, satiety: 15, mood: 5 }, scienceTip: "如果下一餐还很远，快速碳水纠正后再吃一点奶酪或肉类，可以增加饱腹感。先看复测结果和离下一餐的时间，再遵循自己的用药及低血糖处理方案。" },
    ],
  },
  {
    id: 39, group: "afternoon", title: "逛街的隐形消耗", description: "周末逛街走了整整 15000 步，下午 4 点，你感到腿肚子发软，脾气异常暴躁。",
    image: "/images/s-outside.png",
    choices: [
      { label: "走进奶茶店，点一杯加满小料的热奶茶", effect: { bloodSugar: 25, energy: 5, satiety: 10, mood: 18 }, scienceTip: "走了一万五千步后补能量很合理，但大杯奶茶加满小料，游离糖、淀粉和总能量可能直接升级成一顿饭。换成小杯、少糖、少小料，再配一份正常加餐，就够身体慢慢恢复。" },
      { label: "去便利店买一盒无糖酸奶和一个香蕉", effect: { bloodSugar: 12, energy: 15, satiety: 18, mood: 10 }, scienceTip: "香蕉提供容易利用的碳水，原味酸奶补上蛋白质，这套便利店组合简单又够用。它不用被封为“最科学补给”，酸奶少糖、份量合适，身体舒服就是好方案。" },
    ],
  },
]

const DINNER_EVENTS: GameEvent[] = [
  {
    id: 40, group: "dinner", title: "晚餐主食", description: "晚餐想选个主食。",
    image: "/images/s-dinner.png",
    choices: [
      { label: "选口感黏糯的糯玉米", effect: { bloodSugar: 25, energy: -5, satiety: 25, mood: 8 }, scienceTip: "糯玉米以支链淀粉为主，黏糯结构通常更容易被淀粉酶分解，血糖反应往往比同份量甜玉米更快。把它当作这顿饭的主食、看好份量，再配蔬菜和蛋白质就好。" },
      { label: "选水分较多的甜玉米", effect: { bloodSugar: 15, energy: 8, satiety: 22, mood: 5 }, scienceTip: "甜玉米同样是主食，只是淀粉组成、成熟度和水分与糯玉米不同，餐后反应通常更温和。选一根合适大小，再配蔬菜和蛋白质，就是一份稳妥的晚餐搭配。" },
    ],
  },
  {
    id: 41, group: "dinner", title: "周末大餐", description: "周末大餐，朋友点了芝士烤饼。", weekendOnly: true,
    image: "/images/s-dinner-party.png",
    choices: [
      { label: "吃几块拉丝芝士烤饼", effect: { bloodSugar: 24, energy: -12, satiety: 42, mood: 18 }, scienceTip: "芝士、饼皮和肉馅组成高脂混合餐，脂肪和蛋白质会让胃排空变慢，血糖峰值可能来得更晚、拖得更久。喜欢就吃几块，别因为当下没感觉就一路续到睡前。" },
      { label: "只吃里面的肉馅，把烤饼留给别人", effect: { bloodSugar: 5, energy: 0, satiety: 20, mood: -8 }, scienceTip: "只吃肉馅能少掉饼皮的淀粉，但蛋白质仍会刺激胰岛素，高脂肪也可能把餐后反应推迟。少吃几块烤饼、配些蔬菜，比把饼拆开只挖馅更现实。" },
    ],
  },
  {
    id: 42, group: "dinner", title: "饭后的消食", description: "晚上吃了一顿丰盛的碳水大餐，决定做点什么补救一下。",
    image: "/images/s-dinner.png",
    choices: [
      { label: "换上跑鞋，去跑个3公里的高强度慢跑", effect: { bloodSugar: 10, energy: -18, satiety: -12, mood: -8 }, scienceTip: "刚吃饱就冲三公里，胃部不适和反流可能先来报到；高强度运动时，肾上腺素等反调节激素也可能让血糖暂时上升。先给胃一点消化时间，身体舒服后再跑。" },
      { label: "站在厨房把全家的碗洗了，把地拖一遍", effect: { bloodSugar: -10, energy: -5, satiety: -5, mood: 5 }, scienceTip: "洗碗、拖地或散步都属于低强度活动，肌肉收缩会增加葡萄糖利用，餐后早点动一动通常比久坐更有利。时间不用卡得太死，轻松开始、能够坚持才是重点。" },
    ],
  },
  {
    id: 43, group: "dinner", title: "减肥晚餐", description: "想「少吃点」来减肥。",
    image: "/images/s-dinner.png",
    choices: [
      { label: "晚饭不吃主食，改吃半个大西瓜", effect: { bloodSugar: 22, energy: -5, satiety: 15, mood: 12 }, scienceTip: "半个大西瓜的总份量不小，虽然水分多，却缺少蛋白质，也很难独自撑起一顿晚饭。水果可以留一小份，再加蔬菜、蛋白质和适量主食，整顿饭才更完整。" },
      { label: "正常吃一小碗杂粮饭和一盘炒菜", effect: { bloodSugar: 12, energy: 12, satiety: 30, mood: 8 }, scienceTip: "小碗杂粮饭配一盘有蔬菜、有蛋白质的炒菜，碳水、纤维和蛋白质都在场，通常比水果代餐更完整。正常吃一顿结构均衡、份量舒服的晚饭，本身就是很好的选择。" },
    ],
  },
  {
    id: 44, group: "dinner", title: "长辈的爱", description: "长辈坚持要你把一大碗白米饭吃完。",
    image: "/images/s-dinner.png",
    choices: [
      { label: "硬着头皮把一大碗白米饭吃完", effect: { bloodSugar: 28, energy: -12, satiety: 42, mood: 5 }, overfull: true, scienceTip: "一大碗白米饭的碳水量取决于碗和实际份量，晚间反应也会因人而异。更确定的是，你已经吃到需要“硬着头皮”了：孝心不用靠硬撑证明，吃到舒服就停，剩下的打包。" },
      { label: "撒娇说多夹菜少吃饭，把一半米饭拨出去", effect: { bloodSugar: 12, energy: 8, satiety: 30, mood: 8 }, scienceTip: "机智的社交碳水转移策略。减半米饭摄入的同时，增加蔬菜和蛋白质比例，是有效且不伤感情的控糖方案。" },
    ],
  },
  {
    id: 45, group: "dinner", title: "饭局饮酒", description: "饭局上，大家在举杯。", weekendOnly: true,
    image: "/images/s-dinner-party.png",
    choices: [
      { label: "跟大家一起干了两大杯冰啤酒", effect: { bloodSugar: 20, energy: -10, satiety: 10, mood: 15 }, scienceTip: "啤酒会带来酒精和额外碳水；酒精还会抑制肝脏输出葡萄糖，尤其对使用胰岛素或促泌剂的人，可能增加延迟性低血糖风险。别空腹喝，也别拼酒，喝完留意之后几小时的身体状态。" },
      { label: "倒一杯苏打水假装是酒跟大家碰杯", effect: { bloodSugar: 0, energy: 0, satiety: 0, mood: 5 }, scienceTip: "完全规避了酒精和液体碳水，社交目的基本达成，代价是显得有点不合群。" },
    ],
  },
  {
    id: 46, group: "dinner", title: "厨房炒菜", description: "自己下厨炒菜。",
    image: "/images/s-dinner.png",
    choices: [
      { label: "炒肉时放点水淀粉勾芡，颜值更好", effect: { bloodSugar: 15, energy: 0, satiety: 25, mood: 8 }, scienceTip: "水淀粉在加热时会糊化，形成附着在食物表面的芡汁，也会额外带来一部分容易消化的淀粉。薄薄一层负责挂汁就够了；芡越厚、收汁越浓，吃进去的淀粉和酱汁也越多。" },
      { label: "清炒，不放糖不勾芡", effect: { bloodSugar: 5, energy: 8, satiety: 25, mood: 5 }, scienceTip: "剔除了所有隐性碳水添加，保留食材营养价值。口感稍逊，但血糖负担大幅降低。" },
    ],
  },
  {
    id: 47, group: "dinner", title: "煲汤盲区", description: "一锅煲汤，配菜要怎么选？",
    image: "/images/s-dinner.png",
    choices: [
      { label: "大口吃汤里炖软的山药、莲藕和芋头", effect: { bloodSugar: 22, energy: -5, satiety: 30, mood: 10 }, scienceTip: "山药、莲藕和芋头都含较多淀粉，炖软后淀粉糊化更充分，通常也更容易消化。把它们算进这顿饭的主食份量，挑一两种、少量吃，再给绿叶菜和肉留点位置。" },
      { label: "只吃排骨肉和单独炒的绿叶菜", effect: { bloodSugar: 5, energy: 8, satiety: 28, mood: 0 }, scienceTip: "排骨和绿叶菜能提供蛋白质、脂肪、纤维和微量营养素，主食却还缺席。按饥饿和活动量留一点根茎或杂粮，会让这顿晚饭更完整。" },
    ],
  },
  {
    id: 48, group: "dinner", title: "枯燥的减脂餐", description: "减脂期的晚饭，严格还是放一点松？",
    image: "/images/s-dinner.png",
    choices: [
      { label: "水煮鸡胸肉加水煮西兰花，一滴油不放", effect: { bloodSugar: 5, energy: -5, satiety: 25, mood: -15 }, scienceTip: "鸡胸西兰花本身没错，问题是把每顿饭都吃成惩罚。长期高度限制、食物单调和强烈禁食规则，可能增加失控进食的风险；能持续的减脂餐，应该同时考虑营养、口味和满足感。" },
      { label: "在鸡胸肉和西兰花上淋一圈橄榄油", effect: { bloodSugar: 5, energy: 10, satiety: 30, mood: 8 }, scienceTip: "一圈橄榄油让口感更好，也帮助脂溶性维生素吸收。油依然有能量，所以一圈负责提味就够了，不用在盘子上画成同心圆。" },
    ],
  },
  {
    id: 49, group: "dinner", title: "火锅局", description: "吃火锅，锅里沸腾着。",
    image: "/images/s-dinner-party.png",
    choices: [
      { label: "煮一大堆菠菜、生菜和炸腐竹", effect: { bloodSugar: 18, energy: -5, satiety: 30, mood: 12 }, scienceTip: "菠菜、生菜仍然值得吃；油厚盐重的锅底和本身经过油炸的腐竹，才是这盘里的能量大户。蔬菜别久泡油汤、汤少喝一点，炸腐竹也控制份量。" },
      { label: "主攻新鲜肥牛、毛肚和鹌鹑蛋", effect: { bloodSugar: 5, energy: 5, satiety: 32, mood: 5 }, scienceTip: "肥牛、毛肚和鹌鹑蛋能补蛋白质，高脂肥牛也会带来不少能量。加上蔬菜、菌菇和适量主食，别让整顿火锅只剩肉，才更完整也更舒服。" },
    ],
  },
  {
    id: 50, group: "dinner", title: "极饿时的运动", description: "晚上 8 点你还没吃晚饭，但预定的高强度动感单车课要开始了。",
    image: "/images/s-exercise.png",
    choices: [
      { label: "不管了，饿着肚子蹬车，正好燃烧脂肪", effect: { bloodSugar: 10, energy: -22, satiety: -15, mood: -15 }, scienceTip: "已经饿到发软还去拼高强度，训练质量和动作安全都会先掉线；身体会同时动用肝糖原、脂肪等多种燃料。头晕、心慌或乏力时，先补给或降强度，比硬扛更能保护训练状态。" },
      { label: "吃一根香蕉，等 10 分钟再进去上课", effect: { bloodSugar: 10, energy: 15, satiety: 8, mood: 8 }, scienceTip: "香蕉提供容易消化的碳水，是方便的运动前补给。等待时间按训练强度和胃部感受调整；吃完舒服、有力气开练，比死守10分钟更重要。" },
    ],
  },
  {
    id: 51, group: "dinner", title: "极寒的考验", description: "冬天在户外等了半小时公交车，被冻得瑟瑟发抖，身体热量大量流失。",
    image: "/images/s-outside.png",
    choices: [
      { label: "买一个烤红薯，趁热吃下去", effect: { bloodSugar: 15, energy: 12, satiety: 18, mood: 15 }, scienceTip: "冻到发抖时，身体的产热和能量消耗都在上升，热红薯提供容易利用的碳水，也带来温度和饱腹感。这种时候不用为了控糖硬扛：先找暖和的地方，再安心吃一份热主食。" },
      { label: "坚持控糖，只喝自己保温杯里的温白开", effect: { bloodSugar: 0, energy: -10, satiety: 0, mood: -8 }, scienceTip: "温水能让人舒服，但只喝水补不了发抖时增加的能量消耗。先避风保暖，再补一点红薯、面包等碳水；如果持续剧烈发抖、动作笨拙或反应变慢，要警惕失温并及时求助。" },
    ],
  },
]

const EVENING_EVENTS: GameEvent[] = [
  {
    id: 52, group: "evening", title: "夜间运动", description: "晚上想打羽毛球锻炼。",
    image: "/images/s-exercise.png",
    choices: [
      { label: "空腹直接去，燃脂效果更好", effect: { bloodSugar: 10, energy: -20, satiety: -12, mood: 0 }, scienceTip: "空腹打球时，身体会同时调动肝糖原和脂肪供能；高强度运动还可能让血糖暂时上升。状态好可以打，已经很饿、头晕或乏力就先补一点，把训练质量放在硬扛前面。" },
      { label: "上场前15分钟吃几颗软糖垫一下", effect: { bloodSugar: 12, energy: 15, satiety: 3, mood: 8 }, scienceTip: "软糖属于快速碳水，训练时间长、强度高或确实需要迅速补能时更有用。普通球局提前吃香蕉、酸奶或正常加餐，能量释放更从容，也更容易控制份量。" },
    ],
  },
  {
    id: 53, group: "evening", title: "午夜狂饿", description: "午夜，真的饿得睡不着。",
    image: "/images/s-bedtime.png",
    choices: [
      { label: "煮一碗清淡的阳春面", effect: { bloodSugar: 22, energy: -8, satiety: 32, mood: 15 }, scienceTip: "深夜一大碗面会让消化负担和总能量一起上升，睡前身体还得继续忙着处理这顿饭。饿到睡不着也不用硬忍，改成小碗、加个蛋或豆腐，既能填肚子，也不会吃得太撑。" },
      { label: "吃一个水煮蛋，服用一片镁补剂", effect: { bloodSugar: 2, energy: 5, satiety: 12, mood: -5 }, scienceTip: "水煮蛋是简单的夜间加餐，能补一点蛋白质和饱腹感。镁补剂更适合有明确需要的人；普通一晚先把白天吃够、睡前规律放松做好，往往更值得优先。" },
    ],
  },
  {
    id: 54, group: "evening", title: "打球后", description: "打完球，满身大汗。",
    image: "/images/s-exercise.png",
    choices: [
      { label: "收拾东西直接回家躺着", effect: { bloodSugar: 5, energy: -8, satiety: -5, mood: 5 }, scienceTip: "高强度运动后，心率、体温和交感神经兴奋还需要一点时间回落。慢走几分钟、补水、等身体从运动档降下来，再回家休息，通常会更舒服。" },
      { label: "留在球馆做10分钟拉伸和深呼吸", effect: { bloodSugar: 0, energy: 5, satiety: -5, mood: 8 }, scienceTip: "轻拉伸和慢呼吸很适合给训练收尾，能缓解紧绷、帮助节奏慢下来。舒服地做几分钟，让呼吸和心率慢慢回落，就是这一步最大的价值。" },
    ],
  },
  {
    id: 55, group: "evening", title: "练后加餐", description: "刚举完铁，想补充营养。",
    image: "/images/s-bedtime.png",
    choices: [
      { label: "喝一杯加了麦芽糊精的香草增肌粉", effect: { bloodSugar: 22, energy: 5, satiety: 15, mood: 8 }, scienceTip: "麦芽糊精容易消化、血糖反应较快，更适合长时间高强度训练后的快速补给。普通一次举铁要不要喝，先看全天能量、训练量和产品加糖量，别让“增肌”两个字替你决定。" },
      { label: "喝一勺纯酪蛋白粉，加一点坚果", effect: { bloodSugar: 5, energy: 10, satiety: 18, mood: 5 }, scienceTip: "酪蛋白消化相对较慢，睡前补充可以支持夜间蛋白质合成。确实缺蛋白质时，一勺酪蛋白、牛奶或酸奶都可以；再加一点坚果，饱腹感会更稳。" },
    ],
  },
  {
    id: 56, group: "evening", title: "补剂选择", description: "睡前要不要补点什么？",
    image: "/images/s-bedtime.png",
    choices: [
      { label: "吞几片复合维生素加钙片，求个心安", effect: { bloodSugar: 0, energy: 0, satiety: 0, mood: 5 }, scienceTip: "复合维生素和钙片解决的是明确的营养缺口，不是睡前的放松按钮。先看自己是否真的需要、总剂量有没有重复，以及会不会和疾病或药物冲突，别因为焦虑一次吞好几种。" },
      { label: "按剂量严格服用甘氨酸镁，专注睡眠优化", effect: { bloodSugar: 0, energy: 0, satiety: 0, mood: 0 }, scienceTip: "甘氨酸镁可能适合一部分确有补充需要的人，但睡眠仍更看作息、光照、压力和整体生活习惯。肾功能有问题、长期用药或同时吃多种补剂时，先咨询专业人士再决定。" },
    ],
  },
  {
    id: 57, group: "evening", title: "睡前热饮", description: "睡前想来点温热的饮品。",
    image: "/images/s-bedtime.png",
    choices: [
      { label: "喝一杯温热的脱脂牛奶", effect: { bloodSugar: 10, energy: 5, satiety: 10, mood: 8 }, scienceTip: "脱脂牛奶少了部分脂肪，乳糖和蛋白质仍然都在；血糖反应更看乳糖含量、总份量和搭配。选原味、喝一杯合适份量，再留意自己是否乳糖不耐或容易反流。" },
      { label: "吃一小杯配料只有「生牛乳」的全脂酸奶", effect: { bloodSugar: 5, energy: 8, satiety: 15, mood: 8 }, scienceTip: "发酵会消耗一部分乳糖，但酸奶里通常仍有乳糖。配料只有生牛乳，说明没有额外堆很多配料；再看营养表里有没有添加糖和总碳水，结合自己的乳糖耐受来选。" },
    ],
  },
  {
    id: 58, group: "evening", title: "回家路上", description: "周五应酬没吃主食，空腹喝了几杯白酒。回家路上突然直冒冷汗，手抖得拿不住手机。", weekendOnly: true,
    image: "/images/s-outside.png",
    choices: [
      { label: "去路边摊吃一碗加满肥肠和辣油的粉", effect: { bloodSugar: 20, energy: -5, satiety: 30, mood: 8 }, scienceTip: "酒后冒冷汗、发抖和恶心，可能与低血糖有关，也可能是酒精中毒或其他危险状况。先别独处，联系可信的人陪同并尽快测量；意识异常、无法吞咽或症状加重时，立即呼叫急救。" },
      { label: "去便利店买一瓶含糖运动饮料，喝完回家睡觉", effect: { bloodSugar: 12, energy: 5, satiety: 3, mood: 0 }, scienceTip: "本人清醒、能够吞咽且低血糖可能性较高时，含糖运动饮料可以提供快速碳水。喝完别一个人回家睡觉：15分钟后复测并让人陪同，症状不缓解或意识异常时立即呼叫急救。" },
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

// 在 7 天中随机选择一天，把更容易走向低血糖的事件集中在那一天
const LOW_SUGAR_DAY_EVENT_IDS: Record<EventGroup, number[]> = {
  breakfast: [1, 10, 11],
  lunch: [19, 25],
  afternoon: [27, 36, 37, 38, 39],
  dinner: [50, 51],
  evening: [53, 58],
}

let specialLowSugarDay: number | null = null

function getSpecialLowSugarDay(): number {
  if (specialLowSugarDay == null) {
    specialLowSugarDay = Math.floor(Math.random() * 7) + 1
  }
  return specialLowSugarDay
}

export function isLowSugarFocusDay(dayNumber: number): boolean {
  return dayNumber === getSpecialLowSugarDay()
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
export function generateDayQueue(usedIds: Set<number>, dayNumber: number): {
  queue: (GameEvent | null)[]
  eveningSkipped: boolean
} {
  const isWeekend = dayNumber >= 6
  const isLowSugarFocusDay = dayNumber === getSpecialLowSugarDay()
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
export const GAME_OVER_MESSAGES: Record<string, { title: string; subtitle: string }> = {
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
): { isOver: boolean; reason: string } | null {
  const isLowSugar = opts?.isLowSugarFocusDay ?? false
  const threshold = getLowBsDeathThreshold(isLowSugar)
  if (stats.bloodSugar > 100) return { isOver: true, reason: "bloodSugarHigh" }
  if (stats.bloodSugar <= threshold) return { isOver: true, reason: "bloodSugarLow" }
  if (stats.mood <= 0) return { isOver: true, reason: "moodZero" }
  if (stats.energy <= 0) return { isOver: true, reason: "energyZero" }
  return null
}

// Pure function: compute full next state from choice. Death uses raw values before clamp.
export interface ChoiceResultSuccess {
  nextStats: GameStats
  nextTrackers: GameTrackers
  pendingTip: { choiceLabel: string; scienceTip: string; effect: Effect; penalty: PostChoicePenalty }
  penaltyFloaty?: string
}

export interface ChoiceResultDeath {
  deathReason: string
}

export function computeChoiceResult(
  prevStats: GameStats,
  prevTrackers: GameTrackers,
  choice: { label: string; effect: Effect; scienceTip: string; overfull?: boolean },
  preEffect?: Effect,
  opts?: { isLowSugarFocusDay?: boolean }
): ChoiceResultSuccess | ChoiceResultDeath {
  const isLowSugar = opts?.isLowSugarFocusDay ?? false
  const threshold = getLowBsDeathThreshold(isLowSugar)
  let raw = applyEffectRaw(prevStats, preEffect ?? {})
  raw = applyEffectRaw(raw, choice.effect)

  if (raw.bloodSugar > 100) return { deathReason: "bloodSugarHigh" }
  if (raw.bloodSugar <= threshold) return { deathReason: "bloodSugarLow" }
  if (raw.energy <= 0) return { deathReason: "energyZero" }
  if (raw.mood <= 0) return { deathReason: "moodZero" }

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
