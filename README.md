# porsche
Grab 911 prices from Pistonheads, pop into mysql DB for profiling over time.

Simple node script to grab the data from urls defined in an array. Load of probs with this inc. potential to spam PH webservers, opening too many connections to your own db + a million other things so use at your own risk.  Bang a cron job on the script to fetch the data on whatever schedule makes sense but be respectful to the PH webservices.

Basic PHP front end to generate some pretty graphs and tables.

## Setup
1. Grab the node modules by running npm install in the scraper folder
2. Create a db with the schema in scraper/db_schema.sql
3. In the scrapper folder rename a config.sample.js to config.js popping in your own details.
4. Setup a cron on the scraper/grab.js script.