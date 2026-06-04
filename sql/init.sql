-- 上海餐饮情报站 - 数据库初始化 SQL
-- 在 Supabase SQL Editor 中执行

-- 话题表
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  category VARCHAR(20) NOT NULL CHECK (category IN ('intelligence','rescue','rant')),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft','published')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 评论表
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  nickname VARCHAR(50) DEFAULT '匿名店长',
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','deleted')),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 评论点赞表（IP防重）
CREATE TABLE comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(comment_id, ip_address)
);

-- 话题浏览记录表（IP去重）
CREATE TABLE topic_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  view_date VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(topic_id, ip_address, view_date)
);

-- 创建索引优化查询
CREATE INDEX idx_comments_topic_id ON comments(topic_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_topic_views_topic_id ON topic_views(topic_id);
CREATE INDEX idx_topic_views_ip ON topic_views(ip_address);
CREATE INDEX idx_topic_views_view_date ON topic_views(view_date);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_status ON topics(status);
