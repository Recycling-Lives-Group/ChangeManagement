import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Tag,
  Clock,
  User,
  Star,
  Filter,
  FileText,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  excerpt: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  comments: number;
  rating: number;
  status: 'published' | 'draft' | 'archived';
  relatedChanges?: string[];
}

const sampleArticles: Article[] = [
  {
    id: 'kb-001',
    title: 'Database Migration Best Practices',
    category: 'Technical Guides',
    tags: ['database', 'migration', 'postgresql', 'best-practices'],
    content: 'Comprehensive guide on database migration procedures...',
    excerpt: 'Learn the essential steps and best practices for safely migrating production databases with zero downtime.',
    author: 'John Doe',
    createdAt: new Date(2025, 9, 15),
    updatedAt: new Date(2025, 10, 20),
    views: 342,
    likes: 48,
    comments: 12,
    rating: 4.8,
    status: 'published',
    relatedChanges: ['CR-2025-001', 'CR-2025-015'],
  },
  {
    id: 'kb-002',
    title: 'Emergency Change Request Procedures',
    category: 'Processes',
    tags: ['emergency', 'process', 'approval', 'escalation'],
    content: 'Standard operating procedures for emergency changes...',
    excerpt: 'Fast-track approval process for critical emergency changes including escalation paths and notification requirements.',
    author: 'Jane Smith',
    createdAt: new Date(2025, 9, 10),
    updatedAt: new Date(2025, 10, 18),
    views: 567,
    likes: 89,
    comments: 23,
    rating: 4.9,
    status: 'published',
    relatedChanges: ['CR-2025-002', 'CR-2025-008'],
  },
  {
    id: 'kb-003',
    title: 'Rollback Strategy Template',
    category: 'Templates',
    tags: ['rollback', 'template', 'contingency', 'disaster-recovery'],
    content: 'Comprehensive rollback strategy template...',
    excerpt: 'Ready-to-use template for documenting rollback procedures and contingency plans for all change types.',
    author: 'Bob Johnson',
    createdAt: new Date(2025, 8, 25),
    updatedAt: new Date(2025, 9, 30),
    views: 234,
    likes: 56,
    comments: 8,
    rating: 4.6,
    status: 'published',
  },
  {
    id: 'kb-004',
    title: 'Risk Assessment Guidelines',
    category: 'Technical Guides',
    tags: ['risk', 'assessment', 'evaluation', 'guidelines'],
    content: 'How to properly assess risk for change requests...',
    excerpt: 'Detailed guidelines for evaluating and scoring risk levels for different types of change requests.',
    author: 'Alice Williams',
    createdAt: new Date(2025, 10, 1),
    updatedAt: new Date(2025, 10, 15),
    views: 456,
    likes: 72,
    comments: 15,
    rating: 4.7,
    status: 'published',
    relatedChanges: ['CR-2025-012'],
  },
  {
    id: 'kb-005',
    title: 'CAB Meeting Preparation Checklist',
    category: 'Processes',
    tags: ['cab', 'meeting', 'checklist', 'preparation'],
    content: 'Complete checklist for preparing CAB meetings...',
    excerpt: 'Ensure successful CAB meetings with this comprehensive preparation checklist covering all essential items.',
    author: 'Mike Brown',
    createdAt: new Date(2025, 9, 20),
    updatedAt: new Date(2025, 10, 10),
    views: 289,
    likes: 41,
    comments: 7,
    rating: 4.5,
    status: 'published',
  },
  {
    id: 'kb-006',
    title: 'Common Change Failure Patterns',
    category: 'Troubleshooting',
    tags: ['troubleshooting', 'failures', 'patterns', 'lessons-learned'],
    content: 'Analysis of common failure patterns and how to avoid them...',
    excerpt: 'Learn from past failures: common patterns, root causes, and preventive measures for successful changes.',
    author: 'Sarah Davis',
    createdAt: new Date(2025, 10, 5),
    updatedAt: new Date(2025, 10, 22),
    views: 412,
    likes: 68,
    comments: 19,
    rating: 4.9,
    status: 'published',
  },
  {
    id: 'kb-007',
    title: 'Integration Testing Requirements',
    category: 'Technical Guides',
    tags: ['testing', 'integration', 'qa', 'requirements'],
    content: 'Requirements and best practices for integration testing...',
    excerpt: 'Comprehensive guide to integration testing requirements for major changes affecting multiple systems.',
    author: 'John Doe',
    createdAt: new Date(2025, 9, 8),
    updatedAt: new Date(2025, 9, 28),
    views: 178,
    likes: 32,
    comments: 5,
    rating: 4.4,
    status: 'draft',
  },
  {
    id: 'kb-008',
    title: 'Post-Implementation Review Process',
    category: 'Processes',
    tags: ['pir', 'review', 'lessons-learned', 'continuous-improvement'],
    content: 'How to conduct effective post-implementation reviews...',
    excerpt: 'Step-by-step guide for conducting PIRs that drive continuous improvement and capture valuable insights.',
    author: 'Jane Smith',
    createdAt: new Date(2025, 10, 12),
    updatedAt: new Date(2025, 10, 24),
    views: 298,
    likes: 44,
    comments: 11,
    rating: 4.6,
    status: 'published',
  },
];

const categories = ['All', 'Technical Guides', 'Processes', 'Templates', 'Troubleshooting'];

export const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Get all unique tags
  const allTags = Array.from(new Set(articles.flatMap((article) => article.tags)));

  const filteredArticles = articles
    .filter((article) => {
      if (selectedCategory !== 'All' && article.category !== selectedCategory) return false;
      if (selectedTag && !article.tags.includes(selectedTag)) return false;
      if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return article.status === 'published';
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const popularArticles = [...articles]
    .filter((a) => a.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('detail');
    // Increment view count
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, views: a.views + 1 } : a))
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Knowledge Base
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive library of guides, procedures, and best practices
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, guides, and procedures..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
          <BookOpen className="w-8 h-8 mb-2" />
          <p className="text-3xl font-bold">{articles.filter((a) => a.status === 'published').length}</p>
          <p className="text-sm opacity-90">Published Articles</p>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Category Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Categories
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {allTags.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-3 mt-4">
                  <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedTag === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {filteredArticles.length} Articles
              </h2>
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold">{article.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {article.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{article.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{article.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Popular Articles */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Most Popular
                </h3>
                <div className="space-y-3">
                  {popularArticles.map((article, index) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition"
                    >
                      <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                          <Eye className="w-3 h-3" />
                          <span>{article.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: FileText, label: 'All Templates', count: 12 },
                    { icon: CheckCircle, label: 'Best Practices', count: 8 },
                    { icon: AlertTriangle, label: 'Troubleshooting', count: 15 },
                    { icon: BookOpen, label: 'Process Guides', count: 23 },
                  ].map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {link.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {link.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Article Detail View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedArticle(null);
                }}
                className="mb-6 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                ← Back to all articles
              </button>

              {selectedArticle && (
                <>
                  <div className="mb-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-semibold">
                      {selectedArticle.category}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {selectedArticle.title}
                  </h1>

                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{selectedArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Updated {selectedArticle.updatedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedArticle.views} views</span>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none mb-6">
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedArticle.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {selectedArticle.relatedChanges && selectedArticle.relatedChanges.length > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Related Changes
                      </h3>
                      <div className="flex gap-2">
                        {selectedArticle.relatedChanges.map((changeId) => (
                          <span
                            key={changeId}
                            className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm font-mono"
                          >
                            {changeId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({selectedArticle.likes})
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                      <Edit2 className="w-4 h-4" />
                      Suggest Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Article Stats
              </h3>
              {selectedArticle && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{selectedArticle.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Views:</span>
                    <span className="font-semibold">{selectedArticle.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Likes:</span>
                    <span className="font-semibold">{selectedArticle.likes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Comments:</span>
                    <span className="font-semibold">{selectedArticle.comments}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
