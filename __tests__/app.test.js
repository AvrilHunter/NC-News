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

afterAll(() => {
  db.end();
});

beforeEach(() => {
  return seed({ topicData, userData, articleData, commentData });
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
        const {  message } = body
        expect(message).toBe("bad request")
    })
  })
  it("GET 404: when given an id in a valid format which doesn't exist", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        const { message } = body
        expect(message).toBe("not found")
    })
  })
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
