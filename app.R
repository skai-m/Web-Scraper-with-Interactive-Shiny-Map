# Author: Safiyyah Muhammad
# Last Updated: 3/31/2022
# Name: "app.R"
# Description:
# R script to process and clean data from `jobs.csv` and prepare it for
# systematic visualization. This script will add additional fields to the 
# scraped data, as well as standardize data formats and remove nulls. Leaflet
# and Shiny packages will output the data to an html map.
#-------------------------------------------------------------------------------

# Load packages
# install.packages("cleanr")
# install.packages("janitor")

library(tidyverse)
library(cleanr)
library(janitor)
library(skimr)

# Load Shiny & leaflet packages
library(shiny)
library(shinyjs)
library(shinyWidgets)
library(leaflet)
library(maps)

#---Start-----------------------------------------------------------------------

#---Get Data----
input <- "jobs.csv"
jobs <- tibble(read.csv(input, na.strings = "null", skipNul = T))
more <- "more_jobs.csv"
jobs <- rbind(tibble(read.csv(more, na.strings = "null", skipNul = T)))
input2 <- "us_cities.csv"
us_cities <- tibble(read.csv(input2))

# Preview tibble
head(jobs)
skim_without_charts(jobs)

#---Clean----
#** Objectives:
#* 1. Standardize and clean variable names
#* 2. Check data types
#* 3. Data validation. Check data ranges
#* 4. Address NA's
#* 5. Remove duplicates (if any)
#* 6. Add lat/long
#**

# 1. Standardize and clean variable names and values(as needed)
jobs <- jobs %>% 
  clean_names() %>% 
  mutate(industry = str_to_title(industry)) %>% 
  mutate(title = str_to_title(title))
us_cities <- us_cities %>% 
  clean_names()

str(jobs)

# 2.
jobs <- jobs %>% 
  mutate(pay_low = as.numeric(pay_low)) %>% 
  mutate(pay_high = as.numeric(pay_high)) %>% 
  mutate(pay_type = na_if(pay_type, "a")) %>% 
  mutate(pay_type = na_if(pay_type, "an")) %>% 
  mutate(pay_type = as.factor(pay_type))

# Leading zeros were dropped when transforming data frame to tibble 
# (`zipcode` fields was forced to numeric) and must either
# be restored or removed. [***Working***]

# str_pad() pads the strings in `zipcode` with enough 0's to give each entry 5 
# characters
jobs <- jobs %>% 
  mutate(zipcode = str_pad(zipcode, 5, side = "left", pad = "0"))

# 4. NA's

# Remove records with NA in city OR state fields
jobs <- jobs %>% 
  filter(!(is.na(city) | (is.na(state))))

# Reassign NA's with values
jobs <- jobs %>% 
  mutate(description = replace(description, is.na(description), "None")) %>% 
  mutate(pay_type = replace(pay_type, is.na(pay_type),"year")) %>% 
  mutate(pay_high = replace(pay_high, is.na(pay_high), 0.00)) %>% 
  mutate(pay_low = replace(pay_low, is.na(pay_low), 0.00))


# 5. Check for duplicate entries (it's possible that one query could return the
# same object twice...)

anyDuplicated(jobs)

# 6. Add lat/long

jobs <- left_join(jobs, select(us_cities, accent_city, region, latitude, longitude),
        by = c("city" = "accent_city", "state" = "region")) %>% 
  filter(!is.na(latitude))

#--Transform---

# Add variable(s):
# "Salary"
# Using "1,801" to estimate the average amount of hours a typical American works 
# in a year

jobs <- jobs %>% 
  mutate(salary = case_when(pay_type == "hour" ~ (pay_low + pay_high) / 2 * 1801,
                            pay_type == "week" ~ (pay_low + pay_high) / 2 * 52,
                            pay_type == "year" ~ (pay_low + pay_high) / 2,
                            pay_type == "day" ~ 0)
         )
  

#---Shiny & Leaflet-------------------------------------------------------------

# Initialize Map coordinates
data <- jobs %>% 
  filter(!is.na(salary))

data2 <- jobs %>% 
  filter(!is.na(salary))

data2 <- data2 %>% 
  mutate(label = paste(sep = "<br>", paste("<b>", title, "</b>"), company, paste(sep = "", "$", salary)))

getColor <- function(data) {
  sapply(data$salary, function(salary) {
    if(salary >= 70000) {
     "blue"
    } else if(salary >= 55000) {
      "green"
    } else if(salary >= 40000) {
      "orange"
    } else if(salary >= 30000) {
      "orange"
    } else if(salary == 0) {
      "gray"
    } else {
      "red"
    } })
}

icons <- awesomeIcons(
  icon = "user",
  iconColor = rgb(1,1,1),
  library = "fa",
  markerColor = getColor(data)
)

# Adds colored markers based on `salary`
dataMap <- leaflet(data) %>% 
  addAwesomeMarkers(icon = icons, label = ~salary) %>% 
  addTiles()

dataMap <- leaflet(data2) %>% 
  addTiles() %>% 
  addCircleMarkers(color = "white", 
                   fillColor = "blue", 
                   radius = 5,
                   weight = 2,
                   fillOpacity = 0.6,
                   popup = ~label,
                   popupOptions = popupOptions(closeButton = FALSE),
                   clusterOptions = markerClusterOptions(showCoverageOnHover = FALSE))
  dataMap

# Shiny  
ui <- fluidPage(
  titlePanel("Title", windowTitle = "Title Here"),
  fluidRow(
    sidebarLayout(
      mainPanel(
        tabsetPanel(
          tabPanel("Map", leafletOutput("map1")),
          tabPanel("Data", "content")
        ), width = 9
      ),
      sidebarPanel(shinyjs::useShinyjs(),
                  id = "side-panel",
                  "Filter",
                   selectInput(
                     inputId = "query", 
                     label = "Query",
                     c("--All--" = "", sort(unique(data$industry))),
                   ),
                   selectInput(
                     inputId = "state", 
                     label = "State",
                     c("--All--" = "", sort(unique(data$state)))
                     ),
                   selectInput(
                     inputId = "salary", 
                     label = "Annual Salary",
                     c("--All--" = "", "$0 to $34,999", "$35,000 to $64,999", "$65,000 to $94,999", "Above $94,999")
                   ),
                   actionButton(
                     inputId = "update",
                     label = "Update"
                     ),
                   actionButton(
                     inputId = "reset",
                     label = "Reset"
                   ), width = 3
                   )
      
    )
  )
)

#**
#* # Draw UI elements:
#* Query Term drop down box
#* filter criteria : 1. city, state, pay, limit n
#* zoom, pan tools
#* "Update" button; observeEvent()
  

server <- function(input, output) {
  dataQuery <- reactive({
    input$query
  })
  
  dataState <- reactive({
    input$state
  })
  
  dataSalary <- reactive({
    input$salary
  })

  data <- eventReactive(input$update, {
    if(input$query != "" & input$state != "") {
      jobs %>% 
        filter(industry == dataQuery()) %>% 
        filter(state == dataState())
    } else if(input$query != "" & input$state == "") {
      jobs %>% 
        filter(industry == dataQuery())
    } else if(input$query == "" & input$state != "") {
      jobs %>% 
        filter(state == dataState())
    } else {
      jobs
    }
    
  }, ignoreNULL = FALSE, ignoreInit = FALSE)
  
  # Does not update until `update` is clicked
  observeEvent(input$reset, {
    shinyjs::reset("side-panel")
  })
  
    output$map1 = renderLeaflet(
      leaflet(data()) %>% 
        addTiles() %>% 
        addCircleMarkers()
    )
    
}

#**
#* Define server functions and render Map using Leaflet?:
#* input will include: query term, filter criteria

shinyApp(ui = ui, server = server)
