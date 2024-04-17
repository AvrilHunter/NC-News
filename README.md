# Northcoders News API

Welcome to Northcoders News API containing articles with comments and votes on a variety of topics!


## About The Project

### Hosted REST api server available at - https://nc-news-z2fk.onrender.com/

___

### Built With

* Javascript 
* PQSL
* HTTP/Express Server
* Supertest & Jest for full integration testing

## Getting Started

In order to set up a local copy and get it up and running, please follow these simple steps. 

### Repro
Repro can be found here:- https://github.com/AvrilHunter/NC-News


### Installation and Set Up

1. Clone the repo
   ```sh
   git clone https://github.com/AvrilHunter/NC-News
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create two files: .env.test, .env.development and .env.production

4. Update these files:-
    ```sh
     PGDATABASE="insert database name / url link here" 
    ```
5. Database names and URL can be requested via email from avrilhunter15@gmail.com

6. Seed your local database through running the command  
    ```sh
    seed-prod
    ``` 
7. Tests can be run using the command 
    ```sh
    npm run test
    ```


## System Requirements
Node minimum version = 10.5.2
Postgres minimum version = 14.11



## Usage


The project is a REST API with functionality to search and amend articles as well as the functionality to post comments. 

- Like something - you can add a vote to the article!

- Have an opinion - feel free to post a comment! 

- Join in the conversation now.






