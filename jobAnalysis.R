# Author: Safiyyah Muhammad
# Last Updated: 3/8/2022

# Load packages
# install.packages("cleanr")
#install.packages("janitor")

library(tidyverse)
library(cleanr)
library(janitor)

# Load data
jobs <- tibble(read.csv("jobs.csv", na.strings = "null", skipNul = T))
# Preview tibble
head(jobs)
str(jobs)


# Clean data
jobs <- jobs %>% 
  clean_names()

jobs <- jobs %>% 
  mutate(title = str_squish(title))
