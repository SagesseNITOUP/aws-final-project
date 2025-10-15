# aws-final-project

# NoteBoardPlus

Web app for notes and expenses using AWS Cognito + API Gateway.

## Structure

- `Backend/ CRUD Operations` → Different Lambda Function
- `Frontend/ css/style.css & js/app.js` → The Frontend logic
- `Report` → Project report (pdf file)
- `Project Architecture` → Image aws.png is an image that shows the whole project architecture.



## Technologies Used

| Layer          | AWS Service             | Purpose                                               |
|---------------|--------------------------|-------------------------------------------------------|
| Frontend      | S3 + CloudFront          | Static hosting of the web app (HTML, JS, CSS)         |
| Authentication| Cognito (Hosted UI)      | User authentication & session token management        |
| Backend       | API Gateway + Lambda     | REST API exposing business logic                      |
| Database      | DynamoDB                 | Persistence for notes and expenses                    |
| Storage       | Private S3 bucket        | File attachments via pre-signed URLs                  |


## Project Overview

**Noteboard Plus** is a web-based application that allows users to:

- Create, list, and delete **notes**  
- Manage **expenses** with CRUD operations  
- Upload and store **attachments** using pre-signed URLs  
- Authenticate users using **Amazon Cognito Hosted UI**  
- Interact with backend APIs exposed through **API Gateway** connected to **Lambda functions**

All data is stored in **DynamoDB**, and the frontend is served globally through **CloudFront** backed by **S3**.



##  Manual Deployment Process (No CI/CD)

This project was deployed manually, following the required instructions:  
> “Sans CI/CD et sans CloudWatch, déploiement via la console ou script simple.”

### 1. Frontend Deployment (S3 + CloudFront)

1. **Create an S3 bucket**
   - Region: `eu-west-3`
   - Keep “Block all public access” checked

2. **Enable Static Website Hosting**
   - Set index document: `index.html`

3. **Upload Frontend Files**
   - Via Console or CLI:
     ```bash
     aws s3 sync . s3://your-bucket-name --delete
     ```

4. **Create a CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Viewer protocol: Redirect HTTP to HTTPS

5. **Note the CloudFront domain URL**
   - e.g. `https://d12345.cloudfront.net`

---

### 2. Cognito Authentication Setup

1. **Create a User Pool**
   - Sign-in: Email
   - Self sign-up: enabled or disabled as desired

2. **Create an App Client**
   - Uncheck “Generate client secret”
   - Enable:
     - `ALLOW_USER_PASSWORD_AUTH`
     - `ALLOW_USER_SRP_AUTH`
     - `ALLOW_REFRESH_TOKEN_AUTH`

3. **Configure Hosted UI**
   - Callback & logout URLs = CloudFront domain
   - Scopes: include `openid`

4. **Set up a Domain**
   - Example: `https://noteboardplus.auth.eu-west-3.amazoncognito.com`

5. **Update `app.js`**
   ```javascript
   const COGNITO_DOMAIN = "https://noteboardplus.auth.eu-west-3.amazoncognito.com";
   const CLIENT_ID = "YOUR_APP_CLIENT_ID";
   const REDIRECT_URI = "https://d12345.cloudfront.net";

