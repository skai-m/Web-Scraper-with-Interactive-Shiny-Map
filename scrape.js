/**
 * Author: Safiyyah Muhammad
 * Last Updated: 02/21/2022
 * CSCI:290 | Final Project
 * Indeed Job Search Results Web Scraper
 */
// set up environment variables

const axios = require("axios");
const cheerio = require("cheerio")

// var URL = "https://www.indeed.com/jobs?";

var URL = "https://www.indeed.com/jobs?q&l=California"

// q = "what"
// l = "where%20where%2Cstate"
// vjk - ??? (some kind of search criteria/ not sure what yet)
// separated with %20 or %2C
// Example = /jobs?...q&l=New%20York&radius=0&vjk=f92c84c9fbcc2da3

const cities = [];

// begin function

// ideally, I want to create objects with:
// job title
// city, state
// company name
// salary range
// description

// get the data from the web
const jobScrape = async() => {
    try {
        const response = await
        axios.get(URL);
        const html = response.data;

        const $ = cheerio.load(html);

        // initialize Job class
        class Job  {
            constructor(title, company, location, pay) {
                this.jobTitle = title;
                this.jobCompany = company;
                this.location = location;
                this.payRange = pay;
            }
        }

        // initialize jobs array
        const jobs = [];

        $("h2 > div").remove();

        $("div > table > tbody").each((_idx, el) => {
            console.log($(el).find("h2").text());
            const title = $("h2").text();
            const company = $("div > span.companyName").text();
            const location = $("div.companyLocation").text();
            const pay = $("div.metadata salary-snippet-container > div.attribute_snippet").text();

            localJob = new Job(title, company, location, pay);
            
            jobs.push(localJob);
        });

        return jobs;
    } catch(error) {
        throw error;
    }
};

// function for exporting objects as JSON

jobScrape().then((jobs) => console.log("done"));
