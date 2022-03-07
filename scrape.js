/**
 * Author: Safiyyah Muhammad
 * Last Updated: 03/07/2022
 * CSCI:290 | Final Project
 * Indeed Job Search Results Web Scraper
 */
// set up environment variables

const axios = require("axios");
const cheerio = require("cheerio")

// base URL -> "https://www.indeed.com/jobs?";

var URL = "https://www.indeed.com/jobs?q&l=California"

// q = "what"
// l = "where%20where%2Cstate"
// vjk - ??? (some kind of search criteria/ not sure what yet)
// separated with %20 or %2C
// Example = /jobs?...q&l=New%20York&radius=0&vjk=f92c84c9fbcc2da3

const cities = [];

var i = "";
// begin function
do {

} while(i < 5)
// get the data from the web
const jobScrape = async() => {
    try {
        const response = await
        axios.get(URL);
        const html = response.data;

        const $ = cheerio.load(html);

        // initialize Job class
        class Job  {
            constructor(title, company, city, state, zip, pay) {
                this.jobTitle = title;
                this.jobCompany = company;
                this.city = city;
                this.state = state;
                this.zip = zip;
                this.payRange = pay;
            }
        }

        // initialize jobs array
        const jobs = [];

        // get number of pages

        const resultString = $("div > div#searchCountPages").text().trim();
        // resultsString = "Page 1 of n jobs"
        numPages = getPages(resultString);
        console.log("numPages = " + numPages);
       

        $("h2 > div").remove();

        $("div > table > tbody > tr > td.resultContent").each((_idx, el) => {
            let title = $(el).find("h2").text();
            let company = $(el).find("div > span.companyName").text();
            let location = $(el).find("div.companyLocation").text();
            let pay = $(el).find("div.metadata\.salary-snippet-container > div.attribute_snippet").text();

            let index = location.indexOf("+");
            if(index != -1) {
                location = location.substring(0, index)
            }

            let regex = [/\w+\s?\w*/, /[A-Z][A-Z]/, /\d{5}/];

            let city = location.match(regex[0]); 
            if(city) {
                city = city[0];
            }

            // removes the city field from jobs specified as "Remote"
            if(city == "Remote" | "Remote in") {
                city = "";
            }
            
            let state = location.match(regex[1]);
            if(state) {
                state = state[0];
            } 
            
            let zip = location.match(regex[2]);
            if(zip) {
                zip = zip[0];
            }

            //localJob = new Job(title, company, city, state, zip, pay);
            
            jobs.push(new Job(title, company, city, state, zip, pay));
        });

        return jobs;
    } catch(error) {
        throw error;
    }
};

function getPages(str) {
    const n = 15;
    let splitResults = str.split(" ")[3];
    return  Math.ceil((parseInt(splitResults.replace(",", "")) / n));
}

// function for exporting objects as JSON

jobScrape().then((jobs) => console.log("Done"));
// jobScrape().then((jobs) => console.log(jobs));
// jobScrape().then((jobs) => console.log(JSON.stringify(jobs)));
