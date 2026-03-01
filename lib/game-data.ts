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

// v2.3 initial values: bloodSugar=45, energy=80, satiety=50, mood=80
export const INITIAL_STATS: GameStats = {
  bloodSugar: 45,
  mood: 80,
  energy: 80,
  satiety: 50,
}

export interface GameTrackers {
  peakBsCount: number
  foodComaCount: number
  hangoverFreeDays: number
}

// ==========================================
// v2.3 Event Database (50 events)
// ==========================================

const BREAKFAST_EVENTS: GameEvent[] = [
  {
    id: 1, group: "breakfast", title: "起晚了", description: "起晚了，来不及好好吃饭。",
    image: "/images/s-morning.jpg",
    choices: [
      { label: "当做轻断食，空腹扛着", effect: { bloodSugar: 0, energy: -25, satiety: -20, mood: -5 }, scienceTip: "过度断食会让皮质醇空转导致严重脑雾，隔夜空腹叠加持续禁食使大脑葡萄糖供应不足，中午极易因「补偿心理」暴食。" },
      { label: "路边买根热甜玉米边走边啃", effect: { bloodSugar: 20, energy: 15, satiety: 20, mood: 10 }, scienceTip: "甜玉米含有较多直链淀粉和膳食纤维，升糖速度比精制谷物慢，能有效阻止精力崩盘。" },
    ],
  },
  {
    id: 2, group: "breakfast", title: "周末早餐", description: "难得周末，认真吃顿早饭。", weekendOnly: true,
    image: "/images/s-breakfast.jpg",
    choices: [
      { label: "榨一杯现打鲜橙汁", effect: { bloodSugar: 35, energy: -15, satiety: 10, mood: 20 }, scienceTip: "榨汁破坏了果肉纤维结构，使果糖直接入血，升糖速度约是吃整颗橙子的3倍。" },
      { label: "煮两个水煮蛋，配全麦吐司", effect: { bloodSugar: 5, energy: 20, satiety: 25, mood: -10 }, scienceTip: "蛋白质+少量复合碳水让胰岛素平稳分泌，一上午的专注力由此而来。代价是有点朴素。" },
    ],
  },
  {
    id: 3, group: "breakfast", title: "妈妈的爱", description: "妈妈特意起早冲了一碗黑芝麻核桃糊。",
    image: "/images/s-morning.jpg",
    choices: [
      { label: "感动地全部喝完", effect: { bloodSugar: 35, energy: -10, satiety: 30, mood: 15 }, scienceTip: "打成粉糊状的五谷失去颗粒结构，淀粉酶能快速分解，升糖速度比完整谷物明显更快。" },
      { label: "喝一半，说胃口不好", effect: { bloodSugar: 10, energy: 10, satiety: 20, mood: -15 }, scienceTip: "减半摄入即减半了升糖载荷。核桃和芝麻本身富含脂肪，能缓冲一部分糊化淀粉的吸收速度，少吃比全吃血糖峰值低约一半。代价是辜负了妈妈的心意。" },
    ],
  },
  {
    id: 4, group: "breakfast", title: "面包房", description: "路过面包房，橱窗里摆着「无糖全麦」面包。",
    image: "/images/s-breakfast.jpg",
    choices: [
      { label: "买一个，反正标着「无糖全麦」", effect: { bloodSugar: 32, energy: -10, satiety: 20, mood: 10 }, scienceTip: "「无糖」只代表未添加蔗糖，松软质地意味着小麦粉比例极高；若「全麦」排在配料表第三位以后，实质与白面包升糖速度相差无几。" },
      { label: "买两个纯肉包，只吃肉馅", effect: { bloodSugar: 10, energy: 15, satiety: 30, mood: -5 }, scienceTip: "纯蛋白质与脂肪几乎不刺激胰岛素，血糖控制极佳。浪费粮食的内疚感是真实的情绪代价。" },
    ],
  },
  {
    id: 5, group: "breakfast", title: "传统摊位", description: "街边传统早餐摊，豆浆飘香，油条刚出锅。",
    image: "/images/s-morning.jpg",
    choices: [
      { label: "豆浆配两根油条，经典组合", effect: { bloodSugar: 30, energy: -10, satiety: 40, mood: 25 }, scienceTip: "油条是高温油炸的精制面糊，糖脂混合物让胰岛素和脂蛋白同时超载。" },
      { label: "咸豆腐脑，外加一小块蒸红薯", effect: { bloodSugar: 15, energy: 15, satiety: 35, mood: 5 }, scienceTip: "豆腐脑提供优质植物蛋白，蒸红薯的低GI碳水提供持久供能，血糖上午保持平稳弧线。" },
    ],
  },
  {
    id: 6, group: "breakfast", title: "肠胃不适", description: "胃有点不舒服，需要吃点温和的。",
    image: "/images/s-morning.jpg",
    choices: [
      { label: "喝碗熬得极软烂的白米粥养胃", effect: { bloodSugar: 35, energy: -15, satiety: 30, mood: 15 }, scienceTip: "过度糊化的白粥几乎免去消化过程，淀粉水解后迅速入血，GI值接近90，反而加重身体炎症反应。" },
      { label: "勉强吃几口蒸蛋和清炒嫩青菜", effect: { bloodSugar: 10, energy: 10, satiety: 20, mood: -10 }, scienceTip: "鸡蛋与蔬菜温和且不引发血糖震荡，虽然口感较难受，但避免了高血糖后的二次疲惫叠加。" },
    ],
  },
  {
    id: 7, group: "breakfast", title: "酒店自助", description: "酒店自助早餐，各种食物摆满台面。", weekendOnly: true,
    image: "/images/s-breakfast.jpg",
    choices: [
      { label: "先来一大盘西瓜和哈密瓜开胃", effect: { bloodSugar: 28, energy: -5, satiety: 15, mood: 20 }, scienceTip: "空腹吃高糖水果，果糖直冲肝脏处理，高GI的西瓜和哈密瓜会让后续正餐的血糖反应更加剧烈。" },
      { label: "先取蔬菜、蛋和肉，最后才吃水果", effect: { bloodSugar: 15, energy: 20, satiety: 40, mood: 5 }, scienceTip: "用纤维和蛋白质在胃里铺好「减速网」，最后摄入的水果糖分吸收速度会降低约40%。" },
    ],
  },
  {
    id: 8, group: "breakfast", title: "晨练", description: "想趁早晨运动，计划去跑步。",
    image: "/images/s-exercise.jpg",
    choices: [
      { label: "空腹直接去跑步，多燃脂", effect: { bloodSugar: 30, energy: -25, satiety: -15, mood: 5 }, scienceTip: "空腹有氧会使皮质醇大幅升高，身体优先分解糖原供能。对普通人而言，空腹跑步燃脂效率并不优于餐后，反而增加肌肉分解风险。" },
      { label: "喝半杯牛奶，吃两口苹果再出发", effect: { bloodSugar: 5, energy: 15, satiety: 10, mood: 5 }, scienceTip: "少量「垫底食物」在运动前摄入，能抑制皮质醇分泌、保护肌肉，还能让跑步时的配速和状态明显更好。" },
    ],
  },
  {
    id: 9, group: "breakfast", title: "极简早餐", description: "想吃极简早餐，两个选择都看起来很健康。",
    image: "/images/s-breakfast.jpg",
    choices: [
      { label: "泡一碗无糖纯燕麦片，加一把蓝莓", effect: { bloodSugar: 35, energy: -10, satiety: 20, mood: 15 }, scienceTip: "没有蛋白质和脂肪伴随的纯燕麦，即便是健康碳水，也会产生明显的血糖峰值。蓝莓量太少，无法有效减缓淀粉吸收。" },
      { label: "用黄油煎两个鸡蛋，配半个牛油果", effect: { bloodSugar: 5, energy: 25, satiety: 35, mood: -5 }, scienceTip: "饱和脂肪+单不饱和脂肪的组合为大脑提供稳定的酮体燃料，全程不经过胰岛素。代价是成本略高。" },
    ],
  },
]

const LUNCH_EVENTS: GameEvent[] = [
  {
    id: 10, group: "lunch", title: "减脂素食", description: "食堂里的「减脂素食」专区。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "清炒土豆丝、凉拌藕片、蒸南瓜", effect: { bloodSugar: 35, energy: -15, satiety: 40, mood: 15 }, scienceTip: "土豆、莲藕、南瓜均为高淀粉根茎类，三者同吃等于摄入了大量升糖碳水，被「蔬菜」标签误导是最常见的控糖陷阱。" },
      { label: "蒜蓉西兰花和炒小白菜，外加卤蛋", effect: { bloodSugar: 5, energy: 10, satiety: 30, mood: -10 }, scienceTip: "真正的低淀粉蔬菜配合蛋白质，饱腹感和控糖效果兼顾。加卤蛋是关键，纯吃菜会让你三点就头晕。" },
    ],
  },
  {
    id: 11, group: "lunch", title: "外卖盖饭", description: "外卖盖饭到了，香气扑鼻。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "饭菜拌在一起，大口大口吃", effect: { bloodSugar: 30, energy: -10, satiety: 40, mood: 20 }, scienceTip: "空胃接触米饭时，淀粉酶快速分解，葡萄糖在20分钟内大量涌入血液。拌饭还会让你无意识多吃约1/3的米饭量。" },
      { label: "先把配菜和肉吃完，最后再吃米饭", effect: { bloodSugar: 15, energy: 15, satiety: 40, mood: -5 }, scienceTip: "蔬菜和蛋白质在胃中形成「减速屏障」，研究显示这种进食顺序能将血糖峰值降低约20-30%。" },
    ],
  },
  {
    id: 12, group: "lunch", title: "汤泡饭", description: "米饭有点干，旁边有一大碗汤。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "一口饭配一口汤顺下去", effect: { bloodSugar: 32, energy: -15, satiety: 40, mood: 20 }, scienceTip: "边吃边喝会稀释胃酸，降低消化效率，同时加速了米饭在胃中的糊化，让淀粉更容易被快速吸收。" },
      { label: "吃干饭，饭后40分钟再喝汤", effect: { bloodSugar: 15, energy: 15, satiety: 35, mood: -10 }, scienceTip: "干湿分离保持胃酸浓度，淀粉被更充分地机械消化，血糖曲线更平缓。有点口干，但值得。" },
    ],
  },
  {
    id: 13, group: "lunch", title: "餐前饮品", description: "餐前看到了一瓶「0蔗糖」乳酸菌饮料。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "喝一瓶，顺手饭前来一瓶益生菌", effect: { bloodSugar: 28, energy: -5, satiety: 10, mood: 15 }, scienceTip: "「0蔗糖」只表示未添加蔗糖，但大多数乳酸菌饮料含有果葡糖浆，总含糖量常常超过每100ml 10g。" },
      { label: "喝一杯温水加几滴苹果醋", effect: { bloodSugar: 10, energy: 10, satiety: 15, mood: -5 }, scienceTip: "醋酸能短暂降低胃部pH，减缓淀粉酶活性，临床数据显示可将餐后血糖峰值削减约15%。" },
    ],
  },
  {
    id: 14, group: "lunch", title: "压力暴食", description: "上午被骂了一顿，中午需要安慰自己。", weekdayOnly: true,
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "点一份炸鸡套餐犒劳自己", effect: { bloodSugar: 32, energy: -20, satiety: 50, mood: 40 }, scienceTip: "高糖高脂短暂激活多巴胺奖励回路，情绪真的会好转约40分钟。但之后血糖骤降会让你更难受，形成「安慰性饮食」恶性循环。" },
      { label: "强迫自己点沙拉，每口嚼20下", effect: { bloodSugar: 10, energy: 15, satiety: 30, mood: -20 }, scienceTip: "缓慢咀嚼激活迷走神经，可降低皮质醇水平，还给大脑留出时间接收「已饱」信号，减少总摄入量约30%。" },
    ],
  },
  {
    id: 15, group: "lunch", title: "牛肉面", description: "来一碗牛肉面吧。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "呼噜噜连汤带面，十分钟解决", effect: { bloodSugar: 32, energy: -15, satiety: 45, mood: 20 }, scienceTip: "精制面条加上高脂骨汤，是「快碳+高脂」的典型组合，下午两点钟的困意基本由它负责。" },
      { label: "先加烫菜和煎蛋，吃完配菜再动面", effect: { bloodSugar: 20, energy: 20, satiety: 50, mood: 5 }, scienceTip: "蔬菜和蛋白质让面条的升糖速度降低，虽然饱腹感很高，但血糖不会剧烈震荡，下午会保持清醒。" },
    ],
  },
  {
    id: 16, group: "lunch", title: "沙拉酱", description: "沙拉旁边放着两种酱汁。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "焙煎芝麻酱和千岛酱全倒进去拌匀", effect: { bloodSugar: 25, energy: -5, satiety: 30, mood: 20 }, scienceTip: "商业沙拉酱的主要成分通常是糖、氢化大豆油和增稠剂，两种叠加可以让一份看似健康的沙拉升糖能力赶上一碗米饭。" },
      { label: "什么酱都不用，或只用一勺橄榄油", effect: { bloodSugar: 10, energy: 15, satiety: 30, mood: -15 }, scienceTip: "橄榄油中的多酚有助于减缓肠道对葡萄糖的吸收，且优质脂肪能提供长达数小时的饱腹信号。口感会很干，但胰岛素感谢你。" },
    ],
  },
  {
    id: 17, group: "lunch", title: "饿过头", description: "开会拖堂，饿过头了。", weekdayOnly: true,
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "饿极了，冲进食堂五分钟把饭扒完", effect: { bloodSugar: 35, energy: -20, satiety: 45, mood: 15 }, scienceTip: "极度饥饿后快速进食，胰腺来不及分泌足够胰岛素，大量葡萄糖涌入血液形成血糖尖峰。10分钟后短暂亢奋，随后陷入深度疲劳。" },
      { label: "先喝两杯水，逼自己慢慢吃", effect: { bloodSugar: 20, energy: 10, satiety: 35, mood: -5 }, scienceTip: "喝水能暂时缓解胃部饥饿收缩，给大脑缓冲时间。减慢进食速度是所有血糖管理策略中成本最低、效果最稳定的方法之一。" },
    ],
  },
  {
    id: 18, group: "lunch", title: "便利店简餐", description: "便利店简餐，两种三明治。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "买一个奶油果酱夹心吐司三明治", effect: { bloodSugar: 30, energy: -10, satiety: 20, mood: 15 }, scienceTip: "白面包+果酱是精制碳水与游离糖的标准组合，饱腹感维持约1.5小时，之后血糖回落速度非常快。" },
      { label: "买一个全麦金枪鱼三明治", effect: { bloodSugar: 15, energy: 15, satiety: 30, mood: 0 }, scienceTip: "全麦纤维+金枪鱼蛋白质，血糖上升缓慢且平稳，饱腹时长几乎翻倍。口感偏干是真实代价。" },
    ],
  },
  {
    id: 19, group: "lunch", title: "过桥米线", description: "过桥米线，汤太香了。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "喝一整大碗热汤", effect: { bloodSugar: 30, energy: -20, satiety: 50, mood: 25 }, scienceTip: "过桥米线的浓汤表层漂浮着大量动物脂肪，喝完等于摄入了相当高的饱和脂肪热量。同时大量热汤会加速胃排空，让米线的淀粉吸收更快。" },
      { label: "把米线捞出来吃，基本不喝汤", effect: { bloodSugar: 22, energy: 5, satiety: 35, mood: -5 }, scienceTip: "去掉了液体脂肪的摄入，血管负担大幅降低。虽然少了汤的鲜味，但这顿饭的整体代谢负荷降低了约一半。" },
    ],
  },
  {
    id: 20, group: "lunch", title: "饭前状态", description: "脑子里还在想工作，到了饭点。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "边刷手机边吃，多任务处理", effect: { bloodSugar: 22, energy: -5, satiety: 30, mood: 5 }, scienceTip: "交感神经主导下，消化系统处于次优状态：胃酸分泌不足，蠕动减慢。同时分心进食会让摄入量比专注吃饭多约25%。" },
      { label: "放下手机，做三个深呼吸，专心吃饭", effect: { bloodSugar: 15, energy: 15, satiety: 30, mood: 10 }, scienceTip: "深呼吸能在约90秒内激活副交感神经，让消化系统进入最佳工作状态，胃酸和消化酶分泌明显增加。" },
    ],
  },
  {
    id: 21, group: "lunch", title: "减脂期的炒菜", description: "减脂期，在想午饭怎么吃。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "要求「纯水煮，一滴油不许放」", effect: { bloodSugar: 10, energy: -15, satiety: 10, mood: -20 }, scienceTip: "完全无脂肪的饮食会阻止脂溶性维生素（A、D、E、K）的吸收，缺乏脂肪的饱腹信号，你会在两小时内陷入极度饥饿和暴食冲动。" },
      { label: "用橄榄油猛火炒一盘小白菜，加一份肉", effect: { bloodSugar: 5, energy: 15, satiety: 30, mood: 10 }, scienceTip: "适量优质脂肪不刺激胰岛素，还能显著延缓胃排空时间，让饱腹感延续3-4小时。减脂期的最大敌人是过度限制后的暴食。" },
    ],
  },
  {
    id: 22, group: "lunch", title: "轻食店沙拉", description: "轻食店，选什么好？",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "来一份超大碗的全素田园沙拉", effect: { bloodSugar: 20, energy: -10, satiety: 15, mood: -10 }, scienceTip: "纯素沙拉缺乏蛋白质，消化速度极快，约1.5小时后血糖明显下降，下午的困意和头晕是有据可查的结果。" },
      { label: "沙拉减量，额外加烤鸡胸和溏心蛋", effect: { bloodSugar: 5, energy: 20, satiety: 45, mood: 5 }, scienceTip: "优质动物蛋白提供完整必需氨基酸，加速肌肉修复，同时让饱腹感和血糖稳定持续到下午茶时间。这才是真正的减脂餐。" },
    ],
  },
  {
    id: 23, group: "lunch", title: "纯素网红餐", description: "打卡网红素食，两种选择。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "铺满香蕉和燕麦脆的巴西莓果碗", effect: { bloodSugar: 35, energy: -20, satiety: 20, mood: 35 }, scienceTip: "果昔碗=捣碎的果糖+精制碳水的组合。去除了水果纤维结构后，果糖直接绕过肠道屏障，升糖+升脂效果惊人，是「健康伪装最成功」的食物之一。" },
      { label: "含天贝、毛豆、牛油果的佛陀碗", effect: { bloodSugar: 10, energy: 20, satiety: 40, mood: 0 }, scienceTip: "天贝（发酵大豆）+毛豆提供完整植物蛋白，牛油果提供优质脂肪，三者组合使血糖上升极其平缓，是植物性饮食中的控糖范本。" },
    ],
  },
]

const AFTERNOON_EVENTS: GameEvent[] = [
  {
    id: 24, group: "afternoon", title: "水果选择", description: "下午有点饿，看见水果。",
    image: "/images/s-tea.jpg",
    choices: [
      { label: "空腹直接吃一个大苹果", effect: { bloodSugar: 22, energy: 5, satiety: 15, mood: 15 }, scienceTip: "苹果的果糖和葡萄糖在空腹时吸收较快，约1小时后血糖会明显回落，且单独吃饱腹感维持时间较短。" },
      { label: "苹果配一把巴旦木一起吃", effect: { bloodSugar: 10, energy: 20, satiety: 25, mood: 5 }, scienceTip: "坚果中的脂肪和蛋白质就像「减速带」，将苹果的糖分吸收速度减慢约一半，血糖峰值明显削平，饱腹感延长至2小时以上。" },
    ],
  },
  {
    id: 25, group: "afternoon", title: "脑雾急救", description: "下午头晕眼花，包里只有一根香蕉。",
    image: "/images/s-tea.jpg",
    choices: [
      { label: "立刻咬两小口香蕉垫一垫", effect: { bloodSugar: 10, energy: 20, satiety: 5, mood: 5 }, scienceTip: "精准补糖！两口碳水刚好把血糖拉回安全线，既缓解头晕又避免产生新的波峰，是极佳的急救策略。" },
      { label: "坚决不碰香蕉，为了绝对控糖死扛到底", effect: { bloodSugar: -5, energy: -25, satiety: -10, mood: -15 }, scienceTip: "控糖走火入魔！出现低血糖症状时死扛，身体会分泌大量皮质醇强行升糖，极大透支精力，且晚饭极易失控暴食。" },
    ],
  },
  {
    id: 26, group: "afternoon", title: "奶茶社交", description: "同事说请客喝奶茶。", weekdayOnly: true,
    image: "/images/s-tea.jpg",
    choices: [
      { label: "点一杯常规七分糖珍珠奶茶", effect: { bloodSugar: 35, energy: -20, satiety: 20, mood: 35 }, scienceTip: "一杯700ml七分糖珍珠奶茶含糖量约55-65g，主要来自果葡糖浆。果糖由肝脏独立代谢，长期大量摄入与非酒精性脂肪肝高度相关。" },
      { label: "婉拒，自己泡一杯无糖绿茶", effect: { bloodSugar: 0, energy: 10, satiety: 5, mood: -15 }, scienceTip: "绿茶中的EGCG有助于改善胰岛素敏感性。但在社交场合独自喝绿茶的心情代价是真实且沉重的。" },
    ],
  },
  {
    id: 27, group: "afternoon", title: "办公室零食", description: "同事递过来一包综合果蔬干。",
    image: "/images/s-tea.jpg",
    choices: [
      { label: "吃几片，反正是蔬菜水果做的", effect: { bloodSugar: 28, energy: -10, satiety: 15, mood: 20 }, scienceTip: "大部分市售果蔬干是低温油炸或真空脱水后加糖调味的，水分去除后糖分浓度极高，100g果蔬干的糖分可能等于600g新鲜水果。" },
      { label: "掏出自己带的一小袋毛豆", effect: { bloodSugar: 5, energy: 15, satiety: 20, mood: 0 }, scienceTip: "毛豆（未成熟大豆）富含优质蛋白、膳食纤维和镁，GI值极低，是下午零食中少见的「真正健康」选项。" },
    ],
  },
  {
    id: 28, group: "afternoon", title: "下午犯困", description: "下午三点，困意袭来。", weekdayOnly: true,
    image: "/images/s-tea.jpg",
    choices: [
      { label: "开一罐红牛或喝杯加糖咖啡", effect: { bloodSugar: 32, energy: 20, satiety: 5, mood: 15 }, scienceTip: "糖分让你在15分钟内瞬间精神，但血糖回落后你会比喝之前更困、更烦躁。咖啡因叠加可能扰乱夜间睡眠。" },
      { label: "喝一杯黑咖啡，站起来拉伸5分钟", effect: { bloodSugar: 0, energy: 15, satiety: 5, mood: -5 }, scienceTip: "无糖咖啡因可以提升警觉度约4小时且不影响血糖。短暂的肌肉拉伸能促进血液循环，降低皮质醇，效果比糖更持久。" },
    ],
  },
  {
    id: 29, group: "afternoon", title: "甜品诱惑", description: "朋友生日，蛋糕切好了。",
    image: "/images/s-tea.jpg",
    choices: [
      { label: "现在大家一起吃一块蛋糕", effect: { bloodSugar: 35, energy: -25, satiety: 20, mood: 40 }, scienceTip: "空腹下午吃甜点是血糖最脆弱的时刻：没有任何食物缓冲，蛋糕中的糖直接冲击胰岛。情绪虽然值得，但血糖和能量代价是真实的。" },
      { label: "把蛋糕装盒，留着晚饭后再吃", effect: { bloodSugar: 15, energy: 10, satiety: 15, mood: -10 }, scienceTip: "饭后胃里充满了纤维、蛋白质和脂肪，此时摄入蛋糕，糖分吸收速度比空腹低约40-60%，是吃甜食最「安全」的时机。" },
    ],
  },
  {
    id: 30, group: "afternoon", title: "想喝汽水", description: "想喝点有味道的东西。",
    image: "/images/s-tea.jpg",
    choices: [
      { label: "买一瓶「0卡代糖」气泡水", effect: { bloodSugar: 3, energy: 0, satiety: 5, mood: 15 }, scienceTip: "主流甜味剂（赤藓糖醇、三氯蔗糖）对血糖的直接影响极小，bs仅有轻微波动。但部分研究显示代糖会强化「甜味期待胰岛素分泌」的条件反射，长期影响肠道菌群多样性，机制仍有争议。" },
      { label: "切几片柠檬泡在无味苏打水里", effect: { bloodSugar: 0, energy: 10, satiety: 5, mood: -5 }, scienceTip: "柠檬中的柠檬酸和多酚完全天然，少量果酸实际上有助于降低餐后血糖反应。味道淡了点，但完全零负担。" },
    ],
  },
  {
    id: 31, group: "afternoon", title: "嘴馋", description: "嘴巴很馋，又没到饭点。",
    image: "/images/s-tea.jpg",
    choices: [
      { label: "拆开一包苏打饼干嚼几块", effect: { bloodSugar: 25, energy: -5, satiety: 10, mood: 20 }, scienceTip: "苏打饼干是精制面粉加碳酸氢钠的产物，升糖速度与白面包相当，且干燥质地会让人不知不觉吃掉很多。" },
      { label: "喝一大杯水，等15分钟再决定", effect: { bloodSugar: 0, energy: 5, satiety: 15, mood: -10 }, scienceTip: "大脑的「饿」和「渴」信号共用部分神经通路，约60%的「假饿感」在喝水后15分钟内消退。这是最零成本的控糖技巧。" },
    ],
  },
  {
    id: 32, group: "afternoon", title: "压力爆发", description: "压力太大，情绪快绷不住了。",
    image: "/images/s-tea.jpg",
    choices: [
      { label: "去买个冰淇淋安慰一下自己", effect: { bloodSugar: 32, energy: -15, satiety: 10, mood: 30 }, scienceTip: "糖分确实能在短期内升高血清素水平，产生情绪舒缓效果。但血糖随后的回落会带来更深的空虚感，形成「情绪性进食」依赖。" },
      { label: "闭眼深呼吸3分钟，出门吹吹风", effect: { bloodSugar: 0, energy: 15, satiety: 0, mood: 10 }, scienceTip: "横膈膜呼吸在约3分钟内能激活副交感神经，皮质醇水平开始下降，是最快速的非饮食类情绪调节方法之一。" },
    ],
  },
  {
    id: 33, group: "afternoon", title: "饥饿救急", description: "肚子在抗议，需要点东西救急。",
    image: "/images/s-tea.jpg",
    choices: [
      { label: "啃几根生芹菜和胡萝卜条", effect: { bloodSugar: 5, energy: -5, satiety: 10, mood: 20 }, scienceTip: "蔬菜条热量极低，但咀嚼这个动作本身有真实的解压效果（激活迷走神经）。胡萝卜中的beta-胡萝卜素和膳食纤维是真实营养素。心情获益来自「坚持减脂目标」的自我效能感。" },
      { label: "吃一块原味全脂奶酪或几片牛肉干", effect: { bloodSugar: 0, energy: 15, satiety: 25, mood: -5 }, scienceTip: "动物蛋白和乳脂完全不刺激胰岛素，饱腹感可持续90分钟以上。代价是热量不低，某种程度上偏离了减脂目标，会有轻微的心理负担。" },
    ],
  },
]

const DINNER_EVENTS: GameEvent[] = [
  {
    id: 34, group: "dinner", title: "晚餐主食", description: "晚餐想选个主食。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "选口感黏糯的糯玉米", effect: { bloodSugar: 35, energy: -15, satiety: 35, mood: 15 }, scienceTip: "糯玉米富含支链淀粉（占90%以上），比直链淀粉更容易被淀粉酶快速分解，升糖速度明显高于普通甜玉米，晚上吃尤其不利于血糖稳定。" },
      { label: "选水分较多的甜玉米", effect: { bloodSugar: 15, energy: 10, satiety: 25, mood: 0 }, scienceTip: "甜玉米直链淀粉比例更高，纤维含量较多，升糖速度显著低于糯玉米。晚饭控制血糖峰值，对次日晨起状态有积极影响。" },
    ],
  },
  {
    id: 35, group: "dinner", title: "周末大餐", description: "周末大餐，朋友点了芝士烤饼。", weekendOnly: true,
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "吃几块拉丝芝士烤饼", effect: { bloodSugar: 28, energy: -25, satiety: 50, mood: 35 }, scienceTip: "「脂蛋延迟」效应：高脂肪+碳水的组合会将血糖峰值延迟到2-4小时后出现，且高位持续时间长。睡前吃这个，你的血糖在你睡着后仍然居高不下。" },
      { label: "只吃里面的肉馅，把烤饼留给别人", effect: { bloodSugar: 10, energy: 5, satiety: 20, mood: -15 }, scienceTip: "纯蛋白质和动物脂肪的组合对血糖几乎没有冲击，避免了夜间持续高血糖对睡眠质量的破坏。虽然有点扫兴，但明天的精神状态会感谢你。" },
    ],
  },
  {
    id: 36, group: "dinner", title: "饭后习惯", description: "累了一天，吃完饭。",
    image: "/images/s-exercise.jpg",
    choices: [
      { label: "立刻躺在沙发上刷手机放松", effect: { bloodSugar: 25, energy: 0, satiety: 0, mood: 20 }, scienceTip: "饭后立刻静止会让血液中的葡萄糖无处消耗，肌肉不参与摄取的情况下，更多糖分会被转化为甘油三酯。长期如此是内脏脂肪累积的主要原因之一。" },
      { label: "站起来把家里的地拖一遍", effect: { bloodSugar: -18, energy: -10, satiety: 0, mood: -10 }, scienceTip: "饭后15-30分钟内的低强度活动是降低餐后血糖峰值最有效的行为干预之一。肌肉收缩能独立于胰岛素直接消耗血糖，效果立竿见影。" },
    ],
  },
  {
    id: 37, group: "dinner", title: "减肥晚餐", description: "想「少吃点」来减肥。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "晚饭不吃主食，改吃半个大西瓜", effect: { bloodSugar: 32, energy: -15, satiety: 20, mood: 25 }, scienceTip: "西瓜的升糖指数高达72，果糖含量高，且缺乏任何蛋白质。用「水果代餐」减肥不仅不会瘦，还会让你在凌晨两点饿醒，引发深夜暴食。" },
      { label: "正常吃一小碗杂粮饭和一盘炒菜", effect: { bloodSugar: 15, energy: 15, satiety: 35, mood: -5 }, scienceTip: "杂粮饭的复合碳水+蔬菜的膳食纤维，能在夜间提供平稳持续的血糖支撑，保证生长激素的正常分泌。" },
    ],
  },
  {
    id: 38, group: "dinner", title: "长辈的爱", description: "长辈坚持要你把一大碗白米饭吃完。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "硬着头皮把一大碗白米饭吃完", effect: { bloodSugar: 35, energy: -20, satiety: 55, mood: 10 }, scienceTip: "孝心让胰岛代为承担了压力。一大碗白米饭约含60-80g精制碳水，晚间胰岛素敏感性下降，血糖峰值和持续时间均超过白天同等摄入量。" },
      { label: "撒娇说多夹菜少吃饭，把一半米饭拨出去", effect: { bloodSugar: 15, energy: 10, satiety: 40, mood: -5 }, scienceTip: "机智的社交碳水转移策略。减半米饭摄入的同时，增加蔬菜和蛋白质比例，是有效且不伤感情的控糖方案。" },
    ],
  },
  {
    id: 39, group: "dinner", title: "饭局饮酒", description: "饭局上，大家在举杯。", weekendOnly: true,
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "跟大家一起干了两大杯冰啤酒", effect: { bloodSugar: 28, energy: -15, satiety: 20, mood: 25 }, scienceTip: "啤酒含有麦芽糖和多余碳水，且酒精会阻断肝脏的糖原分解，扰乱血糖调节。夜间饮酒还可能导致睡眠期间出现低血糖或高血糖交替的情况。" },
      { label: "倒一杯苏打水假装是酒跟大家碰杯", effect: { bloodSugar: 0, energy: 5, satiety: 5, mood: -10 }, scienceTip: "完全规避了酒精和液体碳水，社交目的基本达成，代价是显得有点不合群。" },
    ],
  },
  {
    id: 40, group: "dinner", title: "厨房炒菜", description: "自己下厨炒菜。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "炒肉时放点水淀粉勾芡，颜值更好", effect: { bloodSugar: 25, energy: -5, satiety: 25, mood: 20 }, scienceTip: "芡汁是附着在每口菜上的纯碳水，每一勺勾芡大约额外增加5-10g精制淀粉摄入，且与食物充分混合后很难「吃掉它」。" },
      { label: "清炒，不放糖不勾芡", effect: { bloodSugar: 8, energy: 10, satiety: 25, mood: -10 }, scienceTip: "剔除了所有隐性碳水添加，保留了食材本身的营养价值。口感稍逊，但这顿饭的血糖负担大幅降低。" },
    ],
  },
  {
    id: 41, group: "dinner", title: "煲汤盲区", description: "一锅煲汤，配菜要怎么选？",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "大口吃汤里炖软的山药、莲藕和芋头", effect: { bloodSugar: 30, energy: -10, satiety: 35, mood: 15 }, scienceTip: "炖软的山药、莲藕、芋头均为高淀粉根茎类（淀粉含量15-25%），糊化后升糖速度比生吃快得多，再加上吸附了大量汤汁中的脂肪，是晚餐控糖的常见陷阱。" },
      { label: "只吃排骨肉和单独炒的绿叶菜", effect: { bloodSugar: 8, energy: 15, satiety: 35, mood: -5 }, scienceTip: "动物蛋白提供夜间修复原料，绿叶菜提供镁和B族维生素，两者配合是晚餐的理想组合，不会给夜间胰岛素系统增加额外负担。" },
    ],
  },
  {
    id: 42, group: "dinner", title: "枯燥的减脂餐", description: "减脂期的晚饭，严格还是放一点松？",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "水煮鸡胸肉加水煮西兰花，一滴油不放", effect: { bloodSugar: 5, energy: -15, satiety: 20, mood: -30 }, scienceTip: "「极端减脂餐」短期有效，但无脂肪的极度枯燥饮食会让深夜出现强烈的暴食冲动。研究显示高度限制性饮食者的暴食风险远高于适度控制者。" },
      { label: "在鸡胸肉和西兰花上淋一圈橄榄油", effect: { bloodSugar: 0, energy: 15, satiety: 35, mood: 10 }, scienceTip: "橄榄油中的油酸和多酚不刺激胰岛素，还能激活大脑的满足信号，让这顿饭在感官和代谢上都是赢家。减脂不需要痛苦到想放弃。" },
    ],
  },
  {
    id: 43, group: "dinner", title: "火锅局", description: "吃火锅，锅里沸腾着。",
    image: "/images/s-lunch.jpg",
    choices: [
      { label: "煮一大堆菠菜、生菜和炸腐竹", effect: { bloodSugar: 25, energy: -5, satiety: 25, mood: 15 }, scienceTip: "绿叶菜在火锅里会吸附大量劣质锅底油脂，炸腐竹是高温油炸豆皮（碳水+劣质脂肪），看似素净，实则代谢负担不低。" },
      { label: "主攻新鲜肥牛、毛肚和鹌鹑蛋", effect: { bloodSugar: 5, energy: 20, satiety: 45, mood: 5 }, scienceTip: "新鲜肉类和蛋类在涮煮时不会额外吸附汤汁中的糖脂，纯蛋白质和动物脂肪让血糖几乎保持水平。火锅控糖的秘诀在于「以肉代淀粉」。" },
    ],
  },
]

const EVENING_EVENTS: GameEvent[] = [
  {
    id: 44, group: "evening", title: "夜间运动", description: "晚上想打羽毛球锻炼。",
    image: "/images/s-exercise.jpg",
    choices: [
      { label: "空腹直接去，燃脂效果更好", effect: { bloodSugar: 25, energy: -28, satiety: -10, mood: 10 }, scienceTip: "空腹高强度运动会强迫肝脏大量释放糖原，同时触发皮质醇和肾上腺素激增，两者共同导致血糖升高而非降低。竞技运动前空腹是错误策略。" },
      { label: "上场前15分钟吃几颗软糖垫一下", effect: { bloodSugar: 10, energy: 30, satiety: 5, mood: 15 }, scienceTip: "运动前的快糖补充是「精准用糖」的经典案例。葡萄糖直接进入肌糖原，在运动中被消耗殆尽，不会导致脂肪储存，还能有效抑制皮质醇分泌。" },
    ],
  },
  {
    id: 45, group: "evening", title: "午夜狂饿", description: "午夜，真的饿得睡不着。",
    image: "/images/s-morning.jpg",
    choices: [
      { label: "煮一碗清淡的阳春面", effect: { bloodSugar: 28, energy: -8, satiety: 38, mood: 28 }, scienceTip: "深夜高碳水摄入会使胰岛素在夜间大量分泌，抑制生长激素释放。消化本身也会轻微消耗能量，且明天醒来会有明显的「碳水宿醉」脑雾感。" },
      { label: "吃一个水煮蛋，服用一片镁补剂", effect: { bloodSugar: 0, energy: 22, satiety: 18, mood: -5 }, scienceTip: "鸡蛋中的蛋白质安抚胃部饥饿感且不刺激胰岛素。镁（甘氨酸镁最佳）是GABA受体的辅助因子，能促进深度放松和睡眠启动，是夜间代谢救星。" },
    ],
  },
  {
    id: 46, group: "evening", title: "打球后", description: "打完球，满身大汗。",
    image: "/images/s-exercise.jpg",
    choices: [
      { label: "收拾东西直接回家躺着", effect: { bloodSugar: 12, energy: -15, satiety: -10, mood: 10 }, scienceTip: "高强度运动后交感神经仍在持续激活，皮质醇处于高位，回家后你会感到极度亢奋且暴饿。直接躺下往往换来长达数小时的失眠。" },
      { label: "留在球馆做10分钟拉伸和深呼吸", effect: { bloodSugar: -8, energy: 15, satiety: -5, mood: -5 }, scienceTip: "运动后拉伸能触发副交感神经「恢复模式」，皮质醇在10-15分钟内开始下降，同时帮助乳酸代谢。回家后你是「困」而不是「饿」，是天壤之别。" },
    ],
  },
  {
    id: 47, group: "evening", title: "睡前放松", description: "准备上床，睡前时光。",
    image: "/images/s-morning.jpg",
    choices: [
      { label: "躺着刷一把手游或看短视频放松", effect: { bloodSugar: 8, energy: -18, satiety: -5, mood: 20 }, scienceTip: "蓝光会抑制褪黑素分泌，让大脑误判为白昼，延迟睡眠启动约1-2小时。游戏/短视频激活的多巴胺回路还会让皮质醇维持在高位，直接拉高夜间血糖基线。" },
      { label: "放下手机，听10分钟白噪音或冥想引导", effect: { bloodSugar: 0, energy: 20, satiety: 0, mood: -8 }, scienceTip: "无蓝光的睡前过渡期能让褪黑素提前30-60分钟开始分泌，深度睡眠时间增加，夜间生长激素分泌量提升。第二天的精力状态会有质的不同。" },
    ],
  },
  {
    id: 48, group: "evening", title: "练后加餐", description: "刚举完铁，想补充营养。",
    image: "/images/s-exercise.jpg",
    choices: [
      { label: "喝一杯加了麦芽糊精的香草增肌粉", effect: { bloodSugar: 30, energy: -8, satiety: 20, mood: 15 }, scienceTip: "麦芽糊精的升糖指数高达105-136（超过葡萄糖）。训练后摄入快糖有其窗口期，但睡前摄入大量快碳的代谢代价是多余热量被优先储存为脂肪。" },
      { label: "喝一勺纯酪蛋白粉，加一点坚果", effect: { bloodSugar: 5, energy: 20, satiety: 25, mood: -8 }, scienceTip: "酪蛋白是「慢蛋白」，在肠道中缓慢凝固，持续释放氨基酸长达7小时，恰好覆盖整个睡眠修复窗口，而不会刺激夜间胰岛素分泌。" },
    ],
  },
  {
    id: 49, group: "evening", title: "补剂选择", description: "睡前要不要补点什么？",
    image: "/images/s-morning.jpg",
    choices: [
      { label: "吞几片复合维生素加钙片，求个心安", effect: { bloodSugar: 0, energy: 5, satiety: 0, mood: 15 }, scienceTip: "安慰剂效应是真实且有生理基础的。相信「已经补充了营养」这件事本身能降低皮质醇，让入睡更快。代价是实际吸收率偏低，且碳酸钙睡前服用会轻微干扰镁的吸收。" },
      { label: "按剂量严格服用甘氨酸镁，专注睡眠优化", effect: { bloodSugar: 0, energy: 20, satiety: 0, mood: -5 }, scienceTip: "甘氨酸镁的生物利用度远高于碳酸钙，镁参与超过300种酶促反应，是肌肉放松和血糖调节的关键矿物质。但需要专门购买且价格偏高，想到这里有点心烦。" },
    ],
  },
  {
    id: 50, group: "evening", title: "睡前热饮", description: "睡前想来点温热的饮品。",
    image: "/images/s-morning.jpg",
    choices: [
      { label: "喝一杯温热的脱脂牛奶", effect: { bloodSugar: 20, energy: -12, satiety: 15, mood: 10 }, scienceTip: "脱脂牛奶去除了脂肪，失去了减缓乳糖吸收的缓冲层。乳糖（双糖）在无脂肪陪伴下吸收速度大幅加快，睡前升糖效应明显高于全脂。" },
      { label: "吃一小杯配料只有「生牛乳」的全脂无糖酸奶", effect: { bloodSugar: 5, energy: 15, satiety: 25, mood: -5 }, scienceTip: "发酵过程消耗了大部分乳糖，保留的乳脂提供缓慢释放的能量，益生菌还能改善肠道菌群构成。夜间摄入全脂发酵乳制品是目前研究支持度较高的睡前食物之一。" },
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

const GROUP_ORDER: EventGroup[] = ["breakfast", "lunch", "afternoon", "dinner", "evening"]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Draw one from pool without replacement; reshuffle pool when exhausted. Respects weekday/weekend flags. */
function pickOne(pool: GameEvent[], usedIds: Set<number>, isWeekend: boolean): GameEvent {
  const filterByDay = (events: GameEvent[]): GameEvent[] =>
    events.filter((e) => {
      if (usedIds.has(e.id)) return false
      if (isWeekend && e.weekdayOnly) return false
      if (!isWeekend && e.weekendOnly) return false
      return true
    })

  let available = filterByDay(pool)
  if (available.length === 0) {
    pool.forEach((e) => usedIds.delete(e.id))
    available = filterByDay(pool)
    if (available.length === 0) {
      // Fallback: ignore usedIds/day flags to avoid hard crash, though in设计上不会走到这里
      available = [...pool]
    }
  }
  const event = shuffle(available)[0]
  usedIds.add(event.id)
  return event
}

/** Day queue: 5 slots [breakfast, lunch, afternoon?, dinner, evening?]. Afternoon/evening 50% null. */
export function generateDayQueue(usedIds: Set<number>, dayNumber: number): {
  queue: (GameEvent | null)[]
  eveningSkipped: boolean
} {
  const isWeekend = dayNumber >= 6
  const queue: (GameEvent | null)[] = []
  // Monday breakfast fixed to event 1 for narrative consistency
  if (dayNumber === 1) {
    const fixed = BREAKFAST_EVENTS.find((e) => e.id === 1)
    if (!fixed) {
      queue[0] = pickOne(BREAKFAST_EVENTS, usedIds, isWeekend)
    } else {
      queue[0] = fixed
      usedIds.add(fixed.id)
    }
  } else {
    queue[0] = pickOne(BREAKFAST_EVENTS, usedIds, isWeekend)
  }

  queue[1] = pickOne(LUNCH_EVENTS, usedIds, isWeekend)
  queue[2] = Math.random() < 0.5 ? pickOne(AFTERNOON_EVENTS, usedIds, isWeekend) : null
  queue[3] = pickOne(DINNER_EVENTS, usedIds, isWeekend)
  queue[4] = Math.random() < 0.5 ? pickOne(EVENING_EVENTS, usedIds, isWeekend) : null
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
    notes.push("糖宿醉! 睡前血糖过高，夜间频繁觉醒")
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
  bloodSugarHigh: { title: "高渗昏迷", subtitle: "血糖持续爆表，你的肾脏和神经系统已无力回天" },
  bloodSugarLow:  { title: "低血糖休克", subtitle: "大脑燃料耗尽，意识在某个普通的下午消失了" },
  moodZero:       { title: "精神崩溃", subtitle: "极度压抑后的报复性暴食，身体和心灵同时举白旗" },
  energyZero:     { title: "过劳晕倒", subtitle: "身体发出了最后的警报，你倒在了去便利店的路上" },
}

// v2.3 Death: blood sugar > 100 (NOT >=100), blood sugar <= 10, energy <= 0, mood <= 0
export function checkGameOver(stats: GameStats): { isOver: boolean; reason: string } | null {
  if (stats.bloodSugar > 100) return { isOver: true, reason: "bloodSugarHigh" }
  if (stats.bloodSugar <= 10) return { isOver: true, reason: "bloodSugarLow" }
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
  choice: { label: string; effect: Effect; scienceTip: string },
  preEffect?: Effect
): ChoiceResultSuccess | ChoiceResultDeath {
  let raw = applyEffectRaw(prevStats, preEffect ?? {})
  raw = applyEffectRaw(raw, choice.effect)

  if (raw.bloodSugar > 100) return { deathReason: "bloodSugarHigh" }
  if (raw.bloodSugar <= 10) return { deathReason: "bloodSugarLow" }
  if (raw.energy <= 0) return { deathReason: "energyZero" }
  if (raw.mood <= 0) return { deathReason: "moodZero" }

  let s = { ...raw }
  const penalty: PostChoicePenalty = { foodComa: false, starvation: false }
  let penaltyFloaty: string | undefined

  if (s.satiety >= 100) {
    penalty.foodComa = true
    penalty.penaltyFloaty = "🤢 撑得大脑缺氧！"
    penaltyFloaty = penalty.penaltyFloaty
    s.satiety = 90
    s.energy -= 15
    s.mood -= 10
  }
  if (s.satiety <= 0) {
    penalty.starvation = true
    penalty.penaltyFloaty = "😵 饿得眼冒金星！"
    penaltyFloaty = penalty.penaltyFloaty
    s.satiety = 10
    s.bloodSugar -= 10
    s.mood -= 10
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

// v2.3 Food Coma / Starvation penalties (satiety 100→90, 0→10; floaty text)
export interface PostChoicePenalty {
  foodComa: boolean
  starvation: boolean
  penaltyFloaty?: string
}

export function applyPostChoicePenalties(stats: GameStats): { stats: GameStats; penalty: PostChoicePenalty } {
  let s = { ...stats }
  const penalty: PostChoicePenalty = { foodComa: false, starvation: false }

  if (s.satiety >= 100) {
    penalty.foodComa = true
    penalty.penaltyFloaty = "🤢 撑得大脑缺氧！"
    s.satiety = 90
    s.energy = s.energy - 15
    s.mood = s.mood - 10
  }

  if (s.satiety <= 0) {
    penalty.starvation = true
    penalty.penaltyFloaty = "😵 饿得眼冒金星！"
    s.satiety = 10
    s.bloodSugar = s.bloodSugar - 10
    s.mood = s.mood - 10
  }

  s.bloodSugar = clamp(s.bloodSugar)
  s.energy = clamp(s.energy)
  s.mood = clamp(s.mood)
  s.satiety = clamp(s.satiety)
  return { stats: s, penalty }
}

// Inter-meal metabolism: blood sugar toward 45 (40% of gap, max 12), satiety -12, energy -4
export function applyInterMealMetabolism(stats: GameStats): GameStats {
  const CENTER = 45
  let bsDelta: number
  if (stats.bloodSugar > CENTER) {
    bsDelta = -Math.min(12, Math.floor((stats.bloodSugar - CENTER) * 0.4))
  } else {
    bsDelta = Math.min(12, Math.floor((CENTER - stats.bloodSugar) * 0.4))
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
