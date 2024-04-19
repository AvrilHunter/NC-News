SELECT
      articles.author,       title,
      articles.article_id,       topic,
      articles.created_at,
      articles.votes,
      COUNT(comments.comment_id)::INT AS comment_count,
      COUNT(*) OVER() AS total_count
    FROM articles
    LEFT OUTER JOIN comments
    ON articles.article_id=comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;
    LIMIT 5
    OFFSET 5;