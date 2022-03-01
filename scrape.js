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

var URL = "https://www.indeed.com/jobs?l=New%20York%2C%20NY&radius=0"

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

const jobScrape = async() => {
    try {
        const response = await
        axios.get(URL);
        const html = response.data;

        const $ = cheerio.load(html);

        const jobTitles = [];

        $("div > h2 > span").each((_idx, el) => {
            const title = $(el).prop("title");
            jobTitles.push(title)
        });

        return jobTitles;
    } catch(error) {
        throw error;
    }
};

// function for exporting objects as JSON

jobScrape().then((jobTitles) => console.log(jobTitles));