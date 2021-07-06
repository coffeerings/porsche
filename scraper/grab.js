const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const url = require('url');
const { JSDOM } = jsdom;

function fetch(page){
  got(page).then(response => {
    const model = url.parse(page, true).query.M;

    const dom = new JSDOM(response.body);
    dom.window.document.querySelectorAll('#search-results .result-contain').forEach(ad => {
      if((cardom = ad.querySelector('.listing-utils div')) !== null){
        
        title = ad.querySelector('.listing-headline h3').innerHTML;
        year = title.substr(title.length - 6).replace("(","").replace(")","");
        details = ad.querySelectorAll(('.listing-info .specs li'))
        
        car = {
          ref: cardom.id,
          title: title,
          year: year.toString(),
          link: ad.querySelector('.listing-headline a').href,
          price: parseInt(ad.querySelector('.listing-headline .price span').innerHTML.replace("£","").replace(",","").toString()),
          miles: parseInt(details[0].textContent.replace(",","").replace("miles","").replaceAll("\n","").replaceAll(" ","").toString()),
          location: ad.querySelector('.listing-dealer .location').textContent.replaceAll("\n","").replaceAll(" ",""),
          dealer: ad.querySelector('.listing-dealer a').href,
          model: model,
          source: 'pistonheads'
        };

        console.log(car)
      };   
    });
  }).catch(err => {
      console.log(err);
  });
}

const pages = require("./pages.json");

(async function loop() {
  for (let i = 0; i < pages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));
    fetch(pages[i]);
  }
})();