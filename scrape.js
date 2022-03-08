//###########################################################################################################
/**
 * Author: Safiyyah Muhammad
 * Last Updated: 03/08/2022
 * CSCI:290 | Final Project
 * Indeed Job Search Results Web Scraper
 */
//###########################################################################################################


// set up axios & cheerio
const axios = require("axios");
const cheerio = require("cheerio")

// base URL -> "https://www.indeed.com/jobs?";
const getURL = "https://www.indeed.com/jobs?q&l=California"
var start = "";
var URL = getURL + start;

// q = "what"
// l = "where%20where%2Cstate"
// vjk - ??? (some kind of search criteria/ not sure what yet)
// separated with %20 or %2C
// Example = /jobs?...q&l=New%20York&radius=0&vjk=f92c84c9fbcc2da3

// Optional: create a predefined array of cities to search within
// const cities = [];

class Job  {
    constructor(title, company, city, state, zip, payLow, payHigh, payType) {
        this.jobTitle = title;
        this.jobCompany = company;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.payLow = payLow;
        this.payHigh = payHigh;
        this.payType = payType;
    }
}
// jobs will store an array of Jobs objects and be returned by jobScrape()
const jobs = [];
// resultString will store the number of total job results
const resultString = "";
// i will intialize the dowhile loop
var i = 0;
// n is the number of pages to be returned
var n = 5;
// begin function
const jobScrape = async() => {
    try {
        do {
            // get the data from the web
            const response = await
            axios.get(URL);
            const html = response.data;

            const $ = cheerio.load(html);

            // Gets the number of job results (total) and estimates the total number of pages
            // Un-comment this if you want to scrape every page of job results, but use **caution**.

            /** 
             * if(i == 0) {
             *  resultString = $("div > div#searchCountPages").text().trim();
             *  resultsString = "Page 1 of n jobs"
             *  numPages = getPages(resultString);
             *  n = numPages;
             * }
            */ 

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

                title = title.split("-")[0].trim()
                while(title.search(",") != -1) {
                    title = title.replace(",", "");
                }

                let regex = [/\w+\s?\w*/, /[A-Z][A-Z]/, /\d{5}/];

                let city = location.match(regex[0]); 
                if(city) {
                    city = city[0];
                } else {
                    city = "null";
                }

                while(company.search(",") != -1) {
                    company = company.replace(",", "");
                }
                
                let state = location.match(regex[1]);
                if(state) {
                    state = state[0];
                } else {
                    state = "null";
                }
                
                let zip = location.match(regex[2]);
                if(zip) {
                    zip = zip[0];
                } else {
                    zip = "null";
                }

                if(!pay) {
                    payLow = 0;
                    payHigh = 0;
                    payType = "null";
                } else {
                    let payArray = pay.split(" ");
                    for(payIndex in payArray) {
                        payArray[payIndex] = payArray[payIndex].replace("$", "");
                        payArray[payIndex] = payArray[payIndex].replace(",", "");
                    };
                    if(payArray.length == 5) {
                    payLow = payArray[0];
                    payHigh = payArray[2];
                    payType = payArray[4];
                    } else {
                    payLow = payArray[0];
                    payHigh = payArray[0];
                    payType = payArray[2];
                    };
                }
                
                jobs.push(new Job(title, company, city, state, zip, payLow, payHigh, payType));
            });
            i++;
            start = "&start=" + i + "0";
            URL = getURL + start;
        } while(i < n);
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

function toStringCsv(arr) {
    const objArray = arr;

    const csvString = [
        [
            "title",
            "company",
            "city",
            "state",
            "zipcode",
            "payLow",
            "payHigh",
            "payType"
        ],
        ...objArray.map(job => [
            job.jobTitle,
            job.jobCompany,
            job.city,
            job.state,
            job.zip,
            job.payLow,
            job.payHigh,
            job.payType
         ])
        ]
        .map(e => e.join(","))
        .join("\n");

        console.log(csvString);
}

// jobScrape().then((jobs) => console.log(jobs));
// jobScrape().then((jobs) => console.log(JSON.stringify(jobs)));
   jobScrape().then((jobs) => toStringCsv(jobs));
