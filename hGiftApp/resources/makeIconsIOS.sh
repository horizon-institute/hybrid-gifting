#!/bin/bash
f=$(pwd)


sips --resampleWidth 60 "${f}/${1}" --out "${f}/ios/icon/icon-60.png"
sips --resampleWidth 120 "${f}/${1}" --out "${f}/ios/icon/icon-60@2x.png"
sips --resampleWidth 180 "${f}/${1}" --out "${f}/ios/icon/icon-60@3x.png"

sips --resampleWidth 76 "${f}/${1}" --out "${f}/ios/icon/icon-76.png"
sips --resampleWidth 152 "${f}/${1}" --out "${f}/ios/icon/icon-76@2x.png"

sips --resampleWidth 40 "${f}/${1}" --out "${f}/ios/icon/icon-40.png"
sips --resampleWidth 80 "${f}/${1}" --out "${f}/ios/icon/icon-40@2x.png"

sips --resampleWidth 57 "${f}/${1}" --out "${f}/ios/icon/icon-57.png"
sips --resampleWidth 114 "${f}/${1}" --out "${f}/ios/icon/icon-57@2x.png"

sips --resampleWidth 72 "${f}/${1}" --out "${f}/ios/icon/icon-72.png"
sips --resampleWidth 144 "${f}/${1}" --out "${f}/ios/icon/icon-72@2x.png"

sips --resampleWidth 29 "${f}/${1}" --out "${f}/ios/icon/icon-29.png"
sips --resampleWidth 58 "${f}/${1}" --out "${f}/ios/icon/icon-29@2x.png"
sips --resampleWidth 87 "${f}/${1}" --out "${f}/ios/icon/icon-29@3x.png"

sips --resampleWidth 50 "${f}/${1}" --out "${f}/ios/icon/icon-50.png"
sips --resampleWidth 100 "${f}/${1}" --out "${f}/ios/icon/icon-50@2x.png"

sips --resampleWidth 167 "${f}/${1}" --out "${f}/ios/icon/icon-83.5@2x.png"



sips --resampleWidth 120 "${f}/${1}" --out "${f}/ios/icon/icon-40@3x.png"
sips --resampleWidth 29 "${f}/${1}" --out "${f}/ios/icon/icon-small.png"
sips --resampleWidth 58 "${f}/${1}" --out "${f}/ios/icon/icon-small@2x.png"
sips --resampleWidth 87 "${f}/${1}" --out "${f}/ios/icon/icon-small@3x.png"
sips --resampleWidth 57 "${f}/${1}" --out "${f}/ios/icon/icon.png"
sips --resampleWidth 114 "${f}/${1}" --out "${f}/ios/icon/icon@2x.png"


sips --resampleWidth 1024 "${f}/${1}" --out "${f}/ios/icon/icon-1024.png"

