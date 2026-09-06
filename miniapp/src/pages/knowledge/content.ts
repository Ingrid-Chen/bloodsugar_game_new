import { KNOWLEDGE_INDEX } from '../../lib/knowledge-index'

export interface KnowledgeSource {
  title: string
  url: string
}

export interface KnowledgeArticle {
  title: string
  summary: string
  mechanism: string[]
  actions: string[]
  example: string
  reminder?: string
  sources: KnowledgeSource[]
}

const SOURCES = {
  china2024: {
    title: '《中国糖尿病防治指南（2024版）》',
    url: 'https://files.sciconf.cn/master/50/33230/202501/20250120111901_47273.pdf',
  },
  dietaryGuide: {
    title: '《中国居民膳食指南（2022）》',
    url: 'https://www.cnsoc.org/bookpublica/0522202019.html',
  },
  adaPlate: {
    title: 'American Diabetes Association: Diabetes Plate',
    url: 'https://diabetes.org/food-nutrition/eating-healthy',
  },
  cdcMeal: {
    title: 'CDC: Diabetes Meal Planning',
    url: 'https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html',
  },
  adaLow: {
    title: 'American Diabetes Association: Low Blood Sugar',
    url: 'https://diabetes.org/living-with-diabetes/treatment-care/hypoglycemia',
  },
  whoSugar: {
    title: 'WHO: Guideline on sugars intake for adults and children',
    url: 'https://www.who.int/publications/i/item/9789241549028',
  },
  nutritionCare: {
    title: "Krause and Mahan's Food and the Nutrition Care Process",
    url: 'https://www.us.elsevierhealth.com/krause-and-mahans-food-and-the-nutrition-care-process-9780323810258.html',
  },
}

const mealSources = [SOURCES.dietaryGuide, SOURCES.adaPlate, SOURCES.cdcMeal]
const guidelineSources = [SOURCES.china2024, SOURCES.dietaryGuide]

export const KNOWLEDGE_ARTICLES: Record<string, KnowledgeArticle> = {
  '混合餐搭配': {
    title: '混合餐怎么搭配',
    summary: '别只盯着某一种“好食物”，先认出主要碳水，再把蛋白质和非淀粉蔬菜补齐。',
    mechanism: [
      '碳水化合物是餐后血糖上升的主要来源。蛋白质、脂肪和纤维与碳水一起吃，通常会让消化吸收慢一些，也更耐饿。',
      '但“有菜有肉”不能抵消过大的主食份量。一顿里同时叠加米饭、土豆、粉条和甜饮，碳水依然会集中。',
    ],
    actions: [
      '用餐盘做快速参考：约一半非淀粉蔬菜、四分之一蛋白质、四分之一主食。',
      '一顿先选一个明确的主食来源，土豆、藕、山药和芋头也要算进去。',
      '优先喝水或无糖饮料，不要让甜饮成为第二份主食。',
    ],
    example: '吃火锅时，可以选蔬菜菌菇、瘦肉豆腐，再留半份米饭或面；少把粉条、土豆、丸子和甜酱全部叠在同一顿。',
    sources: mealSources,
  },
  '碳水份量': {
    title: '碳水份量',
    summary: '同一种食物，吃多少与它“升糖快不快”同样重要。',
    mechanism: ['GI 描述同等碳水下的升糖速度，GL 还会把这一份实际含有的碳水量算进去。所以低 GI 食物吃得很多，负荷仍可能不低。'],
    actions: ['先减小盛放容器，让主食份量可见。', '外食时先留下一部分，吃到舒服再决定是否添加。', '不用因为某种食物健康就忽略份量。'],
    example: '西瓜不需要完全戒掉，但“餐后小份”和“一大盘当晚餐”对这顿的碳水负荷并不一样。',
    sources: guidelineSources,
  },
  '碳水作用': {
    title: '碳水不是敌人',
    summary: '碳水是身体的重要能量来源，控糖不等于完全不吃主食。',
    mechanism: ['主食、水果和奶类中的碳水经消化后可提供葡萄糖。长时间不吃、空腹饮酒或叠加高强度运动，可能让精力和血糖状态变得更难管理。'],
    actions: ['保留适量主食，优先选择粗细搭配、结构更完整的来源。', '根据运动强度、距离上一餐的时间和当下状态安排。'],
    example: '一顿正常晚餐可以是蔬菜、瘦肉或豆腐，再配一小份杂粮饭，而不是只剩水煮菜。',
    sources: guidelineSources,
  },
  '碳水识别': {
    title: '藏在“菜”里的碳水',
    summary: '不只米饭、面条和面包是碳水，一些根茎和加工配料也要算。',
    mechanism: ['土豆、藕、山药、芋头、南瓜和粉条都可以提供明显的淀粉或碳水。它们是天然食物，但不能无限叠加当普通绿叶菜。'],
    actions: ['同一顿中，根茎类和米饭、面条之间做替换，而不是全部加上。', '看到浓芡、丸子、芋圆和甜酱时，也问一句“这里有没有淀粉或糖”。'],
    example: '食堂选了土豆丝和藕片时，米饭就可以相应少一些，再补一份绿叶菜和蛋白质。',
    sources: mealSources,
  },
  '淀粉类型': {
    title: '甜玉米还是糯玉米',
    summary: '同类主食的淀粉结构不同，升糖速度也可能不同。',
    mechanism: ['糯玉米支链淀粉比例通常更高，更容易被消化。同类主食中，口感越黏越糯，一般而言 GI 越高、升糖越快。'],
    actions: ['在甜玉米和糯玉米之间，想让升糖慢一些可优先甜玉米。', '玉米仍然是主食，需要留意根数、大小和这顿其他碳水。'],
    example: '晚餐吃了一根甜玉米，就不需要再配一大碗米饭；可加蔬菜和蛋白质把这顿补完整。',
    sources: guidelineSources,
  },
  '食物结构与糊化': {
    title: '颗粒、软烂与糊化',
    summary: '粒度、烹调时间和含水量会改变淀粉的消化速度。',
    mechanism: ['淀粉在加水加热后会糊化，颗粒越细、煮得越软烂，消化酶通常越容易接触淀粉，因而消化和升糖可能更快。'],
    actions: ['在肠胃能接受的前提下，优先保留一些颗粒和咀嚼感。', '喝粉糊、吃软烂粥时缩小碗，再配蛋、豆制品或蔬菜。', '不把“好消化”自动等同于“对血糖更好”。'],
    example: '白粥可以喝，但改成小碗，配蒸蛋和青菜，会比一大碗软烂白粥配咸菜更完整。',
    sources: [SOURCES.dietaryGuide, SOURCES.nutritionCare],
  },
  '食品加工': {
    title: '加工会改变消化速度',
    summary: '食材一样，但打粉、榨汁、熟烂和膨化后，身体处理它的速度可能已经变了。',
    mechanism: ['粉碎和榨汁会破坏原有的食物结构，熟烂和膨化也会让淀粉更容易被消化。吃得或喝得更快，还容易在短时间内摄入更大份量。'],
    actions: ['整颗水果优先于果汁，完整谷物优先于粉糊和膨化片。', '必须选软烂食物时，同时管理份量并搭配蛋白质。'],
    example: '两个橙子榨成一杯汁后更容易快速喝完；直接吃橙子则保留了咀嚼和原有结构。',
    sources: [SOURCES.dietaryGuide, SOURCES.cdcMeal],
  },
  '精制淀粉': {
    title: '精制淀粉',
    summary: '纤维少、结构细的淀粉食物，通常消化更快，也更需要留意份量。',
    mechanism: ['白面包、白米粥、精制面条等食物中的淀粉会被分解成葡萄糖。份量大、吃得快或单独吃时，餐后血糖更容易快速上升。'],
    actions: ['优先把主食份量变得清楚，再考虑粗粮替换。', '配非淀粉蔬菜和蛋白质，慢一些吃。'],
    example: '牛肉面不用戒，可先吃青菜、蛋和牛肉，面慢慢吃，不必把整碗扫光。',
    sources: mealSources,
  },
  '进食顺序': {
    title: '把碳水稍微往后放',
    summary: '同样一顿饭，先吃蔬菜和蛋白质，再吃主食，餐后反应可能更平缓。',
    mechanism: ['蔬菜的纤维和蛋白质、脂肪会影响胃排空和后续碳水的消化吸收。这是调整顺序，不是让主食“失效”。'],
    actions: ['先吃几口蔬菜和蛋白质，然后再吃米饭、面或水果。', '如果是盖饭，可先把配菜和肉分开吃，不必全部拌匀。'],
    example: '酒店自助时，先取蔬菜、蛋和肉，再留一小份水果，比空腹先吃一大盘水果更稳。',
    sources: [SOURCES.china2024, SOURCES.cdcMeal],
  },
  '进食速度': {
    title: '吃得快，不只是胃的问题',
    summary: '吃得太快，更容易在饱腹感赶上来之前就吃过量。',
    mechanism: ['当大量碳水在短时间内进入消化道，餐后血糖更容易集中上升。分心吃饭还可能让人忽略速度、份量和饱腹信号。'],
    actions: ['开饭前先把手机放下十分钟。', '大份主食先留出一部分，吃到舒服后再决定。', '汤饭、粥和果汁等容易快速咽下的食物，更要看份量。'],
    example: '干饭太硬时可以喝汤，但不必把米饭全泡软后一路顺下去。',
    sources: [SOURCES.dietaryGuide, SOURCES.nutritionCare],
  },
  '食品标签': {
    title: '别只看包装正面的大字',
    summary: '“无糖”“全麦”“低脂”只告诉你一部分信息，不能直接等同于低血糖负担。',
    mechanism: ['无添加蔗糖的面包仍含淀粉，低脂调味奶仍可能含乳糖和添加糖。营养成分表要结合“每100克”还是“每份”和实际吃多少一起看。'],
    actions: ['先看配料顺序，再看碳水化合物和糖。', '把标示的每份与你实际吃的份数对上。', '“无蔗糖”时继续查看其他糖和总碳水。'],
    example: '选全麦面包时，看全麦粉是否排在配料表前面，再配一个鸡蛋，比只相信“无糖全麦”更靠谱。',
    sources: [SOURCES.dietaryGuide, SOURCES.whoSugar],
  },
  '隐藏淀粉': {
    title: '看不见的淀粉也算数',
    summary: '水淀粉、丸子、粉条和加工肉的填充料，都可能把碳水带进这顿饭。',
    mechanism: ['水淀粉受热后糊化，浓芡会让每口菜都裹上一层淀粉。鱼丸、蟹棒和其他加工配料中也可能加入淀粉。'],
    actions: ['勾芡时用薄芡代替浓芡。', '吃火锅时把丸子和粉条当成碳水来管理，不要再叠加大份主食。'],
    example: '家常菜只用半勺水淀粉做薄芡，让汁刚好挂住菜，就比两勺收成浓汁更容易控制。',
    sources: [SOURCES.dietaryGuide, SOURCES.nutritionCare],
  },
  '隐藏糖与酱料': {
    title: '酱料里的糖和淀粉',
    summary: '沙拉酱、照烧汁和甜辣酱的份量不大，却容易在不知不觉中叠加。',
    mechanism: ['商业酱料可能同时含糖、淀粉和油脂。两种酱各加一勺，仍然是两份累积，“单份不多”不代表加起来不多。'],
    actions: ['一次选一种酱，放在旁边蘸着吃。', '看配料表和营养表，留意糖、碳水与每份大小。'],
    example: '吃沙拉时，只选一种酱并蘸着吃，吃到够味就停，不用让蔬菜泡在酱里。',
    sources: [SOURCES.dietaryGuide, SOURCES.whoSugar],
  },
  '隐藏糖与油脂': {
    title: '没点米饭，也可能吃进不少负担',
    summary: '加工食品、甜酱和油炸配料可能同时带来淀粉、糖和脂肪。',
    mechanism: ['炸腐竹、丸子、甜酱、芋圆和脆燕麦等配料看起来不像主食，但可能叠加碳水和脂肪。高脂肪还可能让餐后反应拖得更久。'],
    actions: ['把加工丸滑、油炸配料和甜酱当成“会累积的配料”。', '保留一份清楚的主食，少选多种看不见份量的加工配料。'],
    example: '麻辣烫可以选蔬菜、菌菇、瘦肉和豆腐，再在粉条、土豆或面中选一种。',
    sources: mealSources,
  },
  '水果形态': {
    title: '整颗水果和果汁不一样',
    summary: '水果榨成汁后，更容易在短时间喝下更多糖，饱腹感却更弱。',
    mechanism: ['榨汁会破坏咀嚼和原有结构，也可能去掉一部分纤维。喝果汁通常比吃同样份量的整果更快，餐后血糖也更容易快速上升。'],
    actions: ['日常优先直接吃整颗水果。', '把水果放在正餐后或做小份加餐，不用大盘空腹吃。'],
    example: '两个橙子榨成一杯汁很容易几分钟喝完；直接吃橙子会有更多咀嚼和停顿。',
    sources: [SOURCES.dietaryGuide, SOURCES.cdcMeal],
  },
  '水果代餐误区': {
    title: '水果不是一顿完整的饭',
    summary: '水果有营养，也含糖和碳水；大盘水果不能自动变成均衡晚餐。',
    mechanism: ['西瓜等水果的水分很多，但还是会提供可吸收的糖。吃一大盘时，份量带来的 GL 会上升；同时又缺少正餐的蛋白质和清晰结构。'],
    actions: ['把水果当成一小份餐后食物或加餐。', '晚餐仍保留蔬菜、蛋白质和适量主食。'],
    example: '小碗杂粮饭配蔬菜和肉，西瓜留一小份餐后吃，比西瓜加坚果当整顿晚餐更完整。',
    sources: mealSources,
  },
  '含糖饮料': {
    title: '饮料里的糖来得很快',
    summary: '含糖饮料容易快速喝下，糖吸收快，又不如固体食物耐饿。',
    mechanism: ['奶茶、果汁、运动饮料和部分乳酸菌饮料可能提供游离糖或快速碳水。液体形态减少咀嚼，很容易在短时间内把一瓶或一杯全部喝完。'],
    actions: ['日常解渴优先水、无糖茶或其他低能量饮品。', '点奶茶时同时看甜度、杯量和芋圆等配料，不要只看“少糖”。'],
    example: '走了很多路需要加餐时，香蕉配原味酸奶通常比少糖奶茶加芋圆更容易看清份量。',
    sources: [SOURCES.whoSugar, SOURCES.cdcMeal],
  },
  '含糖食物': {
    title: '健康光环不会让糖消失',
    summary: '蜂蜜、水果干、脆燕麦和天然甜味料仍会提供糖或碳水。',
    mechanism: ['食物的来源是否天然，与它是否提供可吸收的糖是两个问题。蜂蜜、果泥和果干都能让碳水在一顿里叠加。'],
    actions: ['看总碳水和份量，不只看是否写着“天然”。', '甜味配料选一种、用小份，避免蜂蜜、果泥、脆燕麦一起叠加。'],
    example: '果麦碗里同时放果泥、蜂蜜和脆燕麦，看着轻盈，却可能集中了多路碳水。',
    sources: [SOURCES.whoSugar, SOURCES.dietaryGuide],
  },
  '糖脂组合': {
    title: '高碳水加高脂肪',
    summary: '高脂肪不一定让血糖立刻更高，但可能让餐后反应来得更晚、拖得更久。',
    mechanism: ['油条、奶油吐司、芝士烤饼等食物同时含有较多淀粉和脂肪。脂肪可能延缓胃排空，让餐后曲线不只是“当下那一下”。'],
    actions: ['先减份量，再配蔬菜和蛋白质。', '不因为当下没感觉就继续加量。'],
    example: '想吃芝士烤饼，可以先吃一块配蔬菜，仍饿再决定是否加第二块。',
    sources: [SOURCES.china2024, SOURCES.nutritionCare],
  },
  '甜品份量': {
    title: '甜品可以吃，但需要有边界',
    summary: '吃甜品时，最直接的管理工具是缩小份量，而不是一边吃一边找“抵消”方法。',
    mechanism: ['冰淇淋、蛋糕和甜饮会提供添加糖和其他碳水，部分还同时含有较多脂肪。份量越大，这次的血糖负担通常越大。'],
    actions: ['先选小份或与人分享。', '不再同时搭配甜饮。', '慢慢吃，真正吃到想要的味道就停。'],
    example: '下午想吃冰淇淋，可以选小份慢慢吃，而不是大份冰淇淋加含糖饮料。',
    sources: [SOURCES.whoSugar, SOURCES.dietaryGuide],
  },
  '乳制品': {
    title: '选奶制品，别只看低脂',
    summary: '牛奶和酸奶本身含乳糖，调味产品还可能叠加额外的糖。',
    mechanism: ['“低脂”只描述脂肪，并不代表“低糖”。一大杯调味奶的乳糖、添加糖和总碳水仍需要计入这顿的份量。'],
    actions: ['优先看“添加糖”、“碳水化合物”和实际杯量。', '解饿时可选小杯无添加糖原味酸奶，但不把它当成零糖食物。'],
    example: '睡前有点饿，小杯无添加糖原味酸奶，通常比一大杯低脂调味奶更容易控制。',
    sources: [SOURCES.dietaryGuide, SOURCES.cdcMeal],
  },
  '低血糖识别与处理': {
    title: '低血糖：先确认，再快速处理',
    summary: '心慌、手抖、出汗和头晕要重视，但这些感觉不能单独证明一定是低血糖。',
    mechanism: ['可以测量时，应结合血糖数值、变化趋势和当下情境判断。确认低血糖且人清醒能吞咽时，需要的是能较快吸收的碳水，而不是脂肪很高的坚果或巧克力。'],
    actions: ['确认低血糖时，按“15-15”原则补约 15 克快速碳水，15 分钟后复测。', '仍低时再处理；恢复且离下一餐还远，再吃小份加餐。', '不能吞咽或意识异常时不要强喂，立即急救。'],
    example: '明确测到偏低时，果汁或葡萄糖可用于快速补糖；花生和核桃消化慢，不适合当第一步。',
    reminder: '对未使用降糖药物的一般人群，日常不适不一定是低血糖；反复发作或症状严重应就医。',
    sources: [SOURCES.china2024, SOURCES.adaLow],
  },
  '餐后反应': {
    title: '困、饿和心慌不是血糖诊断',
    summary: '身体感觉很重要，但需要结合吃了什么、发生时间和客观测量。',
    mechanism: ['饭后困倦、心慌、头晕或想吃东西可能有多种原因，并不是低血糖特有。如果没有测量就立刻补糖，反而可能让血糖再上升一轮。'],
    actions: ['先坐下、回顾时间和上一餐；有 CGM 或血糖仪时看数值与趋势。', '症状持续、反复或加重时，不要只靠食物猜测。'],
    example: '早餐后心慌犯困，先看数据和趋势，再决定是否补糖，比凭感觉直接吃夹心饼干更稳妥。',
    sources: [SOURCES.china2024, SOURCES.adaLow],
  },
  '规律进餐': {
    title: '别总把决策拖到饿急了以后',
    summary: '稳定的进餐节奏不是强迫每天一模一样，而是避免长时间空腹后失去份量感。',
    mechanism: ['拖过正餐后，饥饿、疲劳和压力容易叠加，后一顿也更容易吃得快、份量大。长时间不吃又叠加酒精或高强度运动时，还要留意低血糖风险。'],
    actions: ['忙的时候准备一份小而完整的备用餐，而不是只靠甜饮顶住。', '已经饿过头时，先慢下来，再按正常搭配吃饭。'],
    example: '赶时间的早上，玉米加牛奶，或全麦面包加鸡蛋，都比直接空腹到中午更容易接住状态。',
    sources: guidelineSources,
  },
  '饥饿觉察': {
    title: '这是真饿，还是想吃',
    summary: '口渴、压力、习惯和看见食物，都可能被感觉成“我需要加餐”。',
    mechanism: ['真实饥饿通常会逐渐增强，而情绪和习惯性食欲可能突然出现，并指向特定食物。刚吃过正餐时立刻补精制淀粉，可能只是又加了一次血糖上升。'],
    actions: ['先喝水、等十分钟，再判断。', '仍然真饿时，选小份原味酸奶、牛奶或坚果等加餐。'],
    example: '早餐后一小时想吃饼干，先喝水和稍等；若还饿，再补一份有蛋白质的小加餐。',
    sources: [SOURCES.dietaryGuide, SOURCES.nutritionCare],
  },
  '饱腹觉察': {
    title: '饱腹的目标是舒服，不是撑满',
    summary: '吃完盘子不是任务；能看见和回应饱腹信号，本身就是份量管理。',
    mechanism: ['吃得快、分心或面对“不要浪费”的压力时，容易在感到饱之后继续吃。大份主食硬撑完，会让更多碳水集中进入这顿。'],
    actions: ['吃到舒服时停一下，把剩下的打包。', '外食先分出一部分主食，而不是靠意志面对整盘。'],
    example: '长辈盛了一大碗饭，可以先吃菜和肉，米饭吃到舒服，剩下打包。',
    sources: [SOURCES.dietaryGuide, SOURCES.nutritionCare],
  },
  '压力进食': {
    title: '压力会把食物变成快速出口',
    summary: '压力大时想吃甜的或油炸的很常见，关键是别让它成为唯一的应对方式。',
    mechanism: ['压力、习惯和奖赏会共同影响进食决策。此时如果把蜂蜜、果泥、脆燕麦或甜饮叠加在一起，看上去“轻盈”的一顿也可能带来集中碳水。'],
    actions: ['先暂停几分钟，区分是真饿还是想安慰自己。', '选一顿有主食、蛋白质和蔬菜的正常饭，再决定要不要加小份甜食。'],
    example: '想点外卖安慰自己时，单层牛肉汉堡少酱、再加蔬菜，往往比果泥蜂蜜脆燕麦碗更容易看清结构。',
    sources: guidelineSources,
  },
  '可持续饮食': {
    title: '能长期吃的方案，才有用',
    summary: '过度克制可能换来短期的满足感，却让精力、心情和后续食欲更难管理。',
    mechanism: ['只吃水煮菜、完全不碰主食或追求零脂肪，容易让一顿饭缺少能量和满足感。长期管理更需要清楚份量和稳定结构，而不是极端排除。'],
    actions: ['保留适量主食和调味，用蔬菜和蛋白质搭出完整一餐。', '从可以重复做的小调整开始，例如半份主食、少一种酱、餐后走十分钟。'],
    example: '减脂晚餐可以是少量橄榄油调味的蔬菜、鸡胸肉，再配一小份杂粮，不必只剩水煮菜。',
    sources: mealSources,
  },
  '火锅搭配': {
    title: '火锅里怎么找到主食',
    summary: '火锅的碳水不只在米饭和面里，土豆、粉条、丸子、甜酱也可能叠加。',
    mechanism: ['炸腐竹、鱼丸、蟹棒、粉条和根茎类的结构与碳水差异很大。如果因为没点米饭就把这些都当作普通菜，很容易看不见这顿的总量。'],
    actions: ['先选蔬菜菌菇、瘦肉、鱼虾或豆腐。', '在米饭、面、粉条和根茎中留一份清楚主食。', '少量蘸酱，不把甜酱和油碟同时堆满。'],
    example: '蔬菜菌菇、瘦肉豆腐加半份米饭，是一套容易执行的火锅结构。',
    sources: mealSources,
  },
  '餐后活动': {
    title: '餐后轻轻动一动',
    summary: '餐后轻活动可以让骨骼肌多利用一些葡萄糖，不需要用剧烈运动“抵消”这顿饭。',
    mechanism: ['肌肉收缩时会增加对葡萄糖的利用。轻松散步、洗碗或拖地与刚吃饱就跑步不是同一强度，后者还可能带来胃部不适。'],
    actions: ['餐后先轻松活动十分钟左右，强度以舒服为准。', '正常训练放到更合适的时间，不用带着补偿心理运动。'],
    example: '晚餐后先洗碗、拖地或散步，等胃里舒服后再做原计划的运动。',
    sources: [SOURCES.china2024, SOURCES.cdcMeal],
  },
  '运动强度': {
    title: '同样是运动，强度不同反应也不同',
    summary: '轻活动可帮助利用葡萄糖；高强度运动则更依赖当下能量和身体状态。',
    mechanism: ['高强度运动会快速调动能量，压力激素还可能让血糖短时上升。空腹、酒后或已有不适时继续高强度运动，风险与普通散步不同。'],
    actions: ['餐后先选轻活动，不立刻跑步补偿。', '高强度训练前评估上一餐、补水和当下状态。'],
    example: '刚吃完烤饼时，先洗碗或慢走，不用马上跑三公里。',
    sources: [SOURCES.china2024, SOURCES.nutritionCare],
  },
  '运动与补能': {
    title: '运动前要不要吃，要看情境',
    summary: '是否需要补能，要看距离上一餐的时间、运动强度、持续时间和当下状态。',
    mechanism: ['运动会增加肌肉对能量的需求。离上一餐很久、已经饿或要进行高强度训练时，小份碳水可帮助接住状态；但普通轻活动不一定需要额外补糖。'],
    actions: ['训练前已经饿时，可选香蕉配原味酸奶、或少量水果配牛奶。', '份量不用到吃饱，给胃留出舒服的消化时间。'],
    example: '晚上八点还没吃晚饭就要上动感单车课，可先吃一根香蕉稍作消化，课后仍要接上正常餐。',
    sources: [SOURCES.china2024, SOURCES.nutritionCare],
  },
  '运动恢复': {
    title: '运动的最后五分钟',
    summary: '运动结束后先慢慢降低强度、补水并确认身体舒服，再离开。',
    mechanism: ['刚结束运动时，心率、出汗和能量利用还在变化。立刻坐车、拖延补水，容易忽略头晕、心慌或异常饥饿等信号。'],
    actions: ['先慢走几分钟，逐步降低强度。', '补水并观察身体反应，不用自动用含糖饮料收尾。'],
    example: '打完球后先慢走五分钟并补水，确认没有不适再坐车回家。',
    sources: [SOURCES.nutritionCare, SOURCES.china2024],
  },
  '运动营养': {
    title: '别被“黄金窗口”催着吃',
    summary: '训练后补充有价值，但不等于每次都要立即喝一大杯增肌粉。',
    mechanism: ['是否需要额外蛋白质和碳水，取决于训练量、下一餐时间和全天饮食。部分增肌粉含麦芽糊精等快速碳水，只看正面的“蛋白”两字会漏掉它。'],
    actions: ['先看配料表和每份碳水。', '离正餐不远时，可以直接用正常饭完成恢复。', '确实需要时，再选无糖奶或配料简单的蛋白粉。'],
    example: '举铁后先看今天的饮食和下一餐时间，而不是被“必须马上喝”的广告推着走。',
    sources: [SOURCES.nutritionCare, SOURCES.dietaryGuide],
  },
  '快速碳水': {
    title: '快速碳水要用在对的地方',
    summary: '它能较快提供葡萄糖，适合确认低血糖等特定情境，不是日常疲劳的通用解法。',
    mechanism: ['葡萄糖、果汁、麦芽糊精等可以较快提供葡萄糖。在没有确认低血糖时随手补糖，则可能只是又制造一次快速上升。'],
    actions: ['用于低血糖处理前先确认数值和症状。', '普通加餐优先小份碳水搭蛋白质，不必直接上纯糖。'],
    example: '训练后一般加餐可以是香蕉加原味酸奶；确认低血糖时才需要更快的补糖方式。',
    sources: [SOURCES.adaLow, SOURCES.china2024],
  },
  '酒精与血糖': {
    title: '酒精可能让血糖先升后降',
    summary: '酒精会影响肝脏制造和释放葡萄糖，空腹饮酒需要特别小心。',
    mechanism: ['啤酒或甜酒本身可以带来碳水，酒精又会优先占用肝脏代谢通路，影响肝糖输出。因此不能只看喝酒后当下的数值，还要警惕延迟性下降。'],
    actions: ['不空腹饮酒，先正常吃饭。', '控制酒量，不用吃菜或喝水来假设风险已被抵消。', '酒后出现冷汗、手抖或意识异常时及时测量和求助。'],
    example: '社交餐先正常吃饭，酒只留小份，后面换成无糖苏打水，比只吃菜连喝两杯更稳妥。',
    reminder: '使用胰岛素或降糖药物的人，饮酒相关风险需要听从医护人员的个体化建议。',
    sources: [SOURCES.china2024, SOURCES.adaLow],
  },
  '社交选择': {
    title: '社交餐可以有边界，不用全或无',
    summary: '真实生活里不是每顿都能精准计算，提前决定几个边界就很有用。',
    mechanism: ['聚餐时选择多、进食时间长，酒、甜饮、酱料和主食容易不知不觉叠加。过度克制也可能损耗心情，让后面更难持续。'],
    actions: ['聚餐前不故意饿一天。', '在酒、甜饮、甜品和大份主食中少叠加几项。', '把“今晚喝多少”提前决定，后面改无糖饮品。'],
    example: '聚餐可以正常吃菜、肉和适量主食，只喝一小杯低度酒，不需要用空腹换酒量。',
    sources: guidelineSources,
  },
  '咖啡因': {
    title: '咖啡可以提神，不能补眠',
    summary: '一杯咖啡的影响要分两部分看：咖啡因，以及杯子里加了什么。',
    mechanism: ['咖啡因可以短时提高警觉，但不会替你完成睡眠恢复。鲜奶咖啡还会带来乳糖和能量，加糖浆、奶油时则需要计入更多碳水。'],
    actions: ['喝咖啡时优先无添加糖，杯量不用过大。', '下午和晚上留意对入睡的影响。', '疲劳持续时优先补眠和休息，不追加多杯。'],
    example: '下午加餐可以选小杯无糖鲜奶拿铁，再散步一会儿；不把它当成睡眠替身。',
    sources: [SOURCES.dietaryGuide, SOURCES.nutritionCare],
  },
  '夜间加餐': {
    title: '真饿了的夜宵怎么选',
    summary: '夜宵不必一概硬忍，但它应该是小加餐，不是睡前的第二顿正餐。',
    mechanism: ['阳春面加果汁会叠加精制淀粉和液体糖，两样看着都不大，加起来却可能把碳水集中到睡前。只吃蛋白质又可能接不住真正饥饿。'],
    actions: ['选小份碳水加蛋白质，例如原味酸奶加半片全麦面包。', '避免面、果汁、甜品和大杯调味奶多路叠加。'],
    example: '睡前真的饿得难受，吃一小杯原味酸奶配半片全麦面包，吃到舒服即可。',
    sources: mealSources,
  },
  '睡眠与血糖': {
    title: '睡眠也会参与血糖节奏',
    summary: '同样一顿饭，在睡眠不足、压力大的时候，身体反应可能不一样。',
    mechanism: ['睡眠不足和昼夜节律推迟可能影响胰岛素敏感性、食欲与第二天的食物选择。补剂不能把继续熬夜的这些影响抹掉。'],
    actions: ['先保护相对稳定的入睡和起床时间。', '睡前提前放下手机，不用临时补剂给熬夜找安心理由。'],
    example: '准备睡觉时，按原计划关灯比先吃镁片再刷半小时手机更直接。',
    sources: [SOURCES.china2024, SOURCES.nutritionCare],
  },
  '补剂误区': {
    title: '补剂不能替代基础习惯',
    summary: '补剂可以有特定用途，但不能代替正常吃饭、睡眠、活动和专业评估。',
    mechanism: ['镁片、维生素和各类“阻断”产品处理的是特定成分或特定需求，它们不会把晚睡、过量饮食或长时间空腹变成没问题。'],
    actions: ['使用补剂前先确认目的、证据和是否真有需要。', '不用补剂为不想改变的习惯“入股”。'],
    example: '睡前刷手机导致的晚睡，优先改关灯时间，而不是先找一种补剂。',
    reminder: '有疾病、正在用药或考虑长期补充时，应咨询医生或药师。',
    sources: [SOURCES.china2024, SOURCES.nutritionCare],
  },
  '碳水阻断误区': {
    title: '“阻断”不能抹掉一顿饭',
    summary: '不要因为吃了阻断类产品，就放弃对主食、甜饮和份量的判断。',
    mechanism: ['这类产品的成分、剂量和实际作用差异很大，并不能保证把摄入的碳水全部挡住。如果同时大幅减少主食、长时间不吃，还可能让能量和饥饿状态更难管理。'],
    actions: ['先管理这顿的份量和搭配，不用产品给过量进食兜底。', '服用任何与血糖相关的药物或补充剂前，了解适应证和风险。'],
    example: '面对自助餐，先给主食和甜品设份量，比吃了“阻断片”就放开吃更可靠。',
    reminder: '小程序不推荐具体药物或补充剂，也不替代医疗建议。',
    sources: [SOURCES.china2024, SOURCES.nutritionCare],
  },
  '醋与餐后血糖': {
    title: '醋的作用有限，别让它变成主角',
    summary: '少量醋可能对部分餐后反应有轻微影响，但不能抵消一顿饭的碳水。',
    mechanism: ['醋酸可能影响胃排空或淀粉消化速度，但实际效果会随剂量、食物和个人状态变化。它不会让高碳水、大份量或含糖饮料消失。'],
    actions: ['喜欢时可少量、充分稀释后用。', '有反流、胃部不适或牙齿敏感时不要勉强。', '把主要精力放在主食份量和整餐搭配上。'],
    example: '餐前喝小杯充分稀释的苹果醋可以是个人选择，但这顿饭仍要看主食和饮料。',
    sources: [SOURCES.china2024, SOURCES.nutritionCare],
  },
  '寒冷与补能': {
    title: '冷到发抖时，先处理冷暴露',
    summary: '发抖是身体产热的表现，此时首要任务是避风和取暖，再视情况补充能量。',
    mechanism: ['寒冷环境会增加产热需求，激烈发抖会继续消耗能量。温水能带来舒服，但不能提供葡萄糖；只站在室外等回家，可能继续拖长不适。'],
    actions: ['先进入室内、避风和更换潮湿衣物。', '清醒能吃时，可用热红薯等一份碳水补能。', '持续剧烈发抖、动作笨拙或反应变慢要及时求助。'],
    example: '等车冻到发抖时，先到室内取暖，再吃一个热红薯，比只喝温水继续等更完整。',
    sources: [SOURCES.nutritionCare, SOURCES.china2024],
  },
}

// 部分标签是一个主题在具体情境中的切片。保留独立标题，但复用已审核的机制边界。
const aliases: Record<string, { base: string; title: string; summary: string; example: string }> = {
  '果汁': { base: '水果形态', title: '果汁与整果', summary: '', example: '' },
}

function derivedArticle(tag: string): KnowledgeArticle | null {
  const alias = aliases[tag]
  if (!alias) return null
  const base = KNOWLEDGE_ARTICLES[alias.base]
  return { ...base, title: alias.title, summary: alias.summary || base.summary, example: alias.example || base.example }
}

export function getKnowledgeArticle(tag: string): KnowledgeArticle | null {
  const article = KNOWLEDGE_ARTICLES[tag] || derivedArticle(tag)
  if (article) return article
  const index = KNOWLEDGE_INDEX[tag]
  if (!index) return null
  return {
    title: index.title,
    summary: index.takeaway,
    mechanism: ['这个知识点会在多个生活情境中出现。回到题目时，优先看食物的碳水来源、份量、加工方式和当时的身体状态。'],
    actions: [index.takeaway],
    example: '可以回看本次复盘里与该知识点相关的情境，再对照当时的选择。',
    sources: guidelineSources,
  }
}
