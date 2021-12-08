#!/bin/bash

find . -name '*.tex' -not -path './template/*' -execdir pdflatex -interaction=batchmode -halt-on-error {} + || (echo; echo "Fallita la compilazione LaTex!")