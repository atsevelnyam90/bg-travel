#!/bin/bash
# Контейнер АНХ эхлэхэд л ажиллана (postgres-data volume хоосон үед).
# Байгаа volume дээр ажиллахгүй тул setup-test-db.mjs нь ч мөн шалгадаг.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  SELECT 'CREATE DATABASE uizeniveelt_test'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'uizeniveelt_test')\gexec
EOSQL
