#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import textract
import re
import sys
import os
import glob 

def gulpease(nf):
	testo = textract.process(nf, method='pdftotext').decode("utf-8")

	parole  = len(re.findall(r'\w+', testo))
	lettere = len(re.findall(r'\w', testo))
	punti = len(re.findall('[.;]+\s', testo))

	indiceG = 89+((300*punti)-(10*lettere))/parole

	return indiceG


def compile(tex):
	cd = os.getcwd()
	stat = os.system("cd " + os.path.dirname(tex) + "; pdflatex -interaction=batchmode -halt-on-error " + os.path.basename(tex) + " > /dev/null")
	os.system("cd " + cd)
	return stat

def latexTest():
	succ = True
	for tex in glob.glob("./**/*.tex", recursive = True):
		min_g = 40
		if tex.startswith("./template"):
			continue
		stat = compile(tex)

		if stat != 0:
			succ = False
			print("Errore compilazione: " + tex)
		else:
			g = gulpease(tex[:-3]+"pdf")
			if g < min_g:
				succ = False
				print("Indice di Gulpease troppo basso per " + tex + ": " + str(float("{:.2f}".format(g))))
			else:
				print(tex + ": " + str(float("{:.2f}".format(g))))

	if (succ):
		print("Test LaTeX completati con successo")

def main():
	latexTest()

if __name__ == "__main__":
    main()