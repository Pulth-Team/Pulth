# Pulth App

Pulth app is a Independent Learning Web Application. This is achieved by various techniques trough out the app.

## Get Started

To make this application work on your local machine you need to configure environment variables. Here are scheme of environment variables.

```env
# Database URL (mongodb url with database name)
# example: mongodb+srv://username:password@cluster.url/db-local
DATABASE_URL=

# Deployment url
# This is used to determine what is our url based on others
# on local it should be http://localhost:3000
DEPLOYMENT_URL=

# Auth secret for encryption
NEXTAUTH_SECRET=

# This is used to determine where our auth callbacks are located
# on local it should be http://localhost:3000
NEXTAUTH_URL=

# Github client id and secret for signing in using github
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google Client id and secret for signing in using google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Analytics Id for tracking activities
# This should be empty on local
# because we dont want to track any activity on local
GOOGLE_ANALYTICS_ID=

# Algolia App Id and api key for using algolia
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=

# Algolia index name for determine which index are we searching in
ALGOLIA_INDEX_NAME=

# AWS access key to cdn
AWS_ACCESS_KEY_CDN=
AWS_SECRET_KEY_CDN=
AWS_S3_BUCKET=

# smtp.sendgrid.net
# Ports
# 25, 587 (for unencrypted/TLS connections)
# 465 (for SSL connections)

SMTP_API_USERNAME=
SMTP_API_KEY=
SMTP_HOST=
SMTP_PORT=


NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_API_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

```
