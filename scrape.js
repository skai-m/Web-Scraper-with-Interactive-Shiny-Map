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
const cheerio = require("cheerio");
const { toString } = require("cheerio/lib/api/manipulation");
const { ElementType } = require("htmlparser2");

// Optional: create a predefined array of cities to search within and industries to search for:
const what = ["data science", "web development", "human resources", "customer service", "clerical", "manufacturing"];
const where = ["United%20States"];
// const cities = [];

const baseURL = "https://www.indeed.com/jobs?";
var getURL = "";
var start = "";
var URL = setCurrentURL(what, 0);

// q = "what"
// l = "where%20where%2Cstate"
// vjk - ??? (some kind of search criteria/ not sure what yet)
// separated with %20 or %2C
// Example = /jobs?...q&l=New%20York&radius=0&vjk=f92c84c9fbcc2da3

class Job  {
    constructor(title, industry, company, city, state, zip, payLow, payHigh, payType, desc) {
        this.jobTitle = title;
        this.industry = industry;
        this.jobCompany = company;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.payLow = payLow;
        this.payHigh = payHigh;
        this.payType = payType;
        this.desc = desc;
    }
}
// jobs will store an array of Jobs objects and be returned by jobScrape()
const jobs = [];
// resultString will store the number of total job results
// resultsString will load the value fom Indeed: "Page 1 of n jobs"
const resultString = "";
// i will intialize the dowhile loop
var i = 0;
// n is the number of pages to be returned
var n = 1;
// begin function
const jobScrape = async() => {
    try {
        for(industry in what) {
            getURL = setCurrentURL(what, industry);
            let thisIndustry = what[industry];
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
                 *  numPages = getPages(resultString);
                 *  n = numPages;
                 * }
                */ 
    
                $("h2 > div").remove();
    
                $("div.slider_list > div.slider_item").each((_idx, el) => {
                    let title = $(el).find("h2").text();
                    let company = $(el).find("div > span.companyName").text();
                    let location = $(el).find("div.companyLocation").text();
                    let pay = $(el).find("div.metadata\.salary-snippet-container > div.attribute_snippet").text();
                    let desc = $(el).find("div.job-snippet > ul > li").text();
    
                    let index = location.indexOf("+");
                    if(index != -1) {
                        location = location.substring(0, index)
                    }
    
                    title = title.trim();
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
                            if(payArray[0] == "Up") {
                                payLow = 0;
                                payHigh = payArray[2];
                                payType = payArray[4];
                            } else {
                                payLow = payArray[0];
                                payHigh = payArray[2];
                                payType = payArray[4];
                            }
                        } else {
                        payLow = payArray[0];
                        payHigh = payArray[0];
                        payType = payArray[2];
                        };
                    }
                    if(!desc) {
                        desc = "null";
                    } else {
                        desc = desc.trim();
                        while(desc.search(",") != -1) {
                            desc = desc.replace(",", "");
                        }
                        while(desc.search("\u201C") != -1) {
                            desc = desc.replace("\u201C", "");
                            desc = desc.replace("\u201D", "");
                        }
                        while(desc.search("\u2424") != -1) {
                            desc = desc.replace("\u2424", " ");
                        }
                    }
                    jobs.push(new Job(title, thisIndustry, company, city, state, zip, payLow, payHigh, payType, desc));
                });
                i++;
                start = "&start=" + i + "0";
                URL = getURL + start;
            } while(i < n);
        }    
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

function setCurrentURL(array, index) {
    let newURL = baseURL + "q=";
        let whatArray = array[index].split(" ");
        let length = whatArray.length;
        let i = 1;
        whatArray.forEach(word => {
            newURL += word;
            if(length - i > 0) {
              newURL += "%20";
            } 
            i++;
        });
        return newURL + "&l=" + where[0];
}

function toStringCsv(arr) {
    const objArray = arr;

    const csvString = [
        [
            "title",
            "industry",
            "company",
            "city",
            "state",
            "zipcode",
            "payLow",
            "payHigh",
            "payType",
            "description"
        ],
        ...objArray.map(job => [
            job.jobTitle,
            job.industry,
            job.jobCompany,
            job.city,
            job.state,
            job.zip,
            job.payLow,
            job.payHigh,
            job.payType,
            job.desc
         ])
        ]
        .map(e => e.join(","))
        .join("\n");

        console.log(csvString);
}

   jobScrape().then((jobs) => toStringCsv(jobs));
