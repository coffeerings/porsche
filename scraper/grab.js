const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const url = require('url');
const mysql = require('mysql2');
const { JSDOM } = jsdom;

const pages = require("./config.pages.json");

var con = mysql.createConnection({
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOSTNAME
});

function fetch(page){
  got(page).then(response => {
    const model = url.parse(page, true).query.M;
    const dom = new JSDOM(response.body);
    const cars = [];
    
    dom.window.document.querySelectorAll('#search-results .result-contain').forEach(ad => {
      if((cardom = ad.querySelector('.listing-utils div')) !== null){
        
        title = ad.querySelector('.listing-headline h3').innerHTML;
        year = title.substr(title.length - 6).replace("(","").replace(")","");
        details = ad.querySelectorAll(('.listing-info .specs li'))
        
        car = [
          cardom.id,
          title,
          year.toString(),
          ad.querySelector('.listing-headline a').href,
          parseInt(ad.querySelector('.listing-headline .price span').innerHTML.replace("£","").replace(",","").toString()),
          parseInt(details[0].textContent.replace(",","").replace("miles","").replaceAll("\n","").replaceAll(" ","").toString()),
          ad.querySelector('.listing-dealer .location').textContent.replaceAll("\n","").replaceAll(" ",""),
          ad.querySelector('.listing-dealer a').href,
          model,
          'pistonheads'
        ];

        console.log(car)
        cars.push(car);
      };   
    });

    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
      let sql = "INSERT INTO cars (ref, title, year, link, price, miles, location, dealer, model, source) VALUES ?";

      con.query(sql, [cars], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
    });
  }).catch(err => {
      console.log(err);
  });
}

function job(jobId){
  console.log("Running job: " + jobId);
  (async function loop() {
    for (let i = 0; i < pages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
      console.log("Fetching Page: " + i + ", jobId: " + jobId + ", " + pages[i]);
      fetch(pages[i]);
    }
  })();
}

(async function loop() {
  let i = 0;
  while (true) {
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (5000 - 3000 + 1000) + 8000)));
    job(i);
    i++;
  }
})();