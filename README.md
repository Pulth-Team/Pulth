# Pulth App

Pulth app is a Independent Learning Web Application. This is achieved by various techniques trough out the app.

## Get Started

To make this application work on your local machine you need to configure environment variables. Here are scheme of environment variables.

```dotenv
# Database URL (mongodb url with database name)
# example: mongodb+srv://username:password@cluster.url/db-local
DATABASE_URL=

# Deployment url
# This is used to determine what is our url based on others
# on local it should be http://localhost:3000
# on production it should be domain itself "www.pulth.com"
DEPLOYMENT_URL=http://localhost:3000

# Secret for authentication key Gen
NEXTAUTH_SECRET=very_long_secret

# This is used to determine where our auth callbacks are located
# on local it should be http://localhost:3000
# on production it should be domain itself "www.pulth.com"
NEXTAUTH_URL=http://localhost:3000

# Github credentials for OAuth or OpenID
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google credentials for OAuth or OpenID
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Analytics Id for tracking activities
# This should be empty on local
# because we dont want to track any activity on local
GOOGLE_ANALYTICS_ID=

# Algoli credentials for search engine in dashboard
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=

# Index name for articles
# on local: article_name_local
# on dev branch: article_name_dev
# on prod branch: article_name_prod
ALGOLIA_INDEX_NAME=


# AWS key & Secret for CDN management for images etc.
AWS_ACCESS_KEY_CDN=
AWS_SECRET_KEY_CDN=

# AWS S3 Bucket name
AWS_S3_BUCKET=



# SMTP Settings
# such as Username, apiKey, Host and port

# Host: smtp.sendgrid.net
#
# Ports are depended on the env
# in prod & dev it should be SSL
# while in local it should be unencrypted
# Ports:
	# 25, 587 (for unencrypted/TLS connections)
	# 465 (for SSL connections)

SMTP_API_USERNAME=
SMTP_API_KEY=
SMTP_HOST=
SMTP_PORT=


# Same ENV Variables
# but these variable re used in the client-side
# only change is adding a prefix "NEXT_PUBLIC_"

NEXT_PUBLIC_ALGOLIA_APP_ID=38I05VFR2D
NEXT_PUBLIC_ALGOLIA_API_KEY=015e129c66d5e77095ec0f58fcb4b816
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=article_name_local

NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```
