# NoteBoard Plus

NoteBoard Plus is a simple **serverless web application** built on **AWS**.  
It allows authenticated users to manage **notes** and **expenses**, and supports **file attachments** through pre-signed S3 URLs.

The project is deployed **manually (no CI/CD)** using the AWS Management Console and basic CLI commands — ideal for learning how to deploy a real-world serverless architecture step by step.

---

##  Features

- **Authentication** via Amazon Cognito Hosted UI  
- **CRUD operations** for Notes and Expenses (API Gateway + Lambda + DynamoDB)  
- Optional **file attachments** stored in a private S3 bucket with signed URLs  
- Static **frontend hosting** via S3 + CloudFront  
- Simple and lightweight HTML/CSS/JS frontend (no frameworks)  

---

## Architecture Overview

 
![Alt text for accessibility](./Project Architecture/aws.png)
