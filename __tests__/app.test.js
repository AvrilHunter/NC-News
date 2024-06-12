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
  it("POST 201: responds with topic containing newly added topic", () => {
    const body = {
      slug: "dogs",
      description: "the best pet",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic).toMatchObject({
          slug: "dogs",
          description: "the best pet",
        });
      });
  });
  it("POST 400: when given slug which is not unique ", () => {
    const body = {
      slug: "paper",
      description: "another description",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("not a unique identifier");
      });
  });
  it("POST 400: when missing primary key data", () => {
    const body = {
      description: "another description",
    };
    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
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
    const body = { inc_votes: 1 };
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
        });
      });
  });
  it("PATCH 400: when given vote in invalid data type", () => {
    const body = { inc_votes: "one" };
    return request(app)
      .patch("/api/articles/1")
      .send(body)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
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
  it("GET 200: responds with article corresponding with given ID, should also include the comment-count", () => {
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
          comment_count: 11,
        });
      });
  });
  it("GET 200: responds with article corresponding with given ID - the comment-count displays as 0 if no associated comments.", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.comment_count).toBe(0);
      });
  });
  it("DELETE 204: responds with correct status", () => {
    return request(app).delete("/api/articles/1").expect(204);
  });
  it("DELETE 400: when give invalid data type for article_id", () => {
    return request(app)
      .delete("/api/articles/abc")
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("DELETE 404: when give valid article id data type but which doesn't exist yet", () => {
    return request(app)
      .delete("/api/articles/9999")
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toBe("no article found");
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
        expect(articles.length).toBe(10);
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
  });
  it("GET 200: if given topic query, should revert with these articles", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(10);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  it("GET 404: if given a value for topic as a query which does not exist", () => {
    return request(app)
      .get("/api/articles/?topic=does-not-exist")
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toBe("topic not found");
      });
  });
  it("GET 200: receives all articles if given query parameter which is not 'topic'.", () => {
    return request(app)
      .get("/api/articles/?not-topic=something")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
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
  });
  it("GET 200: if given a topic query which exists but there aren't any topics returned []", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toEqual([]);
      });
  });
  it("GET 200: when given valid sort-by query defaulting to descending", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });
  it("GET 200: when given calculated column to sort-by-defaulting to descending", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("comment_count", { descending: true });
      });
  });
  it("GET 200: when given order of ASC", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at");
      });
  });
  it("GET 200: when given sort, order and query parameters", () => {
    return request(app)
      .get("/api/articles?order=asc&&sort_by=title&&topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("title");
        expect(articles).toHaveLength(10);
      });
  });
  it("GET 400: when the sort query is given a column name which doesn't exist", () => {
    return request(app)
      .get("/api/articles?sort_by=not-a-column")
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("GET 400: when given an order which is not  ASC or DESC", () => {
    return request(app)
      .get("/api/articles?order=not-an-order")
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("GET 200: when given a limit to action with no pages, overrides the default", () => {
    return request(app)
      .get("/api/articles?limit=11")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toHaveLength(11);
        expect(total_count).toBe(13);
      });
  });
  it("GET 400: when given a limit which is not a number", () => {
    return request(app)
      .get("/api/articles?limit=not-a-number")
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("GET 200: responds with the correct items when given limit and pages", () => {
    const firstTest = request(app)
      .get("/api/articles?p=2&&limit=10")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toHaveLength(3);
        expect(total_count).toBe(13);
        expect(articles[0]).toMatchObject({
          article_id: 8,
          title: "Does Mitch predate civilisation?",
          topic: "mitch",
          author: "icellusedkars",
        });
      });

    const secondTest = request(app)
      .get("/api/articles?p=2&&limit=5")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toHaveLength(5);
        expect(total_count).toBe(13);
        expect(articles[0]).toMatchObject({
          author: "rogersop",
          title: "UNCOVERED: catspiracy to bring down democracy",
          article_id: 5,
        });
      });
    return Promise.all([firstTest, secondTest]);
  });

  it("GET 200: total_count adjusts when a filter is applied - topic query is given", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toHaveLength(10);
        expect(total_count).toBe(12);
      });
  }),
    it("GET 200: when given topic query, limit and pages, returns correct total_count.", () => {
      return request(app)
        .get("/api/articles?topic=mitch&&p=2&&limit=8")
        .expect(200)
        .then(({ body: { articles, total_count } }) => {
          expect(articles).toHaveLength(4);
          expect(total_count).toBe(12);
        });
    });
  it("GET 404: when given a page has no remaining articles to display", () => {
    return request(app)
      .get("/api/articles?p=3")
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toEqual("no more articles to be displayed");
      });
  });
  it("GET 400: when give pages query in incorrect format", () => {
    return request(app)
      .get("/api/articles?p=not-a-number")
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("POST 201: returns newly added article when not given image URL link", () => {
    const body = {
      topic: "mitch",
      title: "Seven MORE inspirational thought leaders from Manchester UK",
      author: "rogersop",
      body: "Who are we kidding, there is STILL only one, and it's Mitch!",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          title: "Seven MORE inspirational thought leaders from Manchester UK",
          topic: "mitch",
          author: "rogersop",
          body: "Who are we kidding, there is STILL only one, and it's Mitch!",
          votes: 0,
          comment_count: 0,
          article_id: 14,
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
        });
        expect(article.created_at).toBeString();
      });
  });
  it("POST 400: when given article which is missing data for a not-null column", () => {
    const body = {
      title: "Seven MORE inspirational thought leaders from Manchester UK",
      topic: "mitch",
      body: "Who are we kidding, there is STILL only one, and it's Mitch!",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("POST 400: when given data in invalid data type (including foreign key data type. )", () => {
    const body = {
      title: "Seven MORE inspirational thought leaders from Manchester UK",
      topic: "mitch",
      author: 1,
      body: "Who are we kidding, there is STILL only one, and it's Mitch!",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("POST 201: when given URL string", () => {
    const body = {
      title: "Seven MORE inspirational thought leaders from Manchester UK",
      topic: "mitch",
      author: "rogersop",
      body: "Who are we kidding, there is STILL only one, and it's Mitch!",
      article_img_url: "https://http.dog/203.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          title: "Seven MORE inspirational thought leaders from Manchester UK",
          topic: "mitch",
          author: "rogersop",
          body: "Who are we kidding, there is STILL only one, and it's Mitch!",
          votes: 0,
          comment_count: 0,
          article_id: 14,
          article_img_url: "https://http.dog/203.jpg",
        });
        expect(article.created_at).toBeString();
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  it("GET 200: responds with all comments from a given article id.", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeArray();
        expect(comments.length).toBeGreaterThan(0);
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
      .then(({ body: { comments } }) => {
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
      votes: 10,
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
  });
  it("GET 200: displays correct number of responses given a limit", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=4")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(4);
      });
  });
  it("GET 200: displays correct responses when given page and limit queries", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=4&&p=2")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(4);
        expect(comments[0].comment_id).toBe(7);
      });
  });
  it("GET 200: displays correct responses when given page queries with no limit", () => {
    return request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(1);
        expect(comments[0].comment_id).toBe(9);
      });
  });
  it("GET 400: when given page in incorrect data type", () => {
    return request(app)
      .get("/api/articles/1/comments?p=not-a-number")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("bad request");
      });
  });
  it("GET 400: when given limit in incorrect data type", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=not-a-number")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("bad request");
      });
  });
  it("GET 404: when returning a page which has no comments left to display", () => {
    return request(app)
      .get("/api/articles/3/comments?p=2")
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("No more comments to display");
      });
  });
});

describe("/api/comments/:comment_id", () => {
  it("DELETE 204: responds with correct status", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  it("DELETE 400: when given invalid data type for comment id", () => {
    return request(app)
      .delete("/api/comments/one")
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("DELETE 404: when given valid id data type but which doesn't exist yet", () => {
    return request(app)
      .delete("/api/comments/19")
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toBe("comment does not exist");
      });
  });
  it("PATCH 200: responds with updated comment with votes amended.", () => {
    const body = { inc_votes: -4 };
    return request(app)
      .patch("/api/comments/1")
      .send(body)
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 12,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
          comment_id: 1,
        });
      });
  });
  it("PATCH 400: when request is in incorrect format.", () => {
    const testBody1 = { notAKey: 1 };
    const firstTest = request(app)
      .patch("/api/comments/1")
      .send(testBody1)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });

    const testBody2 = { author: 1 };
    const secondTest = request(app)
      .patch("/api/comments/1")
      .send(testBody2)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });

    const testBody3 = { inc_votes: "string" };
    const thirdTest = request(app)
      .patch("/api/comments/1")
      .send(testBody3)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });

    return Promise.all([firstTest, secondTest, thirdTest]);
  });
  it("PATCH 400: when given invalid ID", () => {
    const body = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/not-an-id")
      .send(body)
      .expect(400)
      .then(({ body: { message } }) => {
        expect(message).toBe("bad request");
      });
  });
  it("PATCH 404: when given valid ID but which which doesn't exist", () => {
    const body = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/19")
      .send(body)
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toBe("comment not found");
      });
  });
  it("405: for invalid method e.g GET", () => {
    //invalid array of types, square brackets (instead of Get)
    //then loop over and use bracket notation to do the get request.
    //promise all and then wait for them all to resolve.
    //add the .all to the rest of the endpoints. But write this first.
    return request(app)
      .get("/api/comments/:comment_id")
      .expect(405)
      .then(({ body: { message } }) => {
        expect(message).toBe(
          "GET: for /api/comments/:comment_id is not supported"
        );
      });
  });
});

describe("/api/users", () => {
  it("GET 200: responds with all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user.username).toBeString();
          expect(user.name).toBeString();
          expect(user.avatar_url).toBeString();
        });
      });
  });
});

describe("/api/users/:username", () => {
  it("GET 200: responds with user", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  it("GET 404: when given username which does not exist", () => {
    return request(app)
      .get("/api/users/does-not-exist")
      .expect(404)
      .then(({ body: { message } }) => {
        expect(message).toBe("user not found");
      });
  });
});
