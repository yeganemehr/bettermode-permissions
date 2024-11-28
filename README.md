# Permission System Implementation

This project is a backend application for [Bettermode](https://bettermode.bamboohr.com/careers/30), implementing a permission system for managing tweet visibility and editability.

Built using [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/) and GraphQL, the system handles hierarchical relationships and efficient querying for large-scale databases.


For the database, I chose MySQL/MariaDB as the RDBMS because it fits the project’s needs and is easy to manage and scale both vertically and horizontally.
I leveraged modern features of these RDBMSes (MySQL 8+ or MariaDB 10.5+) for high performance.


## Design Evolution

When i first started designing the permission system, the idea was simple: make permissions dynamic and flexible, so every tweet could decide who gets to view or edit it.

The initial approach was straightforward.   
I created a table design which each tweet could inherit permissions from its parent.   
- If a tweet had "DEFAULT" permissions, we'd recursively climb up the chain of ancestors until we found a permission rule.
- For tweets with "CUSTOM" permissions, we had a separate table to specify exactly who could view or edit the content—either individual users or groups.

To implement this, i leaned on recursive CTE.   
These were perfect for handling the hierarchical structure of tweets.   
With a single query, we could traverse the ancestor tree and check permissions.

Running the recursive query on a small dataset worked smoothly but after EXPLAIN-ing and ANALYZE-ing my sql query i notice that Mariadb/MySQL building temporary tables for the recursive CTE.   
For checking permissions of each tweet RDMS put all of accessed tweets into this tables and with a big dataset this can make huge performance issues.


-------

**the denormalized permissions approach**:

Instead of relying on recursive queries, i decided to store permissions directly in the Tweet table.   
If a tweet inherited its parent's permissions, we simply copy the permission ID into the child's row.

> No more climbing up the tree or relying on expensive recursive queries.

To make this work, i introduced a couple of new tables:

1. **Custom Permissions** Table: This table held detailed permission rules, like who could edit a tweet. It uses JSON to list specific users and groups.

2. **Custom Permission Viewer** Table: This one was dedicated to view permissions, linking tweets to specific users or groups who had access.

I realized this approach wouldn’t scale for large databases.

With this new structure, the system could instantly determine a user's access to a tweet by looking up the pre-stored permission IDs.

The best part is If a parent tweet's permissions changed, all its replies would automatically stay in sync, because they simply referenced the same permission ID.

**Trade-off** was that it required a bit more upfront work during writes (like ensuring permissions cascaded properly when creating replies), but it was worth it. 
Reads, which happen far more often than writes in most systems, became very very much faster.

------

**Timeline optimization:**

Additionally, to optimize the process of loading a user's timeline, I created a new GraphQL query called `timeline`.   
This query was specifically designed to load a user's timeline with optimized conditions for tweet retrieval.   
The main challenge was ensuring that the timeline query was efficient and did not return duplicate tweets while considering the complex relationships between tweets, users, and permissions.

Here are the conditions I set for the timeline:

1. If the user has posted a tweet and it's a reply with a level < 2, it will appear in their timeline.

2. Non-reply tweets that the current user has access to (based on the permission system) will show up in the timeline.

3. Only reply tweets (with a level < 2) from the user's friends, and with the correct permissions, will show up in the timeline.

4. The system tracks the user's timeline refreshes and ensures that only new or older tweets are returned, avoiding duplicates. This is done by using an input named `TimelineRefreshInput`.

By keeping the logic clear and optimized, the system ensures that users get a personalized, fast-loading timeline, while minimizing unnecessary data and keeping the database queries efficient.


## Setup and Deployment

### Installation

Clone the repository:

```
git clone https://github.com/yeganemehr/bettermode-permissions.git
cd bettermode-permissions
```

Install dependencies:

```bash
npm install
```

Set up environment variables in a `.env` file:

```env
# MYSQL_HOST=localhost
# MYSQL_PORT=3306
MYSQL_USER=bettermode
MYSQL_PASSWORD=your-very-secret-password
MYSQL_DB=bettermode-permissions
```

Initial the database schema:

```bash
npm run typeorm:migrate
```

Start the server:

```bash
npm run start
```

open the GraphiQL:

```
http://localhost:3000/graphiql
```
