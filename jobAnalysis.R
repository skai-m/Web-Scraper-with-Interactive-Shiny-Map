# Author: Safiyyah Muhammad
# Last Updated: 3/8/2022

# Load packages
library(tidyverse)
# install.packages("cleanr")

# Load data
jobs <- read.csv("jobs.csv", na.strings = "null", skipNul = T)
View(jobs)
