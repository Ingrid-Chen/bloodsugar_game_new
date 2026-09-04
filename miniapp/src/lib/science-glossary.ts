export type ScienceTermId = 'GI' | 'GL' | 'CGM' | '15-15'

export interface ScienceTerm {
  id: ScienceTermId
  label: string
  title: string
  definition: string
}

export const SCIENCE_TERMS: Record<ScienceTermId, ScienceTerm> = {
  GI: {
    id: 'GI',
    label: 'GI',
    title: 'GI（血糖生成指数）',
    definition: '看同等碳水下，食物让血糖升得多快、多高。',
  },
  GL: {
    id: 'GL',
    label: 'GL',
    title: 'GL（血糖负荷）',
    definition: '把食物的 GI 和这一份实际含有的碳水量一起算进去。',
  },
  CGM: {
    id: 'CGM',
    label: 'CGM',
    title: 'CGM（持续葡萄糖监测）',
    definition: '通过传感器连续记录组织液葡萄糖的变化和趋势。',
  },
  '15-15': {
    id: '15-15',
    label: '15-15',
    title: '15-15 法则',
    definition: '确认低血糖且人清醒时，补约 15 克快速碳水，15 分钟后复测。',
  },
}

export const SCIENCE_TERM_ORDER: ScienceTermId[] = ['GI', 'GL', 'CGM', '15-15']

const TERM_PATTERNS: Record<ScienceTermId, RegExp> = {
  GI: /GI/i,
  GL: /GL/i,
  CGM: /CGM/i,
  '15-15': /15\s*[-–—－]\s*15/,
}

export function findScienceTerms(text: string): ScienceTermId[] {
  return SCIENCE_TERM_ORDER.filter((termId) => TERM_PATTERNS[termId].test(text))
}

export function getFirstEncounterTerms(
  encountered: ScienceTermId[],
  seen: ScienceTermId[],
): ScienceTermId[] {
  const unseen = encountered.filter((termId) => !seen.includes(termId))
  if (unseen.includes('GL') && !seen.includes('GI') && !unseen.includes('GI')) {
    return ['GI', ...unseen]
  }
  return unseen
}

export function getFirstEncounterCopy(termIds: ScienceTermId[]): { title: string; definition: string } {
  if (termIds.includes('GI') && termIds.includes('GL')) {
    return {
      title: 'GI 和 GL 有什么区别？',
      definition: 'GI 看同等碳水下血糖升得多快、多高；GL 还会把这一份实际吃了多少算进去。',
    }
  }
  const term = SCIENCE_TERMS[termIds[0]]
  return term
    ? { title: term.title, definition: term.definition }
    : { title: '', definition: '' }
}
