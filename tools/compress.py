#!/usr/bin/env python3

# Copyright 2021
# github.com/razaqq

import os
import sys
from argparse import ArgumentParser
from subprocess import Popen, PIPE


if __name__ == '__main__':
  parser = ArgumentParser(description='Converts png files to jpg in a directory recursively')
  parser.add_argument('-d', '--directory', dest='dir', required=True, help='In which directory to search for png files')
  parser.add_argument('-q', '--quality', dest='quality', default='-1', help='Which quality the jpg files should have (in percent)')
  parser.add_argument('-c', '--convert', dest='convert', help='ImageMagick convert binary path')
  parser.add_argument('--remove-png', action='store_true', dest='remove_png', help='Weather or not to remove png files')
  args = parser.parse_args()

  for root, dirs, files in os.walk(args.dir):
    for file in files:
      if file.endswith('.png'):
        before = os.path.join(root, file)
        after = os.path.join(root, f'{os.path.splitext(file)[0]}.jpg')
        print(f'Converting: {before}')

        quality = ['-quality', f'{args.quality}'] if args.quality != '-1' else []

        p = Popen([args.convert] + quality + [before, after], universal_newlines=True, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p.communicate()
        if p.returncode:
          print(stdout, stderr)
          sys.exit(1)

        if args.remove_png:
          os.remove(before)
