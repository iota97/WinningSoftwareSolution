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
	res = {'./verbali_interni_(minimo).tex': 10000, './verbali_esterni_(minimo).tex': 10000}
	for tex in glob.glob("./**/*.tex", recursive = True):
		min_g = 40
		if tex.startswith("./docs/template"):
			continue
		
		t = 0
		if tex.startswith("./docs/interni/verbali"):
			t = 1
		if tex.startswith("./docs/esterni/verbali"):
			t = 2

		stat = compile(tex)

		if stat != 0:
			print("[Failed]: errore compilazione: " + tex)
		else:
			# Questi sono stati redatti prima della scelta di utilizzare questo indice, non ha senso modificarli
			if tex.startswith("./docs/esterni/scelta_architettura") or tex.startswith("./docs/esterni/candidatura") or tex.startswith("./docs/esterni/ricerca_blockchain"):
				continue

			g = gulpease(tex[:-3]+"pdf")
			if g < min_g:
				print("[Failed]: indice di Gulpease troppo basso per " + tex + ": " + str(float("{:.2f}".format(g))))
			elif t == 0:
				res[tex] = g
			elif t == 1:
				res['./verbali_interni_(minimo).tex'] = min(res['./verbali_interni_(minimo).tex'], g)
			elif t == 2:
				res['./verbali_esterni_(minimo).tex'] = min(res['./verbali_esterni_(minimo).tex'], g)

	for key in res:
		print(os.path.basename(key)[:-4].capitalize().replace('_', ' ')+": "+str(float("{:.2f}".format(res[key]))))

def main():
	latexTest()

if __name__ == "__main__":
    main()