#!/bin/bash
f=$(pwd)

sips --resampleWidth 36 "${f}/${1}" --out "${f}/android/icon/drawable-ldpi-icon.png"
sips --resampleWidth 48 "${f}/${1}" --out "${f}/android/icon/drawable-mdpi-icon.png"
sips --resampleWidth 72 "${f}/${1}" --out "${f}/android/icon/drawable-hdpi-icon.png"
sips --resampleWidth 96 "${f}/${1}" --out "${f}/android/icon/drawable-xhdpi-icon.png"
sips --resampleWidth 144 "${f}/${1}" --out "${f}/android/icon/drawable-xxhdpi-icon.png"
sips --resampleWidth 192 "${f}/${1}" --out "${f}/android/icon/drawable-xxxhdpi-icon.png"
