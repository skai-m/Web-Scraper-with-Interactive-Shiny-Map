# Job Scraper with Interactive Shiny Map

Updated: 2022-06-02 09:55:57 Thursday

## Description

### About This Project
This project is composed of two main parts: The first is a simple web scraper executed from the command line that extracts jobs data directly from **Indeed.com** using server-side scripting with nodeJS. The data from this web scraper is then shared with the interactive Shiny Map to build a reactive web application displaying the locations, salary information, and other details (along with some filters) of jobs taken from Indeed.

#### Goals
The intent of this project was to learn how to scrape the web for data. This data could then be used for anything from data analysis to database development. I chose to make a map in R, but the concept can be broadened to suit many different purposes.

#### Limitations
The web scraper itself is not particularly robust, however it may be refitted to work with similar websites with only slight modifications.

**Note: Because many websites limit the amount of requests that can be processed within a certain time frame from a particular IP address, this script cannot run very long. I have tried tweaking constants to test these limits. However, due to design, the limit appears to be around ~200 pages or so. For more details on this limitation, please see the comments in `scrape.js`*.

---

**Disclaimer:** "This product includes data created by **MaxMind**, available from http://www.maxmind.com/" in the form of zip code data (used to plot locations on the Shiny map)

---

## Installation

### Requirements

Should you wish to **run** the code for this project, you must first install the following dependencies:

#### 1. Node and NPM
**NPM** is a package manager that will allow you to easily install **node**, **axios**, and **cheerio** which are required to execute `scrape.js`. **For detailed instructions on installing node and NPM for your operating system, please see the documentation on [this](http://docs.npmjs.com/downloading-and-installing-node-js-and-npm "this") webpage.*

#### 2. Cheerio and Axios
[Cheerio](https://cheerio.js.org/ "Cheerio") is a popular node framework used to parse and traverse web html. [Axios](https://medium.com/@MinimalGhost/what-is-axios-js-and-why-should-i-care-7eb72b111dc0 "Axios") is a javascript library used to make HTTP requests within node. To run scrape.js, we will need to install both. To install Cheerio and Axios with NPM, run the following command in the terminal:

`npm install cheerio axios`

#### 3. R

To execute the code for the Shiny App, you must already have the **R programming language** installed on your machine. You can download the R language directly from r-project.org or [here](http://cran.rstudio.com/ "here").

You must also have an environment capable of executing R code. I use **RStudio Desktop** found [here](https://www.rstudio.com/products/rstudio/download/ "here"), but you can also use RStudio Cloud, Visual Studio Code, the R Console, or another IDE of your choice so long as it supports the R language.

#### 4. Leaflet and Shiny

The main packages required to implement the Shiny map are Leaflet (a library for making interactive maps directly in R) and Shiny (a library for building dynamically reactive web applications with support for html and bootstrap).

To install Leaflet, run the below code within your R session:

`install.packages("leaflet")`

Do the same to install Shiny:

`install.packages("shiny")`

#### 5. Additional Packages

The following is a list of R packages used for light data cleaning and tranformation within the R script. They are **not required to build Shiny apps**. However, because I use them in my project, they are **required** to run my code "out-of-the-box" without errors.

- tidyverse
- cleanr
- janitor
- skimr
- scales

## Final Notes

This project is still considered a "work in progress." Although I have no immediate plans to make changes or bug fixes at this time, this may change in the future and I will update the documentation and comments accordingly. In the meantime, thanks for checking out this project, and happy coding!
