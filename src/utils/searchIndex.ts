export interface SearchItem {
  id: string
  title: string
  path: string
  content: string
}

const searchIndex: SearchItem[] = [
  {
    id: 'study',
    title: '学习篇',
    path: '/doc/study',
    content: '选科 学习资源 身心状态 学习策略 选科规则 选科指导 优势和兴趣 大学专业选择 学校资源 老师 班型 师资 同学互助 校内作业 校内考试 校外资源 网课 补课班 教辅 真题卷 AI 身体状态 运动 睡眠 学习心态 学习节奏 假努力 学习策略 统筹策略 学习方法'
  },
  {
    id: 'life',
    title: '生活篇',
    path: '/doc/life',
    content: '老师 规则 朋友 恋爱 家长 课程 活动 校园资源 社团 学生组织 项目 办活动 建立社团 精力 动力 情绪稳定 学习建议 高中生活'
  }
]

export function searchDocs(query: string): SearchItem[] {
  if (!query || query.trim().length === 0) return []

  const lowerQuery = query.toLowerCase()
  const terms = lowerQuery.split(/\s+/).filter(t => t.length > 0)

  return searchIndex.filter(item => {
    const searchText = `${item.title} ${item.content}`.toLowerCase()
    return terms.every(term => searchText.includes(term))
  }).slice(0, 10)
}
