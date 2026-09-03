#!/usr/bin/env bash
set -euo pipefail
OUT=${1:-/root/gurl-migration-export}
mkdir -p "$OUT"
mysql --batch --raw wp_gurl -e 'SELECT keyword,url,title,timestamp,ip,clicks FROM yourls_url' | gzip -c > "$OUT/yourls_url.tsv.gz"
mysql --batch --raw wp_gurl -e 'SELECT option_name FROM yourls_options ORDER BY option_name' > "$OUT/options_names.txt"
sha256sum "$OUT"/* > "$OUT/SHA256SUMS"
