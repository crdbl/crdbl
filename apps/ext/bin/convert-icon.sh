#!/bin/bash

convert ./assets/crdbl.svg -resize 16x16   ./public/icon/16.png
convert ./assets/crdbl.svg -resize 32x32   ./public/icon/32.png
convert ./assets/crdbl.svg -resize 48x48   ./public/icon/48.png
convert ./assets/crdbl.svg -resize 96x96   ./public/icon/96.png
convert ./assets/crdbl.svg -resize 128x128 ./public/icon/128.png
