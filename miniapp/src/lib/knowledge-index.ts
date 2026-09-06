export interface KnowledgeIndexItem {
  title: string
  takeaway: string
}

/**
 * 选择结果页只引用这份轻量索引；完整文章放在知识分包中，避免把主包再次撑大。
 */
export const KNOWLEDGE_INDEX: Record<string, KnowledgeIndexItem> = {
  '乳制品': { title: '乳制品', takeaway: '选奶制品时，先看添加糖、总碳水和实际份量。' },
  '低血糖识别与处理': { title: '低血糖识别与处理', takeaway: '症状不能代替测量；确认低血糖后要先用快速碳水处理。' },
  '压力进食': { title: '压力进食', takeaway: '先给压力找出口，再选一顿能吃饱、碳水不叠加的饭。' },
  '可持续饮食': { title: '可持续饮食', takeaway: '控糖不是删掉主食和脂肪，而是找到可以长期维持的比例。' },
  '含糖食物': { title: '含糖食物', takeaway: '“天然”和“有营养”不等于无糖，重点仍是种类与份量。' },
  '含糖饮料': { title: '含糖饮料', takeaway: '液体糖吸收快、饱腹弱，无糖饮品或水更适合日常解渴。' },
  '咖啡因': { title: '咖啡因', takeaway: '咖啡能提神，却不能代替睡眠；还要留意饮品里的糖和奶。' },
  '夜间加餐': { title: '夜间加餐', takeaway: '真饿时选小份碳水配蛋白质，别在睡前叠加两路快速碳水。' },
  '寒冷与补能': { title: '寒冷与补能', takeaway: '冷到发抖时先避风取暖，再根据状态补充能量，不要只靠温水硬等。' },
  '快速碳水': { title: '快速碳水', takeaway: '快速碳水适合特定补糖场景，不是每次疲劳或运动后的标配。' },
  '水果代餐误区': { title: '水果代餐误区', takeaway: '水果也含碳水；大盘水果缺少正餐的蛋白质与结构。' },
  '水果形态': { title: '水果形态', takeaway: '同样是水果，整颗吃通常比榨汁更慢，也更容易看清份量。' },
  '淀粉类型': { title: '淀粉类型', takeaway: '同类主食中，口感越黏越糯，一般 GI 越高、升糖越快。' },
  '混合餐搭配': { title: '混合餐搭配', takeaway: '先认出主要碳水，再配蛋白质和非淀粉蔬菜；搭配不能抵消过大份量。' },
  '火锅搭配': { title: '火锅搭配', takeaway: '火锅要把碳水摆到明面上，留一份主食，少叠加丸子、粉条和甜酱。' },
  '甜品份量': { title: '甜品份量', takeaway: '想吃甜品时先缩小份量，慢慢吃，别再同时配甜饮。' },
  '睡眠与血糖': { title: '睡眠与血糖', takeaway: '睡眠会影响第二天的胰岛素敏感性、食欲和食物选择。' },
  '碳水份量': { title: '碳水份量', takeaway: '食物升糖不只看名字，同样要看这一次实际吃了多少。' },
  '碳水作用': { title: '碳水作用', takeaway: '碳水是重要能量来源，控糖的重点是选择、份量和时机。' },
  '碳水识别': { title: '碳水识别', takeaway: '米面之外，土豆、藕、山药、芋头和粉条也要算进主食。' },
  '碳水阻断误区': { title: '碳水阻断误区', takeaway: '所谓“阻断”不能抹掉一顿饭，也不应代替正常的份量管理。' },
  '社交选择': { title: '社交选择', takeaway: '社交餐不必全拒绝，先正常吃饭，再给酒、甜饮和主食设边界。' },
  '精制淀粉': { title: '精制淀粉', takeaway: '精制淀粉纤维少、消化快，份量集中时血糖更容易快速上升。' },
  '糖脂组合': { title: '糖脂组合', takeaway: '高碳水加高脂肪可能让血糖峰值来得更晚、持续更久。' },
  '补剂误区': { title: '补剂误区', takeaway: '补剂只能处理特定需求，不能替代睡眠、正常饮食和运动。' },
  '规律进餐': { title: '规律进餐', takeaway: '别把自己拖到饿急了再决定吃什么，节奏稳定更容易管理份量。' },
  '运动与补能': { title: '运动与补能', takeaway: '运动前是否补能要看距离上一餐的时间、强度和当下状态。' },
  '运动强度': { title: '运动强度', takeaway: '餐后轻活动与高强度运动不是一回事，强度和时机都很重要。' },
  '运动恢复': { title: '运动恢复', takeaway: '运动后先降低强度、补水并观察状态，再离开或补充食物。' },
  '运动营养': { title: '运动营养', takeaway: '训练后是否需要额外补充，先看训练量、全天饮食和配料表。' },
  '进食速度': { title: '进食速度', takeaway: '吃得太快容易让碳水集中下肚，也容易错过饱腹信号。' },
  '进食顺序': { title: '进食顺序', takeaway: '先吃蔬菜和蛋白质、后吃主食，可帮助放慢餐后血糖上升。' },
  '酒精与血糖': { title: '酒精与血糖', takeaway: '酒精可影响肝脏释放葡萄糖，空腹饮酒尤其需要警惕延迟性低血糖。' },
  '醋与餐后血糖': { title: '醋与餐后血糖', takeaway: '少量醋的作用有限，不能抵消一顿饭的碳水，更不能代替正餐搭配。' },
  '隐藏淀粉': { title: '隐藏淀粉', takeaway: '勾芡、丸子、粉条和加工酱汁里的淀粉，也会计入这顿碳水。' },
  '隐藏糖与油脂': { title: '隐藏糖与油脂', takeaway: '“没吃主食”不等于低负担，加工食品、甜酱和油炸配料也要算。' },
  '隐藏糖与酱料': { title: '隐藏糖与酱料', takeaway: '酱料也有份量，选一种、蘸着吃，比多种混合全拌更容易控制。' },
  '食品加工': { title: '食品加工', takeaway: '打粉、榨汁、熟烂和膨化会改变食物结构，往往让消化更快。' },
  '食品标签': { title: '食品标签', takeaway: '别只看“无糖”“全麦”“低脂”，还要看配料顺序、碳水和每份大小。' },
  '食物结构与糊化': { title: '食物结构与糊化', takeaway: '颗粒越细、煮得越软烂，淀粉通常越容易被消化，升糖也更快。' },
  '餐后反应': { title: '餐后反应', takeaway: '困、心慌和饿不是低血糖专属信号，需要结合时间、食物和测量判断。' },
  '餐后活动': { title: '餐后活动', takeaway: '餐后轻活动可以帮助肌肉利用葡萄糖，不需要立刻做高强度运动。' },
  '饥饿觉察': { title: '饥饿觉察', takeaway: '先分辨是真饿、口渴、压力还是习惯，再决定是否加餐。' },
  '饱腹觉察': { title: '饱腹觉察', takeaway: '饱腹的目标是舒服，不是把盘子吃空；到位后停下也是管理份量。' },
}

export function getKnowledgeTakeaway(tag?: string): string {
  return tag ? KNOWLEDGE_INDEX[tag]?.takeaway || '' : ''
}

function phraseOverlap(a: string, b: string): number {
  const normalize = (value: string) => value.replace(/[，。；、！？“”\s]/g, '')
  const grams = (value: string) => {
    const chars = [...normalize(value)]
    return new Set(chars.slice(0, -1).map((char, index) => `${char}${chars[index + 1]}`))
  }
  const left = grams(a)
  const right = grams(b)
  if (!left.size || !right.size) return 0
  const shared = [...left].filter((item) => right.has(item)).length
  return shared / Math.min(left.size, right.size)
}

/** 在同一道题的知识标签里，优先补充没有被即时文案重复讲过的那一层。 */
export function getComplementaryKnowledge(tags: string[], scienceTip: string) {
  return tags
    .map((tag) => ({ tag, ...KNOWLEDGE_INDEX[tag] }))
    .filter((item) => item.title && item.takeaway)
    .sort((a, b) => phraseOverlap(scienceTip, a.takeaway) - phraseOverlap(scienceTip, b.takeaway))[0]
}
