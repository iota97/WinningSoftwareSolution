#!/usr/bin/env python
# -*- coding: utf-8 -*-

import textract
import re
import sys
import os
import glob 
import shutil

def gulpease(nf):
	testo = textract.process(nf, method='pdftotext').decode("utf-8")

	parole  = len(re.findall(r'\w+', testo))
	lettere = len(re.findall(r'\w', testo))
	punti = len(re.findall('[.]+\s', testo))+len(re.findall('[;]+\s', testo)) - len(re.findall('[.]+\s+[.]', testo))

	indiceG = 89+((300*punti)-(10*lettere))/parole

	return indiceG


def compile(tex):
	cd = os.getcwd()
	stat = os.system("cd " + os.path.dirname(tex) + "; pdflatex -interaction=batchmode -halt-on-error " + os.path.basename(tex) + " > /dev/null")
	os.system("cd " + cd)
	return stat

def latexTest():
	for tex in glob.glob("./**/*.tex", recursive = True):
		min_gulpease = 40
		if tex.startswith("./docs/template"):
			continue
		if tex.startswith("./docs/esterni"):
			min_gulpease = 60

		stat = compile(tex)

		if stat != 0:
			print("Errore compilazione: " + tex)
		else:
			g = gulpease(tex[:-3]+"pdf")
			if g < min_gulpease:
				print("Indice di Gulpease troppo basso per " + tex + ": " + str(g))


def main():
	latexTest()

if __name__ == "__main__":
    main()