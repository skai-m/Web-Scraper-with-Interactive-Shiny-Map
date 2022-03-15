# Author: Safiyyah Muhammad
# Last Updated: 3/15/2022
# Name: "jobAnalysis.R"
#-------------------------------------------------------------------------------

# Load packages
# install.packages("cleanr")
# install.packages("janitor")

library(tidyverse)
library(cleanr)
library(janitor)
library(skimr)

#---Get Data----
input <- "jobs.csv"
jobs <- tibble(read.csv(input, na.strings = "null", skipNul = T))
input2 <- "us_cities.csv"
us_cities <- tibble(read.csv(input2))

# Preview tibble
head(jobs)
skim_without_charts(jobs)
# 94% of records have a completed city field
# 79% of records have a completed state field

#---Clean----
#**
#* 1. Standardize and clean variable names
#* 2. Check data types
#* 3. Data validation. Check data ranges
#* 4. Remove data with missing city/state fields from data frame
#* 5. Remove duplicates (if any)
#* 6. Add lat/long
#**

# 1. Standardize and clean variable names
jobs <- jobs %>% 
  clean_names()
us_cities <- us_cities %>% 
  clean_names()

str(jobs)

# 2.
jobs <- jobs %>% 
  mutate(pay_low = as.numeric(pay_low)) %>% 
  mutate(pay_high = as.numeric(pay_high)) %>% 
  mutate(pay_type = na_if(pay_type, "an")) %>% 
  mutate(pay_type = as.factor(pay_type))

# Leading zeros were dropped when transforming data frame to tibble and must either
# be restored or removed. [***Not Working***]

jobs <- jobs %>% 
  mutate(zipcode = as.character(zipcode)) %>% 
  mutate(zipcode = replace(zipcode, str_detect(zipcode, "^\\w{4}$") & !is.na(zipcode), paste0("0", zipcode)))

# 4. Remove records with NA in city OR state fields

jobs %>% 
  filter(!(is.na(city) | (is.na(state))))

# 6. Add lat/long

left_join(jobs, select(us_cities, accent_city, region, latitude, longitude), by = c("city" = "accent_city", "state" = "region")) %>% 
  filter(!is.na(latitude))
