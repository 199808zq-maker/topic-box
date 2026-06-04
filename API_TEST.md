# API 测试命令清单

> 请将 `http://localhost:3000` 替换为实际部署域名

## 1. 创建话题

```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试话题标题",
    "description": "这是一个测试话题的描述内容",
    "category": "intelligence",
    "images": []
  }'
```

## 2. 获取话题列表

```bash
curl "http://localhost:3000/api/topics"
```

按板块筛选：
```bash
curl "http://localhost:3000/api/topics?category=intelligence"
```

## 3. 获取话题详情（自动计浏览）

```bash
curl "http://localhost:3000/api/topics/[topic_id]"
```

## 4. 发表评论（同IP 1小时限3条）

```bash
curl -X POST "http://localhost:3000/api/topics/[topic_id]/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "匿名店长",
    "content": "这是一条测试评论"
  }'
```

## 5. 点赞评论

```bash
curl -X POST "http://localhost:3000/api/comments/[comment_id]/like"
```

## 6. 转发统计

```bash
curl -X POST "http://localhost:3000/api/topics/[topic_id]/share"
```

## 7. 管理后台 - 话题列表

```bash
curl "http://localhost:3000/api/admin/topics" \
  -H "authorization: Bearer your-admin-password"
```

## 8. 管理后台 - 评论审核列表

```bash
curl "http://localhost:3000/api/admin/topics/[topic_id]/comments" \
  -H "authorization: Bearer your-admin-password"
```

按状态筛选：
```bash
curl "http://localhost:3000/api/admin/topics/[topic_id]/comments?status=pending" \
  -H "authorization: Bearer your-admin-password"
```

## 9. 管理后台 - 审核评论

通过评论：
```bash
curl -X PATCH "http://localhost:3000/api/admin/comments/[comment_id]" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer your-admin-password" \
  -d '{"status": "approved"}'
```

删除评论：
```bash
curl -X PATCH "http://localhost:3000/api/admin/comments/[comment_id]" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer your-admin-password" \
  -d '{"status": "deleted"}'
```
