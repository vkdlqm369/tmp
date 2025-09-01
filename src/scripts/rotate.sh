#!/bin/bash

# 지원할 이미지 확장자 목록 (필요에 따라 추가 가능)
exts="jpg jpeg png gif bmp tif tiff"

for ext in $exts; do
  for img in *.$ext; do
    # 파일이 존재하지 않으면 건너뜀
    [ -e "$img" ] || continue

    # 가로/세로 비율 확인
    width=$(identify -format "%w" "$img")
    height=$(identify -format "%h" "$img")

    if [ "$width" -gt "$height" ]; then
      echo "회전: $img"
      mogrify -rotate 90 "$img"
    else
      echo "세로 이미지는 그대로 둠: $img"
    fi
  done
done

