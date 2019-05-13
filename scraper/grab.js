var jsdom = require('jsdom'), 
    mysql = require('mysql'),
    config = require('./config'),
    fs = require("fs");

var jquery = fs.readFileSync(__dirname + "/node_modules/jquery/dist/jquery.min.js", "utf-8");

function getQueryParams(qs) {
    qs = qs.split("+").join(" ");
    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
}

function get_cars(url, callback){
    console.log("Fetching: " + url);
    
    var query_param = getQueryParams(url);
    var callback = callback;
    
    jsdom.env({
        url: url,
        src: [jquery],
        done: function(err, window){
            var $ = window.$;
            var cars = [];

            if(query_param.hasOwnProperty("M")){
                source = "pistonheads";
                model = query_param.M;

                if($("#search-results .result-contain").length){
                    $("#search-results .result-contain").each(function( index ) {
                        if(typeof $(this).find('.listing-utils div').attr('id') !== "undefined"){
                            title = $(this).find('.listing-headline h3').text();
                            year = title.substr(title.length - 6).replace("(","").replace(")","");

                            car = {
                                ref: $(this).find('.listing-utils div').attr('id').toString(),
                                title: title,
                                year: year.toString(),
                                link: $(this).find('.listing-headline a').attr('href'),
                                price: parseInt($(this).find('.listing-headline .price span').text().replace("£","").replace(",","")).toString(),
                                miles: parseInt($.trim($(this).find('.listing-info .specs li:eq(0)').text()).replace(",","")).toString(),
                                location: $.trim($(this).find('.listing-dealer .location').text()),
                                dealer: $.trim($(this).find('.listing-dealer .name').text()),
                                source : source,
                                model : model
                            };
                            cars.push(car);
                        }
                    });
                    callback(cars, url);
                }
            }
        }
    });
}

function insert_cars(cars, url){
    console.log("Inserting: " + cars.length + " cars against the url: " + url);

    var cars = cars;

    var pool  = mysql.createPool({
        connectionLimit : 50,
        connectTimeout  : 60 * 60 * 1000,
        aquireTimeout   : 60 * 60 * 1000,
        timeout         : 60 * 60 * 1000,
        waitForConnections : true,
        user     : config.mysql.user,
        password : config.mysql.password,
        database : config.mysql.database,
        socketPath : config.mysql.socketPath
    });

    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.beginTransaction(function(err) {
            if (err) throw err;
            for(i = 0; i < cars.length; i++) {
                connection.query('INSERT INTO cars SET ?', cars[i], function(err, result) {
                    if(err){
                        return connection.rollback(function() {
                            throw error;
                        });
                        return;
                    }
                });
                console.log("Inserted: " + cars[i].ref + ": " + cars[i].title + " - " + cars[i].price);
            }
            connection.commit(function(err) {
                if (err) {
                  return connection.rollback(function() {
                    throw err;
                  });
                }
                console.log('success!');
            });
        });
    });
}

// Porsche 997/991 models with most variants. M3, R8, RS4 and GTR also added 
var urls = [
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=2898&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=2898&Page=2&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=525&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=525&Page=2&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=249&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=249&Page=2&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=249&Page=3&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=222&M=1161&M=1311&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=222&M=1161&M=1311&Page=2&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=222&M=1161&M=1311&Page=3&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=301&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=301&Page=2&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=315&M=321&M=1036&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=315&M=321&M=1036&Page=2&ResultsPerPage=100',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=1047&Page=1&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=1047&Page=2&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=506&Page=1&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=506&Page=2&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=506&Page=3&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=506&Page=4&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=506&Page=5&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=506&Page=6&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=1049&Page=1&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=1048&Page=1&ResultsPerPage=100&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=1400&Page=1&ResultsPerPage=100&SortOptions=ModifiedDate&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=1400&Page=2&ResultsPerPage=100&SortOptions=ModifiedDate&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=1400&Page=3&ResultsPerPage=100&SortOptions=ModifiedDate&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=1400&Page=4&ResultsPerPage=100&SortOptions=ModifiedDate&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=2502&Page=1&ResultsPerPage=100&SortOptions=ModifiedDate&isExperiment=True',
    'http://www.pistonheads.com/classifieds?Category=used-cars&M=2501&Page=1&ResultsPerPage=100&SortOptions=ModifiedDate&isExperiment=True',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=234&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=234&Page=2&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=1162&ResultsPerPage=100',
    'https://www.pistonheads.com/classifieds?Category=used-cars&M=1162&ResultsPerPage=100'
 ];

// loop through urls with a 30 sec break between each call to scrape the site
for(i = 0; i < urls.length; i++) { 
    (function(i){
        setTimeout(function(){
            get_cars(urls[i], insert_cars);
        }, 30000 * i);
    }(i));
}