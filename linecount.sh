#!/bin/bash
find . -name "*.js" -type f -not -path "*/node_modules/*" | xargs wc -l
