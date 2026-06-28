# Backend remoto para CI/CD: el state vive en S3 con lock en DynamoDB.
# Los valores (bucket, key, region, dynamodb_table) se pasan en runtime con
# `terraform init -backend-config=...` desde el workflow de GitHub Actions.
#
# Para correr local sin backend remoto, comentá este bloque o usá
# `terraform init -backend=false`.
terraform {
  backend "s3" {}
}
