const app = require("../app.js");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed.js");
const {
  topicData,
  userData,
  articleData,
  commentData,
} = require("../db/data/test-data");
const endpointFile = require("../endpoints.json");
const req = require("express/lib/request.js");

afterAll(() => {
  db.end();
});

beforeEach(() => {
  return seed({ topicData, userData, articleData, commentData });
});

describe("/api", () => {
  it("GET 200: responds with all available endpoints on the API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        expect(endpoints).toEqual(endpointFile);
      });
  });
});

describe("/api/topics", () => {
  it("GET 200: responds with all topics.", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
        });
      });
  });
});

describe("/api/invalid-endpoint", () => {
  it("GET 404: when invalid URL provided", () => {
    return request(app)
      .get("/api/not-an-endpoint")
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("not found");
      });
  });
});

describe("/api/articles/:article_id", () => {
  it("GET 200: responds with article corresponding with given ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",

          article_id: 1,
        });
      });
  });
  it("GET 400: when given invalid ID", () => {
    return request(app)
      .get("/api/articles/not-a-valid-id")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("bad request");
      });
  });
  it("GET 404: when given an id in a valid format which doesn't exist", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("article not found");
      });
  });
  it("PATCH 200: responds with the updated article with amended vote property", () => {
    const body = { inc_votes: 1 }
    return request(app)
      .patch("/api/articles/1")
      .send(body)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: 1,
        })
      })
  })
  it("PATCH 400: when given vote in invalid data type", () => {
    const body = { inc_votes: "one" }
    return request(app)
      .patch("/api/articles/1")
      .send(body)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request")
      })
  })
   it("PATCH 400: when given invalid article ID data type", () => {
     const body = { inc_votes: 1 };
     return request(app)
       .patch("/api/articles/one")
       .send(body)
       .expect(400)
       .then(({ body: { message } }) => {
         expect(message).toBe("bad request");
       });
   });
  it("PATCH 404: when given a valid article id but which doesn't exist", () => {
    const body = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/14")
      .send(body)
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toBe("article not found");
      });
  });
  it("PATCH 400: when given body with incorrect property", () => {
    const body = { increase_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(body)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
});

describe("/api/articles", () => {
  it("GET 200: responds with all articles with correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(13);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(article.author).toBeString();
          expect(article.title).toBeString();
          expect(article.article_id).toBeNumber();
          expect(article.topic).toBeString();
          expect(article.created_at).toBeString();
          expect(article.votes).toBeNumber();
          expect(article.article_img_url).toBeString();
          expect(article.comment_count).toBeNumber();
          expect(article.body).toBeUndefined();
        });
        expect(articles[0].comment_count).toBe(2)
      });
  });
  it("GET 200: if given topic query, should revert with these articles", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12)
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch")
        })
      })
  })
  it ("GET 404: if given a value for topic as a query which does not exist", () => {
    return request(app)
      .get("/api/articles/?topic=does-not-exist")
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toBe("topic not found");
      })
  })
  it("GET 200: receives all articles if given query parameter which is not 'topic'.", () => {
    return request(app)
      .get("/api/articles/?not-topic=something")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(13);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(article.author).toBeString();
          expect(article.title).toBeString();
          expect(article.article_id).toBeNumber();
          expect(article.topic).toBeString();
          expect(article.created_at).toBeString();
          expect(article.votes).toBeNumber();
          expect(article.article_img_url).toBeString();
          expect(article.comment_count).toBeNumber();
          expect(article.body).toBeUndefined();
        });
        expect(articles[0].comment_count).toBe(2);
      });
  })
  it("GET 200: if given a query parameter which exists but there aren't any topics returns []", () => {
     return request(app)
       .get("/api/articles?topic=paper")
       .expect(200)
       .then(({ body: { articles } }) => {
         expect(articles).toEqual([])
       });
  })
})

describe("/api/articles/:article_id/comments", () => {
  it("GET 200: responds with all comments from a given article id.", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeArray();
        expect(comments).toHaveLength(2);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(comment.comment_id).toBeNumber();
          expect(comment.votes).toBeNumber();
          expect(comment.created_at).toBeString();
          expect(comment.author).toBeString();
          expect(comment.body).toBeString();
          expect(comment.article_id).toBeNumber();
        });
      });
  });
  it("GET 400: response when given invalid article id", () => {
    return request(app)
      .get("/api/articles/not-an-id/comments")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("bad request");
      });
  });
  it("GET 200: responds with empty array when given valid id but no comments to be returned.", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body:{comments} }) => {
        expect(comments).toEqual([]);
      });
  });
  it("POST 201: when provided with a comment.", () => {
    const comment = {
      username: "butter_bridge",
      body: "Did not look like a pug!",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(comment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 19,
          votes: 0,
          body: "Did not look like a pug!",
          created_at: expect.any(String),
          author: "butter_bridge",
          article_id: 3,
        });
      });
  });
  it("POST 400: when given comment with values in the incorrect data type", () => {
    const comment = {
      username: 123,
      body: "Did not look like a pug!",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
  it("POST 400: when given comment with missing properties", () => {
    const comment = {
      body: "Did not look like a pug!",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
  it("POST 400: when given comment with incorrect properties", () => {
    const comment = {
      body: "Did not look like a pug!",
      votes:10
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
  it("POST 400: when given username which doesn't exist", () => {
    const comment = {
      username: "butter",
      body: "Did not look like a pug!",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  })
});

describe("/api/comments/:comment_id", () => {
  it("DELETE 204: responds with correct status", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
  })
  it("DELETE 400: when given invalid data type for comment id", () => {
    return request(app)
      .delete("/api/comments/one")
      .expect(400)
      .then(({ body :{message}}) => {
      expect(message).toBe("bad request")
    })
  })
  it("DELETE 404: when given valid id data type but which doesn't exist yet", () => {
    return request(app)
      .delete("/api/comments/19")
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toBe("comment does not exist");
      });
  });
})

describe("/api/users", () => {
  it("GET 200: responds with all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body:{users} }) => {
        expect(users).toHaveLength(4)
        users.forEach((user) => {
          expect(user.username).toBeString()
          expect(user.name).toBeString()
          expect(user.avatar_url).toBeString()
        })
    })
  })
})

