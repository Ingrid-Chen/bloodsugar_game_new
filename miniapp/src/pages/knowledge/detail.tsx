import { Button, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getKnowledgeArticle } from './content'
import './detail.scss'

function decode(value?: string): string {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export default function KnowledgeDetailPage() {
  const router = useRouter()
  const tag = decode(router.params.tag)
  const scene = decode(router.params.scene)
  const article = getKnowledgeArticle(tag)

  if (!article) {
    return (
      <View className='knowledge-state'>
        <Text>暂时没有找到这个知识点。</Text>
        <Button className='knowledge-back' onClick={() => void Taro.navigateBack()}>返回</Button>
      </View>
    )
  }

  return (
    <ScrollView className='knowledge-scroll' scrollY>
      <View className='knowledge-page'>
        <View className='knowledge-kicker'>💡 血糖小课堂</View>
        <Text className='knowledge-title'>{article.title}</Text>
        {scene && <Text className='knowledge-scene'>你是从“{scene}”这个情境来的</Text>}

        <View className='knowledge-lead'>
          <Text className='knowledge-lead__label'>先记住这句</Text>
          <Text className='knowledge-lead__text'>{article.summary}</Text>
        </View>

        <View className='knowledge-card'>
          <Text className='knowledge-heading'>它为什么会影响血糖？</Text>
          {article.mechanism.map((paragraph) => (
            <Text className='knowledge-paragraph' key={paragraph}>{paragraph}</Text>
          ))}
        </View>

        <View className='knowledge-card knowledge-card--green'>
          <Text className='knowledge-heading'>下次可以怎么做？</Text>
          <View className='knowledge-actions'>
            {article.actions.map((action, index) => (
              <View className='knowledge-action' key={action}>
                <Text className='knowledge-action__number'>{index + 1}</Text>
                <Text className='knowledge-action__text'>{action}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='knowledge-example'>
          <Text className='knowledge-example__title'>🥢 放进生活里</Text>
          <Text className='knowledge-example__text'>{article.example}</Text>
        </View>

        {article.reminder && (
          <View className='knowledge-reminder'>
            <Text className='knowledge-reminder__title'>需要特别留意</Text>
            <Text className='knowledge-reminder__text'>{article.reminder}</Text>
          </View>
        )}

        <View className='knowledge-sources'>
          <Text className='knowledge-sources__title'>参考资料</Text>
          {article.sources.map((source) => (
            <View className='knowledge-source' key={source.url}>
              <Text>{source.title}</Text>
              <Button
                className='knowledge-source__copy'
                onClick={() => void Taro.setClipboardData({ data: source.url })}
              >
                复制链接
              </Button>
            </View>
          ))}
        </View>

        <Text className='knowledge-footnote'>内容用于一般健康科普，不构成个体化医疗建议。</Text>
        <Button className='knowledge-back' onClick={() => void Taro.navigateBack()}>返回继续</Button>
      </View>
    </ScrollView>
  )
}
