/**
 * 分类工具函数
 * 处理分类的父子关系和层级结构
 */

/**
 * 获取包含父分类的完整分类ID列表
 * @param {Array} selectedIds 选中的分类ID数组
 * @param {Array} allCategories 所有分类数据
 * @returns {Array} 包含父分类的完整分类ID数组
 */
export const getCompleteTagIds = (selectedIds, allCategories) => {
  const result = new Set()
  
  selectedIds.forEach(categoryId => {
    // 添加当前分类
    result.add(categoryId)
    
    // 递归添加所有父分类
    addParentCategories(categoryId, result, allCategories)
  })
  
  return Array.from(result)
}

/**
 * 递归添加父分类
 * @param {Number} categoryId 分类ID
 * @param {Set} resultSet 结果集合
 * @param {Array} allCategories 所有分类数据
 */
export const addParentCategories = (categoryId, resultSet, allCategories) => {
  const category = allCategories.find(cat => cat.id === categoryId)
  if (category && category.parentId && category.parentId !== 0) {
    // 添加父分类
    resultSet.add(category.parentId)
    // 递归添加父分类的父分类
    addParentCategories(category.parentId, resultSet, allCategories)
  }
}

/**
 * 获取分类的完整路径（从根到当前分类）
 * @param {Number} categoryId 分类ID
 * @param {Array} allCategories 所有分类数据
 * @returns {Array} 分类路径数组
 */
export const getCategoryPath = (categoryId, allCategories) => {
  const path = []
  let currentId = categoryId
  
  while (currentId && currentId !== 0) {
    const category = allCategories.find(cat => cat.id === currentId)
    if (category) {
      path.unshift(category)
      currentId = category.parentId
    } else {
      break
    }
  }
  
  return path
}

/**
 * 构建分类树
 * @param {Array} categories 分类数组
 * @returns {Array} 分类树
 */
export const buildCategoryTree = (categories) => {
  if (!categories || categories.length === 0) return []
  
  const tree = []
  const categoryMap = new Map()

  // 先创建所有节点的映射
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: []
    })
  })

  // 构建树结构
  categories.forEach(category => {
    const categoryNode = categoryMap.get(category.id)
    if (category.parentId === 0) {
      // 根节点
      tree.push(categoryNode)
    } else if (categoryMap.has(category.parentId)) {
      // 子节点
      const parentNode = categoryMap.get(category.parentId)
      parentNode.children.push(categoryNode)
    }
  })

  // 按排序权重排序
  const sortTree = (nodes) => {
    nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children)
      }
    })
  }
  
  sortTree(tree)
  return tree
}

/**
 * 获取所有子分类ID（递归）
 * @param {Number} parentId 父分类ID
 * @param {Array} allCategories 所有分类数据
 * @returns {Array} 子分类ID数组
 */
export const getAllChildrenIds = (parentId, allCategories) => {
  const childrenIds = []
  
  const findChildren = (pid) => {
    allCategories.forEach(category => {
      if (category.parentId === pid) {
        childrenIds.push(category.id)
        findChildren(category.id) // 递归查找子分类
      }
    })
  }
  
  findChildren(parentId)
  return childrenIds
}

/**
 * 检查分类是否为另一个分类的子分类
 * @param {Number} childId 子分类ID
 * @param {Number} parentId 父分类ID
 * @param {Array} allCategories 所有分类数据
 * @returns {Boolean} 是否为子分类
 */
export const isChildOf = (childId, parentId, allCategories) => {
  const category = allCategories.find(cat => cat.id === childId)
  if (!category) return false
  
  if (category.parentId === parentId) return true
  if (category.parentId === 0) return false
  
  return isChildOf(category.parentId, parentId, allCategories)
}

/**
 * 获取自动添加的父分类信息
 * @param {Array} selectedIds 选中的分类ID
 * @param {Array} completeIds 完整的分类ID（包含自动添加的父分类）
 * @param {Array} allCategories 所有分类数据
 * @returns {Object} 包含自动添加的父分类信息
 */
export const getAutoAddedParentInfo = (selectedIds, completeIds, allCategories) => {
  const autoAddedIds = completeIds.filter(id => !selectedIds.includes(id))
  const autoAddedCategories = autoAddedIds.map(id => 
    allCategories.find(cat => cat.id === id)
  ).filter(Boolean)
  
  return {
    ids: autoAddedIds,
    categories: autoAddedCategories,
    names: autoAddedCategories.map(cat => cat.name)
  }
} 