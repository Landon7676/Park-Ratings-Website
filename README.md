# Park Review Fullstack App


Simple park review website built with Node (Express), MySQL and a static frontend (HTML/CSS/JS).


## Features
- List parks
- Add a park
- View park details and reviews
- Add reviews to a park
- Simple REST API


## Requirements
- Node 16+
- MySQL server


## Setup
1. Clone files into a folder.
2. Create a MySQL database and import `schema.sql`:
```sql
CREATE DATABASE park_reviews;
USE park_reviews;
-- Then run the contents of schema.sql