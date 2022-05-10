#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import shutil
import subprocess
import re
import os
import glob
import sys
import traceback


def version_from_name(filename):
    match = re.match(
        r'.+_v(?P<version>[0-9]+\.[0-9]+\.[0-9]+)\.\w{2,4}', filename)
    if match:
        return match.group('version')
    return ''


def version_from_src(filename):
    with open(filename, 'r') as f:
        finished = False
        line = 'asd'
        version = ''
        while not finished and line:
            line = f.readline()
            if(re.search(r'\\begin\{document\}', line)):
                finished = True
            else:
                match = re.search(
                    r'\\addversione\{(?P<version>[0-9]+\.[0-9]+\.[0-9]+)\}', line)
                if match:
                    version = match.group('version')
    return version


def compile(source, dest):
    cd = os.getcwd()
    dir, basename = os.path.split(source)
    out = f'{os.path.splitext(source)[0]}.pdf'

    subprocess.run(['pdflatex', '-interaction=nonstopmode',
                   '-halt-on-error', basename], cwd=dir, stdout=subprocess.DEVNULL)
    subprocess.run(['pdflatex', '-interaction=nonstopmode',
                   '-halt-on-error', basename], cwd=dir, stdout=subprocess.DEVNULL)

    if not os.path.exists(out):
        return False
    dest_dir = os.path.dirname(dest)
    if not os.path.exists(dest_dir):
        os.mkdir(dest_dir)
    shutil.move(out, dest)
    return os.path.exists(dest)


def get_dest_dir(source):
    dest_dir = os.path.dirname(source)
    dest_dir = dest_dir.replace('docs', 'public', 1)
    dest_dir = os.path.dirname(dest_dir)

    return dest_dir


def get_dest(file):
    _, basename = os.path.split(file)
    dest_dir = get_dest_dir(file)
    dest_name = os.path.splitext(basename)[0]
    version = version_from_src(file)
    if version:
        dest_name += f'_v{version}'
    dest_name += '.pdf'
    return os.path.join(dest_dir, dest_name)


def publish(file):
    if 'lettera' in file:
        return

    dest = get_dest(file)
    if os.path.exists(dest):
        if os.path.getctime(dest) < os.path.getmtime(file):
            os.remove(dest)
        else:
            return False

    for old in glob.glob(dest.split('_v')[0]+'_v*.pdf'):
        os.remove(old)

    compile(file, dest)
    return True


def main():
    succ = True
    for tex in glob.glob('docs/**/*.tex', recursive=True):

        if tex.startswith('docs/template'):
            continue
        try:
            if publish(tex):
                print(f'Pubblicato {tex}')
        except Exception as e:
            succ = False
            traceback.print_exc()

    return succ


if __name__ == '__main__':
    if main():
        sys.exit()
    else:
        sys.exit(1)
