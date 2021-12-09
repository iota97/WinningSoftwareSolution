#!/bin/bash

for f in $(find . -name '*.tex' -not -path './template/*'); do
	echo "Compiling $f";
	pdflatex -interaction=batchmode -halt-on-error $f > /dev/null;
	if [[ $? ]]; then
		echo "Compilation succeded";
	else
		echo "Compilation failed";
	fi
	echo;
done
