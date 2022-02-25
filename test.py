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
		if tex.startswith("./docs/template"):
			continue
		if tex.startswith("./docs/esterni"):
			min_g = 50

		stat = compile(tex)

		if stat != 0:
			succ = False
			print("Errore compilazione: " + tex)
		else:
			# Questi sono stati redatti prima della scelta di utilizzare questo indice, non ha senso modificarli
			if tex.startswith("./docs/esterni/scelta_architettura") or tex.startswith("./docs/esterni/candidatura") or tex.startswith("./docs/esterni/ricerca_blockchain"):
				continue

			g = gulpease(tex[:-3]+"pdf")
			if g < min_g:
				succ = False
				print("Indice di Gulpease troppo basso per " + tex + ": " + str(float("{:.2f}".format(g))))

	if (succ):
		print("Test LaTeX completati con successo")

def serverTest():
	cd = os.getcwd()
	stat = os.system("cd server; npm test &> /dev/null")
	if stat != 0:
		print("Falliti dei test sul server!")
	else:
		print("Test server completati con successo")

	os.system("cd " + cd)

def scriptTest():
	stat = os.system("cd script; python3.8 -m pytest test_sell.py &> /dev/null")
	if stat != 0:
		print("Falliti dei test sullo script!")
	else:
		print("Test script completati con successo")
	os.system("cd ..")

def main():
	latexTest()
	serverTest()
	scriptTest()

if __name__ == "__main__":
    main()